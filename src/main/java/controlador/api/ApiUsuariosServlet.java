package controlador.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import datos.UsuarioDAO;
import modelo.Usuario;
import utilidades.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;

public class ApiUsuariosServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    //GET /api/usuarios, lista todos (solo admins)
    //GET /api/usuarios/{id}, perfil publico de un usuario
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String path_info = req.getPathInfo();
        UsuarioDAO dao   = new UsuarioDAO();

        //GET /api/usuarios o /api/usuarios/
        if(path_info == null || path_info.equals("/"))
        {
            String rol = (String) req.getAttribute("jwt_rol");

            if(!"admin".equals(rol))
            {
                JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "Acceso denegado");
                return;
            }

            List<Usuario> lista = dao.listar();
            ObjectMapper mapper = JsonUtil.getMapper();
            ArrayNode array = mapper.createArrayNode();

            for(Usuario u : lista)
                array.add(usuario_publico_node(u));

            JsonUtil.ok(res, array);
            return;
        }

        //GET /api/usuarios/{id}
        String id = path_info.substring(1);

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        Usuario u = dao.busca_id(id);

        if(u == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Usuario no encontrado");
            return;
        }

        JsonUtil.ok(res, usuario_publico_node(u));
    }

    //PUT /api/usuarios/{id}, actualiza el perfil (solo el propio usuario)
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);
        req.setCharacterEncoding("UTF-8");

        String path_info = req.getPathInfo();

        if(path_info == null || path_info.equals("/"))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Se requiere un id de usuario");
            return;
        }

        String id = path_info.substring(1);

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        String id_usuario_autenticado = (String) req.getAttribute("jwt_userId");
        String rol = (String) req.getAttribute("jwt_rol");

        if(!id.equals(id_usuario_autenticado) && !"admin".equals(rol))
        {
            JsonUtil.error(res, HttpServletResponse.SC_FORBIDDEN, "No tienes permiso para actualizar este perfil");
            return;
        }

        Map<String, Object> datos = JsonUtil.parsea_body(req);
        String biografia = JsonUtil.campo_string(datos, "biografia");
        String foto_perfil = JsonUtil.campo_string(datos, "foto_perfil");

        UsuarioDAO dao = new UsuarioDAO();
        boolean actualizado = dao.actualizar(id, biografia, foto_perfil);

        if(actualizado)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Perfil actualizado correctamente");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Usuario no encontrado o sin cambios");
    }

    // DELETE /api/usuarios/{id}, solo admins
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
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Se requiere un id de usuario");
            return;
        }

        String id = path_info.substring(1);

        if(!JsonUtil.es_objectid_valido(id))
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Id invalido");
            return;
        }

        UsuarioDAO dao  = new UsuarioDAO();
        boolean eliminado = dao.eliminar(id);

        if(eliminado)
        {
            ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
            nodo.put("mensaje", "Usuario eliminado");
            JsonUtil.ok(res, nodo);
        }

        else
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Usuario no encontrado");
    }

    private ObjectNode usuario_publico_node(Usuario u)
    {
        ObjectMapper mapper = JsonUtil.getMapper();
        ObjectNode nodo = mapper.createObjectNode();

        nodo.put("id", u.get_id());
        nodo.put("nombre_usuario", u.get_nombre_usuario());
        nodo.put("email", u.get_email());
        nodo.put("foto_perfil", u.get_foto_perfil());
        nodo.put("biografia", u.get_biografia());
        nodo.put("karma", u.get_karma());
        nodo.put("rol", u.get_rol());
        nodo.put("creado_en", u.get_creado_en() != null ? u.get_creado_en().toString() : null);

        return nodo;
    }
}