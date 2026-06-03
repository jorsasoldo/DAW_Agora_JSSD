package agora.controlador;

import agora.modelo.Comentario;
import agora.modelo.Comunidad;
import agora.modelo.Publicacion;

import agora.repositorio.RepositorioComunidad;
import agora.repositorio.RepositorioPublicacion;

import agora.servicio.ServicioComentario;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comentarios")
public class ControladorComentario
{
    private final ServicioComentario servicio_comentario;
    private final RepositorioPublicacion repositorio_publicacion;
    private final RepositorioComunidad repositorio_comunidad;
    private final MongoTemplate mongo_template;

    public ControladorComentario(ServicioComentario servicio_comentario, RepositorioPublicacion repositorio_publicacion, RepositorioComunidad repositorio_comunidad, MongoTemplate mongo_template)
    {
        this.servicio_comentario = servicio_comentario;
        this.repositorio_publicacion = repositorio_publicacion;
        this.repositorio_comunidad = repositorio_comunidad;
        this.mongo_template = mongo_template;
    }

    @GetMapping
    public ResponseEntity<?> listar(@RequestParam String publicacion)
    {
        if(publicacion == null || !publicacion.matches("[0-9a-fA-F]{24}"))
            return ResponseEntity.badRequest().body(Map.of("error", "Parametro publicacion obligatorio y debe ser un id valido"));

        List<Comentario> lista = servicio_comentario.lista_por_publicacion(publicacion);

        return ResponseEntity.ok(lista.stream().map(this::nodo_comentario).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable String id)
    {
        Comentario c = servicio_comentario.busca_id(id);
        return ResponseEntity.ok(nodo_comentario(c));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String id_publicacion = (String)body.get("publicacion_id");
        String contenido = (String)body.get("contenido");
        String id_padre = (String)body.get("padre_id");

        if(id_publicacion == null || !id_publicacion.matches("[0-9a-fA-F]{24}"))
            return ResponseEntity.badRequest().body(Map.of("error", "El campo publicacion_id es obligatorio"));

        if(contenido == null || contenido.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El campo contenido es obligatorio"));

        String id_generado = servicio_comentario.crea_comentario(id_publicacion, id_usuario, contenido, id_padre);

        Comentario nuevo = servicio_comentario.busca_id(id_generado);

        return ResponseEntity.status(HttpStatus.CREATED).body(nodo_comentario(nuevo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editar(@PathVariable String id, @RequestBody Map<String, String> body, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String rol = (String)req.getAttribute("jwt_rol");
        String contenido = body.get("contenido");

        if(contenido == null || contenido.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El campo contenido no puede estar vacio"));

        servicio_comentario.edita_comentario(id, id_usuario, rol, contenido);

        return ResponseEntity.ok(Map.of("mensaje", "Comentario actualizado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String rol = (String)req.getAttribute("jwt_rol");
        Comentario c = servicio_comentario.busca_id(id);
        boolean es_autor = c.getAutor().equals(id_usuario);

        if(!es_autor && !"admin".equals(rol))
        {
            //Verifica si es moderador de la comunidad de la publicacion
            Publicacion pub = repositorio_publicacion.findById(c.getPublicacionId()).orElse(null);

            boolean es_moderador = false;

            if(pub != null)
            {
                Comunidad comunidad = repositorio_comunidad.findById(pub.getComunidad()).orElse(null);
                es_moderador = comunidad != null && comunidad.getModeradores() != null && comunidad.getModeradores().contains(id_usuario);
            }

            if(!es_moderador)
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No tienes permiso para eliminar este comentario"));
        }

        Query q = Query.query(Criteria.where("_id").is(id));
        mongo_template.updateFirst(q, new Update().set("eliminado", true).set("actualizado_en", new Date()), Comentario.class);

        return ResponseEntity.ok(Map.of("mensaje", "Comentario eliminado"));
    }

    private Map<String, Object> nodo_comentario(Comentario c)
    {
        Map<String, Object> m = new LinkedHashMap<>();

        m.put("id", c.getId());
        m.put("publicacion_id", c.getPublicacionId());
        m.put("autor", c.getEliminado() ? null : c.getAutor());
        m.put("contenido", c.getEliminado() ? "[comentario eliminado]" : c.getContenido());
        m.put("padre_id", c.getPadreId());
        m.put("hilo", c.getHilo() != null ? c.getHilo() : List.of());
        m.put("puntaje_votos", c.getPuntajeVotos());
        m.put("eliminado", c.getEliminado());
        m.put("creado_en", c.getCreadoEn() != null ? c.getCreadoEn().toString() : null);
        m.put("actualizado_en", c.getActualizadoEn() != null ? c.getActualizadoEn().toString() : null);

        return m;
    }
}