package controlador;

import datos.UsuarioDAO;
import modelo.Usuario;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;

//AUN ME FALTA USAR JWT debo de investigarlo mas xd

@WebServlet("/perfil-setup")
@MultipartConfig(fileSizeThreshold = 1024 * 1024, maxFileSize = 5 * 1024 * 1024, maxRequestSize = 10 * 1024 * 1024)
//Si el archivo pesa menos de 1 MB se mantiene en ram si no se pasa a disco
//5 MB tamaño maximo de foto
//10 MB tamaño total contando los caracteres de la biografia

public class ServletPerfilSetup extends HttpServlet
{
    private static final long serialVersionUID = 1L;

    //Ruta de imagen por defecto
    private static final String FOTO_DEFAULT = "imagenes/no_foto.png";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {
        //Verifica que se tengan los datos anteriores
        HttpSession sesion = req.getSession(false);

        if(sesion == null || sesion.getAttribute("reg_nombre_usuario") == null || sesion.getAttribute("reg_email") == null)
        {
            res.sendRedirect("registro.jsp");
            return;
        }

        req.getRequestDispatcher("perfil-setup.jsp").forward(req, res);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws ServletException, IOException
    {

        req.setCharacterEncoding("UTF-8");

        //Recupera datos de la sesion anterior
        HttpSession sesion = req.getSession(false);

        if(sesion == null || sesion.getAttribute("reg_nombre_usuario") == null || sesion.getAttribute("reg_email") == null)
        {
            res.sendRedirect("registro.jsp");
            return;
        }

        String nombre_usuario = (String) sesion.getAttribute("reg_nombre_usuario");
        String email = (String) sesion.getAttribute("reg_email");
        String contrasena = (String) sesion.getAttribute("reg_contrasena");

        //Lee biografia
        String biografia = req.getParameter("biografia");

        if(biografia != null)
            biografia = biografia.trim();

        //Lee foto de perfil
        String fotoPerfil = FOTO_DEFAULT;

        try
        {
            Part parteFoto = req.getPart("foto_perfil");

            if(parteFoto != null && parteFoto.getSize() > 0)
            {
                String contentType = parteFoto.getContentType();

                if(contentType != null && contentType.startsWith("image/"))
                {
                    try(InputStream is = parteFoto.getInputStream())
                    {
                        byte[] bytes = is.readAllBytes();

                        //Guarda como cadena en Base64
                        fotoPerfil = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(bytes);
                    }
                }
            }
        }

        catch(Exception ex)
        {
            //Si falla la lectura de la foto usa la iamgen por default
            System.err.println("Advertencia: no se pudo leer la foto de perfil, se usara la imagen por defecto" + ex.getMessage());
            fotoPerfil = FOTO_DEFAULT;
        }

        //Crea y guarda el usuario en mongodb
        try
        {
            Usuario nuevo = new Usuario(nombre_usuario, email, contrasena);

            nuevo.set_foto_perfil(fotoPerfil);

            if(biografia != null && !biografia.isEmpty())
                nuevo.set_biografia(biografia);

            UsuarioDAO dao = new UsuarioDAO();

            //Evita duplicados
            if(dao.busca_email(email) != null)
            {
                req.setAttribute("errorPerfil", "Ya existe una cuenta con ese correo electrónico.");
                req.getRequestDispatcher("perfil-setup.jsp").forward(req, res);
                return;
            }

            String id_generado = dao.insertar(nuevo);
            System.out.println("Nuevo usuario registrado con id: " + id_generado);

            //Limpia datos temporales
            sesion.removeAttribute("reg_nombre_usuario");
            sesion.removeAttribute("reg_email");
            sesion.removeAttribute("reg_contrasena");

            //Redirige al login
            res.sendRedirect("login.jsp?registro=ok");
        }

        catch(Exception ex)
        {
            ex.printStackTrace();
            req.setAttribute("errorPerfil", "Error al registrar el usuario. Intenta de nuevo.");
            req.getRequestDispatcher("perfil-setup.jsp").forward(req, res);
        }
    }
}