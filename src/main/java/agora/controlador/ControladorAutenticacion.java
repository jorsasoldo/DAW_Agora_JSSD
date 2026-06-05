package agora.controlador;

import agora.modelo.Usuario;
import agora.servicio.ServicioAutenticacion;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class ControladorAutenticacion
{
    private static final int COOKIE_DURACION = 8 * 60 * 60;
    private final ServicioAutenticacion servicio_autenticacion;

    public ControladorAutenticacion(ServicioAutenticacion servicio_autenticacion)
    {
        this.servicio_autenticacion = servicio_autenticacion;
    }

    @GetMapping("/yo")
    public ResponseEntity<?> yo(HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String email = (String)req.getAttribute("jwt_email");
        String nombre_usuario = (String)req.getAttribute("jwt_nombre_usuario");
        String rol = (String)req.getAttribute("jwt_rol");

        //Busca el usuario en mongo para encontrar su foto de perfil
        Usuario u = servicio_autenticacion.busca_por_id(id_usuario);

        String foto_perfil = (u != null && u.getFotoPerfil() != null) ? u.getFotoPerfil() : "";

        return ResponseEntity.ok(Map.of("id", id_usuario, "nombre_usuario", nombre_usuario, "email", email, "rol", rol, "foto_perfil", foto_perfil));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body, HttpServletResponse res) {
        String email = body.get("email");
        String contrasena = body.get("contrasena");

        if (email == null || email.isBlank() || contrasena == null || contrasena.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Los campos email y contrasena son obligatorios"));

        ServicioAutenticacion.resultado_login result = servicio_autenticacion.login(email, contrasena);

        Cookie jwt_cookie = new Cookie("jwt_token", result.token());
        jwt_cookie.setHttpOnly(true);
        jwt_cookie.setPath("/");
        jwt_cookie.setMaxAge(COOKIE_DURACION);
        res.addCookie(jwt_cookie);

        Usuario u = result.usuario();

        String foto_perfil = u.getFotoPerfil() != null ? u.getFotoPerfil() : "";

        return ResponseEntity.ok(Map.of("mensaje", "Login exitoso", "token", result.token(), "id", u.getId(), "nombre_usuario", u.getNombreUsuario(), "email", u.getEmail(), "rol", u.getRol(), "foto_perfil", foto_perfil));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse res)
    {
        Cookie expirada = new Cookie("jwt_token", "");
        expirada.setMaxAge(0);
        expirada.setPath("/");
        res.addCookie(expirada);

        return ResponseEntity.ok(Map.of("mensaje", "Sesion cerrada"));
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registro(@RequestBody Map<String, String> body, HttpServletResponse res)
    {
        String nombreUsuario = body.get("nombreUsuario");
        String email = body.get("email");
        String contrasena = body.get("contrasena");

        if(nombreUsuario == null || nombreUsuario.isBlank() || email == null || email.isBlank() || contrasena == null || contrasena.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "Todos los campos son obligatorios"));

        ServicioAutenticacion.resultado_registro result = servicio_autenticacion.registro(nombreUsuario, email, contrasena);
        agora.modelo.Usuario u = result.usuario();

        Cookie jwt_cookie = new Cookie("jwt_token", result.token());
        jwt_cookie.setHttpOnly(true);
        jwt_cookie.setPath("/");
        jwt_cookie.setMaxAge(COOKIE_DURACION);
        res.addCookie(jwt_cookie);

        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Registro exitoso");
        respuesta.put("token", result.token());
        respuesta.put("id", u.getId());
        respuesta.put("nombreUsuario", u.getNombreUsuario());
        respuesta.put("email", u.getEmail());
        respuesta.put("rol", u.getRol() != null ? u.getRol() : "usuario");

        return ResponseEntity.status(HttpStatus.CREATED).body(respuesta);
    }


}