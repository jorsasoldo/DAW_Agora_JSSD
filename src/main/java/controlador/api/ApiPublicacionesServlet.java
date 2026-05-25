package controlador.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import datos.ComunidadDAO;
import datos.PublicacionDAO;
import modelo.Comunidad;
import modelo.Publicacion;
import utilidades.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class ApiPublicacionesServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String path_info = req.getPathInfo();
        PublicacionDAO dao = new PublicacionDAO();

        //GET /api/publicaciones o ?comunidad=X o ?autor=X
        if(path_info == null || path_info.equals("/"))
        {
            String id_comunidad = req.getParameter("comunidad");
            String id_autor = req.getParameter("autor");

            List<Publicacion> lista;

            if(id_comunidad != null && JsonUtil.es_objectid_valido(id_comunidad))
                lista = dao.listar_por_comunidad(id_comunidad);

            else if(id_autor != null && JsonUtil.es_objectid_valido(id_autor))
                lista = dao.listar_por_autor(id_autor);

            else
                lista = dao.listar();

            JsonUtil.ok(res, publicaciones_array_node(lista));
            return;
        }

        //GET /api/publicaciones/{id}
        String[] partes = path_info.substring(1).split("/");
        String id = partes[0];

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        Publicacion p = dao.busca_id(id);

        if(p == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Publicacion no encontrada");
            return;
        }

        JsonUtil.ok(res, publicacion_node(p));
    }

    //POST, crear, fijar, bloquear
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);
        req.setCharacterEncoding("UTF-8");

        String path_info = req.getPathInfo();
        String usuario_id = (String) req.getAttribute("jwt_userId");
        String rol = (String) req.getAttribute("jwt_rol");
        PublicacionDAO dao = new PublicacionDAO();

        //POST /api/publicaciones, crear
        if (path_info == null || path_info.equals("/"))
        {
            Map<String, Object> datos = JsonUtil.parsea_body(req);
            String titulo = JsonUtil.campo_string(datos, "titulo");
            String tipo = JsonUtil.campo_string(datos, "tipo");
            String contenido = JsonUtil.campo_string(datos, "contenido");
            String enlace = JsonUtil.campo_string(datos, "enlace");
            String url_imagen = JsonUtil.campo_string(datos, "url_imagen");
            String id_comunidad = JsonUtil.campo_string(datos, "comunidad");
            String etiqueta = JsonUtil.campo_string(datos, "etiqueta");

            if(titulo == null || titulo.isBlank())
            {
                JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo titulo es obligatorio");
                return;
            }

            if(tipo == null || tipo.isBlank())
            {
                JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo tipo es obligatorio");
                return;
            }

            if(!JsonUtil.es_objectid_valido(id_comunidad))
            {
                JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo comunidad es obligatorio y debe ser un id valido");
                return;
            }

            ComunidadDAO c_dao = new ComunidadDAO();
            Comunidad comunidad = c_dao.busca_id(id_comunidad);

            if(comunidad == null)
            {
                JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "La comunidad especificada no existe");
                return;
            }

            Publicacion nueva = new Publicacion(titulo, tipo, usuario_id, id_comunidad);
            nueva.set_contenido(contenido);
            nueva.set_enlace(enlace);
            nueva.set_url_imagen(url_imagen);
            nueva.set_etiqueta(etiqueta);

            String id_generado = dao.insertar(nueva);

            res.setStatus(HttpServletResponse.SC_CREATED);
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Publicacion creada");
            nodo.put("id", id_generado);
            JsonUtil.ok(res, nodo);
            return;
        }

        //Rutas /{id}/accion
        String[] partes = path_info.substring(1).split("/");
        String id = partes[0];

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        if(partes.length < 2)
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Accion no especificada");
            return;
        }

        String accion = partes[1];
        Publicacion p = dao.busca_id(id);

        if(p == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Publicacion no encontrada");
            return;
        }

        ComunidadDAO c_dao = new ComunidadDAO();
        Comunidad comunidad = c_dao.busca_id(p.get_comunidad());

        boolean es_moderador = comunidad != null && comunidad.get_moderadores() != null && comunidad.get_moderadores().contains(usuario_id);

        if(!"admin".equals(rol) && !es_moderador)
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Solo moderadores o admin pueden realizar esta accion");
            return;
        }

        //POST /api/publicaciones/{id}/fijar
        if("fijar".equals(accion))
        {
            boolean nuevoEstado = !p.is_fijada();
            dao.set_fijada(id, nuevoEstado);
            String msg = nuevoEstado ? "Publicacion fijada" : "Publicacion desfijada";

            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", msg);
            nodo.put("fijada",  nuevoEstado);
            JsonUtil.ok(res, nodo);
            return;
        }

        //POST /api/publicaciones/{id}/bloquear
        if("bloquear".equals(accion))
        {
            boolean nuevoEstado = !p.is_bloqueada();
            dao.set_bloqueada(id, nuevoEstado);
            String msg = nuevoEstado ? "Comentarios bloqueados" : "Comentarios desbloqueados";

            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje",   msg);
            nodo.put("bloqueada", nuevoEstado);
            JsonUtil.ok(res, nodo);
            return;
        }

        JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Accion desconocida: " + accion);
    }

    //PUT /api/publicaciones/{id}, editar (solo al autor)
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

        PublicacionDAO dao = new PublicacionDAO();
        Publicacion p = dao.busca_id(id);

        if(p == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Publicacion no encontrada");
            return;
        }

        if(!p.get_autor().equals(id_usuario) && !"admin".equals(rol))
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Solo el autor puede editar esta publicacion");
            return;
        }

        Map<String, Object> datos = JsonUtil.parsea_body(req);
        String titulo = JsonUtil.campo_string(datos, "titulo");
        String contenido = JsonUtil.campo_string(datos, "contenido");
        String etiqueta = JsonUtil.campo_string(datos, "etiqueta");

        if(titulo == null || titulo.isBlank())
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo titulo no puede estar vacio");
            return;
        }

        boolean ok = dao.actualizar(id, titulo, contenido, etiqueta);

        if(ok)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Publicacion actualizada");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "No se pudo actualizar");
    }

    //DELETE /api/publicaciones/{id}, eliminar (por autor, moderador o admin)
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

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

        PublicacionDAO dao = new PublicacionDAO();
        Publicacion p = dao.busca_id(id);

        if(p == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Publicacion no encontrada");
            return;
        }

        ComunidadDAO c_dao = new ComunidadDAO();
        Comunidad comunidad = c_dao.busca_id(p.get_comunidad());

        boolean es_moderador = comunidad != null && comunidad.get_moderadores() != null && comunidad.get_moderadores().contains(id_usuario);

        boolean es_autor = p.get_autor().equals(id_usuario);

        if(!es_autor && !es_moderador && !"admin".equals(rol))
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "No tienes permiso para eliminar esta publicacion");
            return;
        }

        boolean ok = dao.eliminar(id);

        if(ok)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Publicacion eliminada");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "No se pudo eliminar");
    }

    private ArrayNode publicaciones_array_node(List<Publicacion> lista)
    {
        ObjectMapper mapper = JsonUtil.getMapper();
        ArrayNode array = mapper.createArrayNode();

        for(Publicacion p : lista)
            array.add(publicacion_node(p));

        return array;
    }

    private ObjectNode publicacion_node(Publicacion p)
    {
        ObjectMapper mapper = JsonUtil.getMapper();
        ObjectNode nodo = mapper.createObjectNode();

        nodo.put("id", p.get_id());
        nodo.put("titulo", p.get_titulo());
        nodo.put("tipo", p.get_tipo());
        nodo.put("contenido", p.get_contenido());
        nodo.put("enlace", p.get_enlace());
        nodo.put("url_imagen", p.get_url_imagen());
        nodo.put("autor", p.get_autor());
        nodo.put("comunidad", p.get_comunidad());
        nodo.put("puntaje_votos", p.get_puntaje_votos());
        nodo.put("votos_positivos", p.get_votos_positivos());
        nodo.put("votos_negativos", p.get_votos_negativos());
        nodo.put("total_comentarios", p.get_total_comentarios());
        nodo.put("etiqueta", p.get_etiqueta());
        nodo.put("fijada", p.is_fijada());
        nodo.put("bloqueada", p.is_bloqueada());
        nodo.put("creado_en", p.get_creado_en() != null ? p.get_creado_en().toString() : null);
        nodo.put("actualizado_en", p.get_actualizado_en() != null ? p.get_actualizado_en().toString() : null);

        return nodo;
    }
}