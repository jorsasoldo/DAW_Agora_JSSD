package controlador;

import datos.UsuarioDAO;
import modelo.Usuario;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

@WebServlet("/registro")
public class ServletRegistro extends HttpServlet
{

    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        req.getRequestDispatcher("registro.jsp").forward(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {

        req.setCharacterEncoding("UTF-8");

        String nombre_usuario = req.getParameter("nombre_usuario");
        String email          = req.getParameter("email");
        String contrasena     = req.getParameter("contrasena");
        String contrasena2    = req.getParameter("contrasena2");

        if(nombre_usuario == null || nombre_usuario.trim().isEmpty() || email == null || email.trim().isEmpty() || contrasena == null || contrasena.isEmpty() || contrasena2 == null || contrasena2.isEmpty())
        {
            req.setAttribute("errorRegistro", "Por favor completa todos los campos.");
            req.getRequestDispatcher("registro.jsp").forward(req, res);
            return;
        }

        if(!contrasena.equals(contrasena2))
        {
            req.setAttribute("errorRegistro", "Las contraseñas no coinciden.");
            req.getRequestDispatcher("registro.jsp").forward(req, res);
            return;
        }

        if(contrasena.length() < 6)
        {
            req.setAttribute("errorRegistro", "La contraseña debe tener al menos 6 caracteres.");
            req.getRequestDispatcher("registro.jsp").forward(req, res);
            return;
        }

        UsuarioDAO dao = new UsuarioDAO();

        if (dao.busca_email(email.trim()) != null)
        {
            req.setAttribute("errorRegistro", "Ya existe una cuenta con ese correo electrónico.");
            req.getRequestDispatcher("registro.jsp").forward(req, res);
            return;
        }

        try
        {
            Usuario nuevo = new Usuario(nombre_usuario.trim(), email.trim(), contrasena);

            String id_generado = dao.insertar(nuevo);

            System.out.println("Nuevo usuario registrado con id: " + id_generado);

            res.sendRedirect("login.jsp?registro=ok");

        }

        catch(Exception ex)
        {
            ex.printStackTrace();

            req.setAttribute("errorRegistro", "Error al registrar el usuario. Intenta de nuevo.");
            req.getRequestDispatcher("registro.jsp").forward(req, res);
        }
    }
}