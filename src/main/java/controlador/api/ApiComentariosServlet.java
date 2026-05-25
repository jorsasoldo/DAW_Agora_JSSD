package controlador.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import datos.ComentarioDAO;
import datos.ComunidadDAO;
import datos.PublicacionDAO;
import modelo.Comentario;
import modelo.Comunidad;
import modelo.Publicacion;
import utilidades.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class ApiComentariosServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String path_info = req.getPathInfo();
        ComentarioDAO dao = new ComentarioDAO();

        //GET /api/comentarios?publicacion={id}
        if (path_info == null || path_info.equals("/"))
        {
            String id_publicacion = req.getParameter("publicacion");

            if (id_publicacion == null || !JsonUtil.es_objectid_valido(id_publicacion))
            {
                JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Parametro publicacion obligatorio y debe ser un id valido");
                return;
            }

            List<Comentario> lista = dao.listar_por_publicacion(id_publicacion);
            JsonUtil.ok(res, comentarios_array_node(lista));
            return;
        }

        // ET /api/comentarios/{id}
        String id = path_info.substring(1).split("/")[0];

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        Comentario c = dao.busca_id(id);

        if(c == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comentario no encontrado");
            return;
        }

        JsonUtil.ok(res, comentario_node(c));
    }

    //POST, crea comentario
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);
        req.setCharacterEncoding("UTF-8");

        String id_usuario = (String) req.getAttribute("jwt_userId");

        Map<String, Object> datos = JsonUtil.parsea_body(req);
        String id_publicacion = JsonUtil.campo_string(datos, "publicacion_id");
        String contenido = JsonUtil.campo_string(datos, "contenido");
        String id_padre = JsonUtil.campo_string(datos, "padre_id");

        if(!JsonUtil.es_objectid_valido(id_publicacion))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo publicacion_id es obligatorio");
            return;
        }

        if (contenido == null || contenido.isBlank())
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo contenido es obligatorio");
            return;
        }

        //Verifica que la publicacion existe y no está bloqueada
        PublicacionDAO p_dao = new PublicacionDAO();
        Publicacion pub = p_dao.busca_id(id_publicacion);

        if(pub == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Publicacion no encontrada");
            return;
        }

        if(pub.is_bloqueada())
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Esta publicacion tiene los comentarios bloqueados");
            return;
        }

        //Construye el hilo de ancestros
        ComentarioDAO dao = new ComentarioDAO();
        List<String> hilo = new ArrayList<>();

        if(id_padre != null && !id_padre.isBlank() && JsonUtil.es_objectid_valido(id_padre))
        {
            Comentario padre = dao.busca_id(id_padre);

            if(padre != null)
            {
                if (padre.get_hilo() != null)
                    hilo.addAll(padre.get_hilo());

                hilo.add(id_padre);
            }
        }

        Comentario nuevo = new Comentario(id_publicacion, id_usuario, contenido);
        nuevo.set_padre_id((id_padre != null && !id_padre.isBlank()) ? id_padre : null);
        nuevo.set_hilo(hilo);

        String id_generado = dao.insertar(nuevo);

        //Incrementa el contador de comentarios en la publicacion
        p_dao.incrementa_total_comentarios(id_publicacion, 1);

        res.setStatus(HttpServletResponse.SC_CREATED);

        ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
        nodo.put("mensaje", "Comentario creado");
        nodo.put("id", id_generado);
        JsonUtil.ok(res, nodo);
    }

    //PUT /api/comentarios/{id}, edita (solo por el autor)
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);
        req.setCharacterEncoding("UTF-8");

        String path_info = req.getPathInfo();
        String id_usuario = (String) req.getAttribute("jwt_userId");
        String rol = (String) req.getAttribute("jwt_rol");

        if(path_info == null || path_info.equals("/"))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Se requiere un id");
            return;
        }

        String id = path_info.substring(1).split("/")[0];

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        ComentarioDAO dao = new ComentarioDAO();
        Comentario c = dao.busca_id(id);

        if(c == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comentario no encontrado");
            return;
        }

        if(!c.get_autor().equals(id_usuario) && !"admin".equals(rol))
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Solo el autor puede editar este comentario");
            return;
        }

        Map<String, Object> datos = JsonUtil.parsea_body(req);
        String contenido = JsonUtil.campo_string(datos, "contenido");

        if(contenido == null || contenido.isBlank())
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo contenido no puede estar vacio");
            return;
        }

        boolean ok = dao.actualizar_contenido(id, contenido);

        if(ok)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Comentario actualizado");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "No se pudo actualizar");
    }

    //DELETE /api/comentarios/{id}, eliminacion suave (por autor, moderador o admin)
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String path_info  = req.getPathInfo();
        String id_usuario = (String) req.getAttribute("jwt_userId");
        String rol = (String) req.getAttribute("jwt_rol");

        if(path_info == null || path_info.equals("/"))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Se requiere un id");
            return;
        }

        String id = path_info.substring(1).split("/")[0];

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        ComentarioDAO dao = new ComentarioDAO();
        Comentario c = dao.busca_id(id);

        if(c == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comentario no encontrado");
            return;
        }

        boolean es_autor = c.get_autor().equals(id_usuario);

        if(!es_autor && !"admin".equals(rol))
        {
            //Comprueba si es moderador de la comunidad de la publicacion
            PublicacionDAO p_dao = new PublicacionDAO();
            Publicacion pub = p_dao.busca_id(c.get_publicacion_id());
            boolean es_moderador = false;

            if(pub != null)
            {
                ComunidadDAO c_Dao = new ComunidadDAO();
                Comunidad comunidad = c_Dao.busca_id(pub.get_comunidad());
                es_moderador = comunidad != null && comunidad.get_moderadores() != null && comunidad.get_moderadores().contains(id_usuario);
            }

            if(!es_moderador)
            {
                JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "No tienes permiso para eliminar este comentario");
                return;
            }
        }

        boolean ok = dao.eliminar_suave(id);

        if(ok)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Comentario eliminado");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "No se pudo eliminar");
    }

    private ArrayNode comentarios_array_node(List<Comentario> lista)
    {
        ObjectMapper mapper = JsonUtil.getMapper();
        ArrayNode array = mapper.createArrayNode();

        for(Comentario c : lista)
            array.add(comentario_node(c));

        return array;
    }

    private ObjectNode comentario_node(Comentario c)
    {
        ObjectMapper mapper = JsonUtil.getMapper();
        ObjectNode nodo = mapper.createObjectNode();

        //Si esta eliminado se oculta el contenido y el autor
        String contenido_visible = c.is_eliminado() ? "[comentario eliminado]" : c.get_contenido();

        nodo.put("id", c.get_id());
        nodo.put("publicacion_id", c.get_publicacion_id());

        if(c.is_eliminado())
            nodo.putNull("autor");

        else
            nodo.put("autor", c.get_autor());

        nodo.put("contenido", contenido_visible);
        nodo.put("padre_id", c.get_padre_id());

        //Hilo como array json
        ArrayNode hilo_node = mapper.createArrayNode();

        if(c.get_hilo() != null)
            c.get_hilo().forEach(hilo_node::add);

        nodo.set("hilo", hilo_node);

        nodo.put("puntaje_votos", c.get_puntaje_votos());
        nodo.put("eliminado", c.is_eliminado());
        nodo.put("creado_en", c.get_creado_en() != null ? c.get_creado_en().toString() : null);
        nodo.put("actualizado_en", c.get_actualizado_en() != null ? c.get_actualizado_en().toString() : null);

        return nodo;
    }
}