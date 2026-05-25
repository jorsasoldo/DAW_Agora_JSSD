package controlador.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import datos.ComunidadDAO;
import datos.UsuarioDAO;
import modelo.Comunidad;
import utilidades.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.*;

public class ApiComunidadesServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String path_info = req.getPathInfo();
        ComunidadDAO dao = new ComunidadDAO();

        //GET /api/comunidades
        if(path_info == null || path_info.equals("/"))
        {
            List<Comunidad> lista = dao.listar();
            ObjectMapper mapper = JsonUtil.getMapper();
            ArrayNode array = mapper.createArrayNode();

            for(Comunidad c : lista)
                array.add(comunidad_node(c));

            JsonUtil.ok(res, array);
            return;
        }

        //GET /api/comunidades/{id}
        String[] partes = path_info.substring(1).split("/");
        String id = partes[0];

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        Comunidad c = dao.busca_id(id);

        if(c == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comunidad no encontrada");
            return;
        }

        JsonUtil.ok(res, comunidad_node(c));
    }

    //POST, crear, suscribirse, desuscribirse, moderadores
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);
        req.setCharacterEncoding("UTF-8");

        String path_info = req.getPathInfo();
        String id_usuario = (String) req.getAttribute("jwt_userId");
        String rol = (String) req.getAttribute("jwt_rol");
        ComunidadDAO dao = new ComunidadDAO();

        //POST /api/comunidades, crear
        if(path_info == null || path_info.equals("/"))
        {
            Map<String, Object> datos = JsonUtil.parsea_body(req);
            String nombre = JsonUtil.campo_string(datos, "nombre");
            String descripcion = JsonUtil.campo_string(datos, "descripcion");
            String es_privada  = JsonUtil.campo_string(datos, "es_privada");

            if(nombre == null || nombre.isBlank())
            {
                JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "El campo nombre es obligatorio");
                return;
            }

            if(dao.busca_nombre(nombre) != null)
            {
                JsonUtil.error(res, HttpServletResponse.SC_CONFLICT, "Ya existe una comunidad con ese nombre");
                return;
            }

            Comunidad nueva = new Comunidad(nombre, id_usuario);
            nueva.set_descripcion(descripcion);
            nueva.set_es_privada("true".equalsIgnoreCase(es_privada));
            nueva.set_moderadores(Collections.singletonList(id_usuario));

            String id_generado = dao.insertar(nueva);

            res.setStatus(HttpServletResponse.SC_CREATED);
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Comunidad creada");
            nodo.put("id", id_generado);

            JsonUtil.ok(res, nodo);
            return;
        }

        //Rutas con /{id}/accion
        String[] partes = path_info.substring(1).split("/");
        String id_comunidad = partes[0];

        if(!JsonUtil.es_objectid_valido(id_comunidad))
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

        //POST /api/comunidades/{id}/suscribir
        if ("suscribir".equals(accion))
        {
            Comunidad c = dao.busca_id(id_comunidad);

            if(c == null)
            {
                JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comunidad no encontrada");
                return;
            }

            UsuarioDAO u_dao = new UsuarioDAO();
            modelo.Usuario u = u_dao.busca_id(id_usuario);

            if(u.get_comunidades_suscritas() != null && u.get_comunidades_suscritas().contains(id_comunidad))
            {
                JsonUtil.error(res, HttpServletResponse.SC_CONFLICT, "Ya estas suscrito a esta comunidad");
                return;
            }

            dao.incrementa_miembros(id_comunidad, 1);

            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Suscripcion exitosa.");
            JsonUtil.ok(res, nodo);
            return;
        }

        //POST /api/comunidades/{id}/desuscribir
        if("desuscribir".equals(accion))
        {
            Comunidad c = dao.busca_id(id_comunidad);

            if(c == null)
            {
                JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comunidad no encontrada");
                return;
            }

            dao.incrementa_miembros(id_comunidad, -1);

            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Desuscripcion exitosa");

            JsonUtil.ok(res, nodo);
            return;
        }

        //POST /api/comunidades/{id}/moderadores
        if("moderadores".equals(accion))
        {
            Comunidad c = dao.busca_id(id_comunidad);

            if(c == null)
            {
                JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comunidad no encontrada");
                return;
            }

            boolean es_moderador = c.get_moderadores() != null && c.get_moderadores().contains(id_usuario);

            if(!"admin".equals(rol) && !es_moderador)
            {
                JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Solo un moderador o admin puede agregar moderadores");
                return;
            }

            Map<String, Object> datos = JsonUtil.parsea_body(req);
            String id_nuevo_mod = JsonUtil.campo_string(datos, "usuario_id");

            if(!JsonUtil.es_objectid_valido(id_nuevo_mod))
            {
                JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
                return;
            }

            dao.agregar_moderador(id_comunidad, id_nuevo_mod);

            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Moderador agregado");

            JsonUtil.ok(res, nodo);
            return;
        }

        JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Accion desconocida: " + accion);
    }

    //PUT /api/comunidades/{id}, actualiza descripcion, banner, icono
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

        ComunidadDAO dao = new ComunidadDAO();
        Comunidad c = dao.busca_id(id);

        if(c == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comunidad no encontrada");
            return;
        }

        boolean es_moderador = c.get_moderadores() != null && c.get_moderadores().contains(id_usuario);

        if(!"admin".equals(rol) && !es_moderador)
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Solo un moderador o admin puede editar la comunidad");
            return;
        }

        Map<String, Object> datos = JsonUtil.parsea_body(req);
        String descripcion = JsonUtil.campo_string(datos, "descripcion");
        String banner = JsonUtil.campo_string(datos, "banner");
        String icono = JsonUtil.campo_string(datos, "icono");

        boolean ok = dao.actualizar(id, descripcion, banner, icono);

        if(ok)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Comunidad actualizada");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "No se pudo actualizar");
    }

    //DELETE /api/comunidades/{id}, solo para admins
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String rol = (String) req.getAttribute("jwt_rol");

        if(!"admin".equals(rol))
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Acceso denegado");
            return;
        }

        String path_info = req.getPathInfo();

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

        ComunidadDAO dao = new ComunidadDAO();
        boolean ok = dao.eliminar(id);

        if(ok)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Comunidad eliminada");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Comunidad no encontrada");
    }

    private ObjectNode comunidad_node(Comunidad c)
    {
        ObjectMapper mapper = JsonUtil.getMapper();
        ObjectNode nodo = mapper.createObjectNode();

        nodo.put("id", c.get_id());
        nodo.put("nombre", c.get_nombre());
        nodo.put("descripcion", c.get_descripcion());
        nodo.put("banner", c.get_banner());
        nodo.put("icono", c.get_icono());
        nodo.put("total_miembros", c.get_total_miembros());
        nodo.put("creado_por", c.get_creado_por());
        nodo.put("creado_en", c.get_creado_en() != null ? c.get_creado_en().toString() : null);
        nodo.put("es_privada", c.is_es_privada());

        //Moderadores como array json
        ArrayNode mods_node = mapper.createArrayNode();

        if(c.get_moderadores() != null)
            c.get_moderadores().forEach(mods_node::add);

        nodo.set("moderadores", mods_node);

        //Reglas como array de objetos json
        ArrayNode reglas_node = mapper.createArrayNode();

        if(c.get_reglas() != null)
        {
            for(Map<String, String> r : c.get_reglas())
            {
                ObjectNode regla = mapper.createObjectNode();
                regla.put("titulo", r.get("titulo"));
                regla.put("descripcion", r.get("descripcion"));
                reglas_node.add(regla);
            }
        }

        nodo.set("reglas", reglas_node);

        return nodo;
    }
}