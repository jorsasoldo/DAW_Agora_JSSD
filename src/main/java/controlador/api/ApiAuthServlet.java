package controlador.api;

import com.fasterxml.jackson.databind.node.ObjectNode;
import datos.UsuarioDAO;
import modelo.Usuario;
import org.mindrot.jbcrypt.BCrypt;
import seguridad.JwtUtil;
import utilidades.JsonUtil;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.Map;

public class ApiAuthServlet extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    private static final String COOKIE_JWT = "jwt_token";
    private static final int COOKIE_DURACION = 8 * 60 * 60; //8 horas en segundos

    //GET /api/auth/yo, perfil del usuario autenticado
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);

        String path_info = req.getPathInfo();

        if(!"/yo".equals(path_info))
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Ruta no encontrada");
            return;
        }

        String user_id = (String) req.getAttribute("jwt_userId");
        String email = (String) req.getAttribute("jwt_email");
        String nombre_usuario = (String) req.getAttribute("jwt_nombreUsuario");
        String rol = (String) req.getAttribute("jwt_rol");

        UsuarioDAO dao = new UsuarioDAO();
        Usuario u = dao.busca_id(user_id);

        if(u == null)
        {
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Usuario no encontrado");
            return;
        }

        ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
        nodo.put("id", u.get_id());
        nodo.put("nombre_usuario", nombre_usuario);
        nodo.put("email", email);
        nodo.put("foto_perfil", u.get_foto_perfil());
        nodo.put("biografia", u.get_biografia());
        nodo.put("karma", u.get_karma());
        nodo.put("rol", rol);
        nodo.put("creado_en", u.get_creado_en() != null ? u.get_creado_en().toString() : null);

        JsonUtil.ok(res, nodo);
    }

    //POST /api/auth/login, login
    //POST /api/auth/logout, logout
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        JsonUtil.cabeceras(res);
        req.setCharacterEncoding("UTF-8");

        String path_info = req.getPathInfo();

        if("/login".equals(path_info))
            maneja_login(req, res);

        else if("/logout".equals(path_info))
            maneja_logout(req, res);

        else
            JsonUtil.error(res, HttpServletResponse.SC_NOT_FOUND, "Ruta no encontrada");
    }

    private void maneja_login(HttpServletRequest req, HttpServletResponse res) throws IOException
    {
        Map<String, Object> datos = JsonUtil.parsea_body(req);
        String email = JsonUtil.campo_string(datos, "email");
        String contrasena = JsonUtil.campo_string(datos, "contrasena");

        if(email == null || email.isBlank() || contrasena == null || contrasena.isBlank())
        {
            JsonUtil.error(res, HttpServletResponse.SC_BAD_REQUEST, "Los campos email y contrasena son obligatorios");
            return;
        }

        UsuarioDAO dao = new UsuarioDAO();
        Usuario usuario = dao.busca_email(email.trim());

        if(usuario == null || !BCrypt.checkpw(contrasena, usuario.get_contrasena()))
        {
            JsonUtil.error(res, HttpServletResponse.SC_UNAUTHORIZED, "Credenciales incorrectas");
            return;
        }

        String token = JwtUtil.genera_token(usuario.get_id(), usuario.get_email(), usuario.get_nombre_usuario(), usuario.get_rol());

        Cookie cookie_jwt = new Cookie(COOKIE_JWT, token);
        cookie_jwt.setHttpOnly(true);
        cookie_jwt.setPath("/");
        cookie_jwt.setMaxAge(COOKIE_DURACION);
        res.addCookie(cookie_jwt);

        ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
        nodo.put("mensaje", "Login exitoso");
        nodo.put("token", token);
        nodo.put("id", usuario.get_id());
        nodo.put("nombre_usuario", usuario.get_nombre_usuario());
        nodo.put("email", usuario.get_email());
        nodo.put("rol", usuario.get_rol());

        JsonUtil.ok(res, nodo);
    }

    private void maneja_logout(HttpServletRequest req, HttpServletResponse res) throws IOException
    {
        Cookie cookie_expirada = new Cookie(COOKIE_JWT, "");
        cookie_expirada.setMaxAge(0);
        cookie_expirada.setPath("/");
        res.addCookie(cookie_expirada);

        ObjectNode nodo = JsonUtil.getMapper().createObjectNode();
        nodo.put("mensaje", "Sesion cerrada");
        JsonUtil.ok(res, nodo);
    }
}