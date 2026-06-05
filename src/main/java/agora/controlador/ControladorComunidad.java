package agora.controlador;

import agora.modelo.Comunidad;
import agora.modelo.Usuario;

import agora.repositorio.RepositorioComunidad;
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

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comunidades")
public class ControladorComunidad
{
    private final RepositorioComunidad repositorio_comunidad;
    private final RepositorioUsuario repositorio_usuario;
    private final MongoTemplate mongo_template;

    public ControladorComunidad(RepositorioComunidad repositorio_comunidad, RepositorioUsuario repositorio_usuario, MongoTemplate mongo_template)
    {
        this.repositorio_comunidad = repositorio_comunidad;
        this.repositorio_usuario = repositorio_usuario;
        this.mongo_template = mongo_template;
    }

    @GetMapping
    public ResponseEntity<?> listar()
    {
        List<Comunidad> lista = repositorio_comunidad.findAll();

        return ResponseEntity.ok(lista.stream().map(this::nodo_comunidad).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable String id, HttpServletRequest req)
    {
        Comunidad c = repositorio_comunidad.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidad no encontrada"));

        String id_usuario = (String)req.getAttribute("jwt_usuario_id");

        boolean suscrito = false;

        if(id_usuario != null)
        {
            Usuario u = repositorio_usuario.findById(id_usuario).orElse(null);
            suscrito = u != null && u.getComunidadesSuscritas() != null && u.getComunidadesSuscritas().contains(id);
        }

        Map<String, Object> datos = new java.util.HashMap<>(nodo_comunidad(c));
        datos.put("suscrito", suscrito);

        return ResponseEntity.ok(datos);
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String nombre = (String)body.get("nombre");
        String descripcion = (String)body.get("descripcion");
        boolean es_privada = "true".equalsIgnoreCase(String.valueOf(body.getOrDefault("es_privada", "false")));

        if(nombre == null || nombre.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El campo nombre es obligatorio"));

        if(repositorio_comunidad.findByNombre(nombre).isPresent())
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ya existe una comunidad con ese nombre"));

        Comunidad nueva = new Comunidad(nombre, id_usuario);
        nueva.setDescripcion(descripcion);
        nueva.setEsPrivada(es_privada);
        nueva.setModeradores(Collections.singletonList(id_usuario));
        nueva.setCreadoEn(new Date());
        nueva.setTotalMiembros(0);

        repositorio_comunidad.save(nueva);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Comunidad creada", "id", nueva.getId()));
    }

    @PostMapping("/{id}/suscribir")
    public ResponseEntity<?> suscribir(@PathVariable String id, HttpServletRequest req)
    {
        String id_usuario = (String) req.getAttribute("jwt_usuario_id");
        repositorio_comunidad.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidad no encontrada"));

        Usuario u = repositorio_usuario.findById(id_usuario).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if(u.getComunidadesSuscritas() != null && u.getComunidadesSuscritas().contains(id))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Ya estas suscrito a esta comunidad"));

        Query qu = Query.query(Criteria.where("_id").is(new ObjectId(id_usuario)));
        mongo_template.updateFirst(qu, new Update().addToSet("comunidades_suscritas", new ObjectId(id)), Usuario.class);

        Query qc = Query.query(Criteria.where("_id").is(new ObjectId(id)));
        mongo_template.updateFirst(qc, new Update().inc("total_miembros", 1), Comunidad.class);

        return ResponseEntity.ok(Map.of("mensaje", "Suscripcion exitosa"));
    }


    @PostMapping("/{id}/desuscribir")
    public ResponseEntity<?> desuscribir(@PathVariable String id, HttpServletRequest req)
    {
        String id_usuario = (String) req.getAttribute("jwt_usuario_id");
        repositorio_comunidad.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidad no encontrada"));

        Usuario u = repositorio_usuario.findById(id_usuario).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if(u.getComunidadesSuscritas() == null || !u.getComunidadesSuscritas().contains(id))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "No estas suscrito a esta comunidad"));

        Query qu = Query.query(Criteria.where("_id").is(new ObjectId(id_usuario)));
        mongo_template.updateFirst(qu, new Update().pull("comunidades_suscritas", new ObjectId(id)), Usuario.class);

        Query qc = Query.query(Criteria.where("_id").is(new ObjectId(id)));
        mongo_template.updateFirst(qc, new Update().inc("total_miembros", -1), Comunidad.class);

        return ResponseEntity.ok(Map.of("mensaje", "Desuscripcion exitosa"));
    }

    @PostMapping("/{id}/moderadores")
    public ResponseEntity<?> agregar_moderador(@PathVariable String id, @RequestBody Map<String, String> body, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String rol = (String)req.getAttribute("jwt_rol");

        Comunidad c = repositorio_comunidad.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidad no encontrada"));

        boolean es_moderador = c.getModeradores() != null && c.getModeradores().contains(id_usuario);

        if(!"admin".equals(rol) && !es_moderador)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Solo un moderador o admin puede agregar moderadores"));

        String id_nuevo_mod = body.get("usuario_id");

        if(id_nuevo_mod == null || !id_nuevo_mod.matches("[0-9a-fA-F]{24}"))
            return ResponseEntity.badRequest().body(Map.of("error", "Id invalido"));

        Query q = Query.query(Criteria.where("_id").is(id));
        mongo_template.updateFirst(q, new Update().addToSet("moderadores", new ObjectId(id_nuevo_mod)), Comunidad.class);

        return ResponseEntity.ok(Map.of("mensaje", "Moderador agregado"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Map<String, String> body, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String rol = (String)req.getAttribute("jwt_rol");

        Comunidad c = repositorio_comunidad.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidad no encontrada"));

        boolean es_moderador = c.getModeradores() != null && c.getModeradores().contains(id_usuario);

        if(!"admin".equals(rol) && !es_moderador)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Solo un moderador o admin puede edita_comentario la comunidad"));

        Query q = Query.query(Criteria.where("_id").is(id));
        Update u = new Update().set("descripcion", body.get("descripcion")).set("banner", body.get("banner")).set("icono", body.get("icono"));

        long modificado = mongo_template.updateFirst(q, u, Comunidad.class).getModifiedCount();

        if(modificado > 0)
            return ResponseEntity.ok(Map.of("mensaje", "Comunidad actualizada"));

        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "No se pudo actualizar"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id, HttpServletRequest req)
    {
        String rol = (String)req.getAttribute("jwt_rol");

        if(!"admin".equals(rol))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Acceso denegado"));

        if(!repositorio_comunidad.existsById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Comunidad no encontrada"));

        repositorio_comunidad.deleteById(id);

        return ResponseEntity.ok(Map.of("mensaje", "Comunidad eliminada"));
    }

    @GetMapping("/{id}/miembros")
    public ResponseEntity<?> miembros(@PathVariable String id)
    {
        repositorio_comunidad.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comunidad no encontrada"));

        Query q = Query.query(Criteria.where("comunidades_suscritas").is(new ObjectId(id)));
        List<Usuario> usuarios = mongo_template.find(q, Usuario.class);

        List<Map<String, Object>> resultado = usuarios.stream().map(u -> Map.<String, Object>of("id", u.getId() != null ? u.getId() : "", "nombre_usuario", u.getNombreUsuario() != null ? u.getNombreUsuario() : "", "foto_perfil", u.getFotoPerfil() != null ? u.getFotoPerfil() : "")).toList();

        return ResponseEntity.ok(resultado);
    }

    private Map<String, Object> nodo_comunidad(Comunidad c)
    {
        return Map.of("id", c.getId() != null ? c.getId() : "", "nombre", c.getNombre() != null ? c.getNombre() : "", "descripcion", c.getDescripcion() != null ? c.getDescripcion() : "", "banner", c.getBanner() != null ? c.getBanner() : "", "icono", c.getIcono() != null ? c.getIcono() : "", "total_miembros", c.getTotalMiembros(), "creado_por", c.getCreadoPor() != null ? c.getCreadoPor() : "", "es_privada", c.getEsPrivada(), "moderadores", c.getModeradores() != null ? c.getModeradores() : List.of(), "reglas", c.getReglas() != null ? c.getReglas() : List.of());
    }
}