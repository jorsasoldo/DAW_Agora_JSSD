package controlador;

import datos.UsuarioDAO;
import modelo.Usuario;
import org.mindrot.jbcrypt.BCrypt;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/login")
public class ServletLogin extends HttpServlet
{

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        req.getRequestDispatcher("login.jsp").forward(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {

        req.setCharacterEncoding("UTF-8");

        String email = req.getParameter("email");
        String contrasena = req.getParameter("contrasena");

        //Validacion basica
        if(email == null || email.trim().isEmpty() || contrasena == null || contrasena.isEmpty())
        {
            req.setAttribute("errorLogin", "Por favor completa todos los campos.");
            req.getRequestDispatcher("login.jsp").forward(req, res);
            return;
        }

        UsuarioDAO dao = new UsuarioDAO();
        Usuario usuario = dao.busca_email(email.trim());

        //Verifica que el correo exista y que la contrasena coincida con el hash
        if(usuario == null || !BCrypt.checkpw(contrasena, usuario.get_contrasena()))
        {
            req.setAttribute("errorLogin", "Usuario o contraseña incorrectos.");
            req.getRequestDispatcher("login.jsp").forward(req, res);
            return;
        }

        System.out.println("Login exitoso para: " + usuario.get_email());

        req.setAttribute("mensajeLogin", "¡Bienvenido, " + usuario.get_nombre_usuario() + "! (login exitoso)");
        req.getRequestDispatcher("login.jsp").forward(req, res);
    }
}