package controlador;

import datos.UsuarioDAO;

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
        String email = req.getParameter("email");
        String contrasena = req.getParameter("contrasena");
        String contrasena2 = req.getParameter("contrasena2");

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

        if(dao.busca_email(email.trim()) != null)
        {
            req.setAttribute("errorRegistro", "Ya existe una cuenta con ese correo electrónico.");
            req.getRequestDispatcher("registro.jsp").forward(req, res);
            return;
        }

        //Guardar datos en la sesion para usarlos en la siguiente
        HttpSession sesion = req.getSession();
        sesion.setAttribute("reg_nombre_usuario", nombre_usuario.trim());
        sesion.setAttribute("reg_email", email.trim());
        sesion.setAttribute("reg_contrasena", contrasena);

        //Redirige al setup del perfil
        res.sendRedirect("perfil-setup");
    }
}