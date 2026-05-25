package controlador.api;

import com.fasterxml.jackson.databind.node.ObjectNode;
import datos.ComentarioDAO;
import datos.PublicacionDAO;
import datos.UsuarioDAO;
import datos.VotoDAO;
import modelo.Comentario;
import modelo.Publicacion;
import modelo.Voto;
import utilidades.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.Map;

public class ApiVotosServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    //GET /api/votos?objetivo={id}&usuario={id}
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String id_objetivo = req.getParameter("objetivo");
        String id_usuario_param = req.getParameter("usuario");

        //Si no se pasa el parametro usuario se usa el usuario autenticado
        if(id_usuario_param == null)
            id_usuario_param = (String)req.getAttribute("jwt_userId");

        if(!JsonUtil.es_objectid_valido(id_objetivo) || !JsonUtil.es_objectid_valido(id_usuario_param))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Parametros objetivo y usuario son obligatorios y deben ser ids validos");
            return;
        }

        VotoDAO dao = new VotoDAO();
        Voto v = dao.busca_por_usuario_y_objetivo(id_usuario_param, id_objetivo);

        ObjectNode nodo = JsonUtil.getMapper().createObjectNode();

        if(v == null)
        {
            nodo.put("existe", false);
            nodo.put("valor", 0);
        }

        else
        {
            nodo.put("existe", true);
            nodo.put("id", v.get_id());
            nodo.put("usuario_id", v.get_usuario_id());
            nodo.put("objetivo_id", v.get_objetivo_id());
            nodo.put("tipo_objetivo", v.get_tipo_objetivo());
            nodo.put("valor", v.get_valor());
        }

        JsonUtil.ok(res, nodo);
    }

    //POST, votar, cambiar voto, retirar voto
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);
        req.setCharacterEncoding("UTF-8");

        String id_votante = (String)req.getAttribute("jwt_userId");

        Map<String, Object> datos = JsonUtil.parsea_body(req);
        String id_objetivo = JsonUtil.campo_string(datos, "objetivo_id");
        String tipo_objetivo = JsonUtil.campo_string(datos, "tipo_objetivo");
        String valor_str = JsonUtil.campo_string(datos, "valor");

        if(!JsonUtil.es_objectid_valido(id_objetivo))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo objetivo_id es obligatorio");
            return;
        }

        if(!"publicacion".equals(tipo_objetivo) && !"comentario".equals(tipo_objetivo))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo tipo_objetivo debe ser publicacion o comentario");
            return;
        }

        int valor;

        try
        {
            valor = Integer.parseInt(valor_str);
        }

        catch(NumberFormatException e)
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo valor debe ser 1, -1 o 0");
            return;
        }

        if(valor != 1 && valor != -1 && valor != 0)
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo valor debe ser 1, -1 o 0");
            return;
        }

        String id_autor_objetivo = obtiene_autor_objetivo(id_objetivo, tipo_objetivo);

        if(id_autor_objetivo == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "El objetivo votado no existe");
            return;
        }

        if(id_votante.equals(id_autor_objetivo))
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "No puedes votar tus propios contenidos");
            return;
        }

        VotoDAO voto_dao = new VotoDAO();
        Voto voto_existente = voto_dao.busca_por_usuario_y_objetivo(id_votante, id_objetivo);

        ObjectNode nodo = JsonUtil.getMapper().createObjectNode();

        if(voto_existente == null)
        {
            if (valor == 0)
            {
                nodo.put("mensaje", "No hay voto que retirar");
                JsonUtil.ok(res, nodo);
                return;
            }

            Voto nuevo = new Voto(id_votante, id_objetivo, tipo_objetivo, id_autor_objetivo, valor);
            voto_dao.insertar(nuevo);
            aplica_puntaje_objetivo(id_objetivo, tipo_objetivo, valor);

            UsuarioDAO u_dao = new UsuarioDAO();
            u_dao.incrementa_karma(id_autor_objetivo, valor);

            nodo.put("mensaje", "Voto registrado");
            nodo.put("valor", valor);
            JsonUtil.ok(res, nodo);
        }

        else
        {
            int valor_anterior = voto_existente.get_valor();

            if (valor == 0 || valor == valor_anterior)
            {
                //Retira voto
                voto_dao.eliminar_por_usuario_y_objetivo(id_votante, id_objetivo);
                aplica_puntaje_objetivo(id_objetivo, tipo_objetivo, -valor_anterior);

                UsuarioDAO u_dao = new UsuarioDAO();
                u_dao.incrementa_karma(id_autor_objetivo, -valor_anterior);

                nodo.put("mensaje", "Voto retirado");
                nodo.put("valor", 0);
                JsonUtil.ok(res, nodo);
            }

            else
            {
                //Cambia puntuacion
                int delta = valor - valor_anterior;

                voto_dao.eliminar_por_usuario_y_objetivo(id_votante, id_objetivo);
                Voto nuevo = new Voto(id_votante, id_objetivo, tipo_objetivo, id_autor_objetivo, valor);
                voto_dao.insertar(nuevo);
                aplica_puntaje_objetivo(id_objetivo, tipo_objetivo, delta);

                UsuarioDAO u_dao = new UsuarioDAO();
                u_dao.incrementa_karma(id_autor_objetivo, delta);

                nodo.put("mensaje", "Voto actualizado");
                nodo.put("valor", valor);
                JsonUtil.ok(res, nodo);
            }
        }
    }

    private String obtiene_autor_objetivo(String id_objetivo, String tipo_objetivo)
    {
        if("publicacion".equals(tipo_objetivo))
        {
            PublicacionDAO dao = new PublicacionDAO();
            Publicacion p = dao.busca_id(id_objetivo);
            return (p != null) ? p.get_autor() : null;
        }

        else
        {
            ComentarioDAO dao = new ComentarioDAO();
            Comentario c = dao.busca_id(id_objetivo);
            return (c != null) ? c.get_autor() : null;
        }
    }

    private void aplica_puntaje_objetivo(String id_objetivo, String tipo_objetivo, int delta)
    {
        if("publicacion".equals(tipo_objetivo))
        {
            PublicacionDAO dao = new PublicacionDAO();
            dao.incrementa_puntaje_votos(id_objetivo, delta);

            if(delta > 0)
                dao.incrementa_votos_positivos(id_objetivo, delta);

            else if(delta < 0)
                dao.incrementa_votos_negativos(id_objetivo, Math.abs(delta));
        }

        else
        {
            ComentarioDAO dao = new ComentarioDAO();
            dao.incrementa_puntaje_votos(id_objetivo, delta);
        }
    }
}