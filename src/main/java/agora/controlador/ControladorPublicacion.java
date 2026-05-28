package agora.controlador;

import agora.modelo.Comunidad;
import agora.modelo.Publicacion;

import agora.repositorio.RepositorioComunidad;
import agora.repositorio.RepositorioPublicacion;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/publicaciones")
public class ControladorPublicacion
{
    private final RepositorioPublicacion repositorio_publicacion;
    private final RepositorioComunidad repositorio_comunidad;
    private final MongoTemplate mongo_template;

    public ControladorPublicacion(RepositorioPublicacion repositorio_publicacion, RepositorioComunidad repositorio_comunidad, MongoTemplate mongo_template)
    {
        this.repositorio_publicacion = repositorio_publicacion;
        this.repositorio_comunidad = repositorio_comunidad;
        this.mongo_template = mongo_template;
    }

    @GetMapping
    public ResponseEntity<?> listar(@RequestParam(required = false) String comunidad, @RequestParam(required = false) String autor)
    {
        Sort sort = Sort.by(Sort.Direction.DESC, "creado_en");
        List<Publicacion> lista;

        if(comunidad != null && comunidad.matches("[0-9a-fA-F]{24}"))
            lista = repositorio_publicacion.findByComunidad(comunidad, sort);

        else if(autor != null && autor.matches("[0-9a-fA-F]{24}"))
            lista = repositorio_publicacion.findByAutor(autor, sort);

        else
            lista = repositorio_publicacion.findAll(sort);

        return ResponseEntity.ok(lista.stream().map(this::nodo_publicacion).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> buscar(@PathVariable String id)
    {
        Publicacion p = repositorio_publicacion.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicacion no encontrada"));

        return ResponseEntity.ok(nodo_publicacion(p));
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, Object> body, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String titulo = (String)body.get("titulo");
        String tipo = (String)body.get("tipo");
        String id_comunidad = (String)body.get("comunidad");

        if(titulo == null || titulo.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El campo titulo es obligatorio"));

        if(tipo == null || tipo.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El campo tipo es obligatorio"));

        if(id_comunidad == null || !id_comunidad.matches("[0-9a-fA-F]{24}"))
            return ResponseEntity.badRequest().body(Map.of("error", "El campo comunidad es obligatorio y debe ser un id valido"));

        repositorio_comunidad.findById(id_comunidad).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La comunidad especificada no existe"));

        Publicacion nueva = new Publicacion(titulo, tipo, id_usuario, id_comunidad);
        nueva.setContenido((String)body.get("contenido"));
        nueva.setEnlace((String)body.get("enlace"));
        nueva.setUrlImagen((String)body.get("url_imagen"));
        nueva.setEtiqueta((String)body.get("etiqueta"));
        nueva.setCreadoEn(new Date());

        repositorio_publicacion.save(nueva);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Publicacion creada", "id", nueva.getId()));
    }

    @PostMapping("/{id}/fijar")
    public ResponseEntity<?> fijar(@PathVariable String id, HttpServletRequest req)
    {
        return accion_moderador(id, req, "fijar");
    }

    @PostMapping("/{id}/bloquear")
    public ResponseEntity<?> bloquear(@PathVariable String id, HttpServletRequest req)
    {
        return accion_moderador(id, req, "bloquear");
    }

    private ResponseEntity<?> accion_moderador(String id, HttpServletRequest req, String accion)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String rol = (String)req.getAttribute("jwt_rol");

        Publicacion p = repositorio_publicacion.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicacion no encontrada"));

        Comunidad comunidad = repositorio_comunidad.findById(p.getComunidad()).orElse(null);
        boolean es_moderador = comunidad != null && comunidad.getModeradores() != null && comunidad.getModeradores().contains(id_usuario);

        if(!"admin".equals(rol) && !es_moderador)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Solo moderadores o admins pueden realizar esta accion"));

        Query q = Query.query(Criteria.where("_id").is(id));

        if("fijar".equals(accion))
        {
            boolean nuevo = !p.getFijada();
            mongo_template.updateFirst(q, new Update().set("fijada", nuevo), Publicacion.class);

            return ResponseEntity.ok(Map.of("mensaje", nuevo ? "Publicacion fijada" : "Publicacion desfijada", "fijada", nuevo));
        }

        else
        {
            boolean nuevo = !p.getBloqueada();
            mongo_template.updateFirst(q, new Update().set("bloqueada", nuevo), Publicacion.class);

            return ResponseEntity.ok(Map.of("mensaje", nuevo ? "Comentarios bloqueados" : "Comentarios desbloqueados", "bloqueada", nuevo));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable String id, @RequestBody Map<String, String> body, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String rol = (String)req.getAttribute("jwt_rol");

        Publicacion p = repositorio_publicacion.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicacion no encontrada"));

        if(!p.getAutor().equals(id_usuario) && !"admin".equals(rol))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Solo el autor puede edita_comentario esta publicacion"));

        String titulo = body.get("titulo");

        if(titulo == null || titulo.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El campo titulo no puede estar vacio"));

        Query q = Query.query(Criteria.where("_id").is(id));
        Update u = new Update().set("titulo", titulo).set("contenido", body.get("contenido")).set("etiqueta", body.get("etiqueta")).set("actualizado_en", new Date());

        long modificado = mongo_template.updateFirst(q, u, Publicacion.class).getModifiedCount();

        if(modificado > 0)
            return ResponseEntity.ok(Map.of("mensaje", "Publicacion actualizada"));

        else
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "No se pudo actualizar"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable String id, HttpServletRequest req)
    {
        String id_usuario = (String)req.getAttribute("jwt_usuario_id");
        String rol = (String)req.getAttribute("jwt_rol");

        Publicacion p = repositorio_publicacion.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicacion no encontrada"));

        Comunidad comunidad = repositorio_comunidad.findById(p.getComunidad()).orElse(null);

        boolean es_moderador = comunidad != null && comunidad.getModeradores() != null && comunidad.getModeradores().contains(id_usuario);

        if(!p.getAutor().equals(id_usuario) && !es_moderador && !"admin".equals(rol))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "No tienes permiso para eliminar esta publicacion"));

        repositorio_publicacion.deleteById(id);

        return ResponseEntity.ok(Map.of("mensaje", "Publicacion eliminada"));
    }

    private Map<String, Object> nodo_publicacion(Publicacion p)
    {
        return Map.of("id", p.getId() != null ? p.getId() : "", "titulo", p.getTitulo() != null ? p.getTitulo() : "", "tipo", p.getTipo() != null ? p.getTipo() : "", "contenido", p.getContenido() != null ? p.getContenido() : "", "enlace", p.getEnlace() != null ? p.getEnlace() : "", "url_imagen", p.getUrlImagen() != null ? p.getUrlImagen() : "", "autor", p.getAutor() != null ? p.getAutor() : "", "comunidad", p.getComunidad() != null ? p.getComunidad() : "", "puntaje_votos", p.getPuntajeVotos(), "votos_positivos", p.getVotosPositivos());
    }
}