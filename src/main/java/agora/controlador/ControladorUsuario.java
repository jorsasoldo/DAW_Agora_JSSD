package agora.controlador;

import agora.modelo.Usuario;
import agora.repositorio.RepositorioUsuario;

import jakarta.servlet.http.HttpServletRequest;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class ControladorUsuario
{
    private final RepositorioUsuario repositorio_usuario;
    private final MongoTemplate mongo_template;

    public ControladorUsuario(RepositorioUsuario repositorio_usuario, MongoTemplate mongo_template)
    {
        this.repositorio_usuario = repositorio_usuario;
        this.mongo_template = mongo_template;
    }

    @GetMapping
    public ResponseEntity<?> listar(HttpServletRequest req)
    {
        String rol = (String)req.getAttribute("jwt_rol");

        if(!"admin".equals(rol))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Acceso denegado"));

        List<Usuario> lista = repositorio_usuario.findAll();

        return ResponseEntity.ok(lista.stream().map(this::usuario_publico).toList());
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscar_por_nombre(@RequestParam String nombre_usuario)
    {
        return repositorio_usuario.findByNombreUsuario(nombre_usuario).map(u -> ResponseEntity.ok(usuario_publico(u))).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable String id)
    {
        Usuario u = repositorio_usuario.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        return ResponseEntity.ok(usuario_publico(u));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Map<String, String> body, HttpServletRequest req)
    {
        String idAutenticado = (String)req.getAttribute("jwt_usuario_id");
        String rol =(String) req.getAttribute("jwt_rol");

        if(!id.equals(idAutenticado) && !"admin".equals(rol))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No tienes permiso para actualizar este perfil"));

        String biografia  = body.get("biografia");
        String foto_perfil = body.get("foto_perfil");

        Query q = Query.query(Criteria.where("_id").is(new ObjectId(id)));
        Update u = new Update().set("biografia", biografia).set("foto_perfil", foto_perfil);

        long modificado = mongo_template.updateFirst(q, u, Usuario.class).getModifiedCount();

        if(modificado > 0)
            return ResponseEntity.ok(Map.of("mensaje", "Perfil actualizado correctamente"));

        else
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado o sin cambios"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id, HttpServletRequest req)
    {
        String rol = (String)req.getAttribute("jwt_rol");

        if(!"admin".equals(rol))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Acceso denegado"));

        if(!repositorio_usuario.existsById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario no encontrado"));

        repositorio_usuario.deleteById(id);

        return ResponseEntity.ok(Map.of("mensaje", "Usuario eliminado"));
    }

    private Map<String, Object> usuario_publico(Usuario u)
    {
        return Map.of("id", u.getId() != null ? u.getId() : "", "nombre_usuario", u.getNombreUsuario() != null ? u.getNombreUsuario() : "",  "email", u.getEmail() != null ? u.getEmail() : "", "foto_perfil", u.getFotoPerfil() != null ? u.getFotoPerfil() : "", "biografia", u.getBiografia() != null ? u.getBiografia() : "", "karma", u.getKarma(), "rol", u.getRol() != null ? u.getRol() : "", "creado_en", u.getCreadoEn() != null ? u.getCreadoEn().toString() : "");
    }
}