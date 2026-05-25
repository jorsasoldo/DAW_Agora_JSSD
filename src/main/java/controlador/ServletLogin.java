package controlador;

import datos.UsuarioDAO;
import modelo.Usuario;
import org.mindrot.jbcrypt.BCrypt;
import seguridad.JwtUtil;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

public class ServletLogin extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    //Nombre de la cookie donde se guarda el JWT
    private static final String COOKIE_JWT = "jwt_token";

    //Duracion de la cookie de 8 horas como el token
    private static final int COOKIE_DURACION_MAX = 8 * 60 * 60;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        //Si ya tiene un JWT valido en la cookie se redirige directo al inicio
        String tokenExistente = lee_cookie_jwt(req);

        if(tokenExistente != null)
        {
            try
            {
                JwtUtil.valida_token(tokenExistente);
                res.sendRedirect("inicio");
                return;
            }

            catch(Exception ex)
            {
                elimina_cookie_jwt(res);
            }
        }

        //Muestra el mensaje de registro exitoso si viene del flujo de registro
        String param = req.getParameter("registro");

        if("ok".equals(param))
            req.setAttribute("mensajeLogin", "¡Registro completado! Ya puedes iniciar sesión.");

        req.getRequestDispatcher("login.jsp").forward(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        req.setCharacterEncoding("UTF-8");

        String email = req.getParameter("email");
        String contrasena = req.getParameter("contrasena");

        if (email == null || email.trim().isEmpty() || contrasena == null || contrasena.isEmpty())
        {
            req.setAttribute("errorLogin", "Por favor completa todos los campos.");
            req.getRequestDispatcher("login.jsp").forward(req, res);
            return;
        }

        UsuarioDAO dao = new UsuarioDAO();
        Usuario usuario = dao.busca_email(email.trim());

        //Verifica que el correo exista y que la contraseña coincida con el hash
        if (usuario == null || !BCrypt.checkpw(contrasena, usuario.get_contrasena()))
        {
            req.setAttribute("errorLogin", "Usuario o contraseña incorrectos.");
            req.getRequestDispatcher("login.jsp").forward(req, res);
            return;
        }

        System.out.println("Login exitoso para: " + usuario.get_email());

        //Genera el JWT con los datos del usuario autenticado
        String token = JwtUtil.genera_token(usuario.get_id(), usuario.get_email(), usuario.get_nombre_usuario(), usuario.get_rol());

        //Guarda el token en una cookie httponly la cual no es accesible desde javascript y la vuelve disponible en toda la app
        Cookie cookieJWT = new Cookie(COOKIE_JWT, token);
        cookieJWT.setHttpOnly(true);
        cookieJWT.setPath("/");
        cookieJWT.setMaxAge(COOKIE_DURACION_MAX);
        //cookieJWT.setSecure(true); //en caso de usar https
        res.addCookie(cookieJWT);

        res.sendRedirect("inicio");
    }

    private String lee_cookie_jwt(HttpServletRequest req)
    {
        if(req.getCookies() == null)
            return null;

        for(Cookie c : req.getCookies())
        {
            if(COOKIE_JWT.equals(c.getName()))
                return c.getValue();
        }

        return null;
    }

    private void elimina_cookie_jwt(HttpServletResponse res)
    {
        Cookie expirada = new Cookie(COOKIE_JWT,"");
        expirada.setMaxAge(0);
        expirada.setPath("/");
        res.addCookie(expirada);
    }
}