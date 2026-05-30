package agora.servicio;

import agora.modelo.Usuario;
import agora.repositorio.RepositorioUsuario;
import agora.seguridad.JwtUtil;

import org.mindrot.jbcrypt.BCrypt;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;

@Service
public class ServicioAutenticacion
{
    private final RepositorioUsuario repositorio_usuario;
    private final JwtUtil jwt_util;

    public ServicioAutenticacion(RepositorioUsuario repositorio_usuario, JwtUtil jwt_util)
    {
        this.repositorio_usuario = repositorio_usuario;
        this.jwt_util = jwt_util;
    }

    public record resultado_login(String token, Usuario usuario)
    {

    }

    public resultado_login login(String email, String contrasena)
    {
        Usuario usuario = repositorio_usuario.findByEmail(email.trim()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas"));

        if(!BCrypt.checkpw(contrasena, usuario.getContrasena()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas");

        String token = jwt_util.genera_token(usuario.getId(), usuario.getEmail(), usuario.getNombreUsuario(), usuario.getRol());

        return new resultado_login(token, usuario);
    }

    public record resultado_registro(String token, Usuario usuario) {}

    public resultado_registro registro(String nombreUsuario, String email, String contrasena)
    {
        if(repositorio_usuario.findByEmail(email.trim()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El correo ya está registrado");

        String hash = BCrypt.hashpw(contrasena, BCrypt.gensalt());

        Usuario nuevo = new Usuario();
        nuevo.setNombreUsuario(nombreUsuario.trim());
        nuevo.setEmail(email.trim());
        nuevo.setContrasena(hash);
        nuevo.setRol("usuario");
        nuevo.setKarma(0);
        nuevo.setCreadoEn(new Date());

        Usuario guardado = repositorio_usuario.save(nuevo);

        String token = jwt_util.genera_token(guardado.getId(), guardado.getEmail(), guardado.getNombreUsuario(), guardado.getRol());

        return new resultado_registro(token, guardado);
    }

    public Usuario busca_por_id(String id)
    {
        return repositorio_usuario.findById(id).orElse(null);
    }
}