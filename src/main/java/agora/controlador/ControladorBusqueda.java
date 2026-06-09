package agora.controlador;

import agora.modelo.Comunidad;
import agora.modelo.Publicacion;
import agora.modelo.Usuario;
import agora.repositorio.RepositorioComunidad;
import agora.repositorio.RepositorioPublicacion;
import agora.repositorio.RepositorioUsuario;
import jakarta.servlet.http.HttpServletRequest;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buscar")
public class ControladorBusqueda
{
    private final RepositorioComunidad repositorio_comunidad;
    private final RepositorioPublicacion repositorio_publicacion;
    private final RepositorioUsuario repositorio_usuario;
    private final MongoTemplate mongo_template;

    public ControladorBusqueda(RepositorioComunidad repositorio_comunidad, RepositorioPublicacion repositorio_publicacion, RepositorioUsuario repositorio_usuario, MongoTemplate mongo_template)
    {
        this.repositorio_comunidad = repositorio_comunidad;
        this.repositorio_publicacion = repositorio_publicacion;
        this.repositorio_usuario = repositorio_usuario;
        this.mongo_template = mongo_template;
    }

    @GetMapping
    public ResponseEntity<?> buscar(@RequestParam String q, HttpServletRequest req)
    {
        if(q == null || q.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El parámetro q es obligatorio"));

        String termino = q.trim();

        List<Comunidad> todas_comunidades = repositorio_comunidad.findAll();
        Set<String> ids_privadas = todas_comunidades.stream().filter(Comunidad::getEsPrivada).map(Comunidad::getId).collect(Collectors.toSet());

        //Comunidades a las que pertenece el usuario autenticado
        String id_usuario = (String) req.getAttribute("jwt_usuario_id");
        String rol = (String) req.getAttribute("jwt_rol");

        Set<String> comunidades_usuario = Set.of();

        if(id_usuario != null)
        {
            Query qu = Query.query(Criteria.where("_id").is(new ObjectId(id_usuario)));
            Usuario u = mongo_template.findOne(qu, Usuario.class);

            if(u != null && u.getComunidadesSuscritas() != null)
                comunidades_usuario = Set.copyOf(u.getComunidadesSuscritas());
        }

        final Set<String> comunidades_accesibles = comunidades_usuario;
        final boolean es_admin = "admin".equals(rol);

        List<Map<String, Object>> comunidades = repositorio_comunidad.buscarPorTexto(termino).stream().filter(c -> !c.getEsPrivada()).map(c -> Map.<String, Object>of("id", c.getId() != null ? c.getId() : "", "nombre", c.getNombre() != null ? c.getNombre() : "", "descripcion", c.getDescripcion() != null ? c.getDescripcion() : "", "icono", c.getIcono() != null ? c.getIcono() : "", "total_miembros", c.getTotalMiembros(), "es_privada", c.getEsPrivada())).toList();

        List<Map<String, Object>> publicaciones = repositorio_publicacion.findByTituloContainingIgnoreCase(termino, Sort.by(Sort.Direction.DESC, "creado_en")).stream().filter(p ->
                {
                    String id_com = p.getComunidad() != null ? p.getComunidad().toString() : null;

                    if(id_com == null)
                        return true;

                    if(!ids_privadas.contains(id_com))
                        return true;

                    if(es_admin)
                        return true;

                    return comunidades_accesibles.contains(id_com);
                }).map(p -> Map.<String, Object>of("id", p.getId() != null ? p.getId() : "", "titulo", p.getTitulo() != null ? p.getTitulo() : "", "autor", p.getAutor() != null ? p.getAutor().toString() : "", "comunidad", p.getComunidad() != null ? p.getComunidad().toString() : "", "puntaje_votos", p.getPuntajeVotos(), "total_comentarios", p.getTotalComentarios())).toList();

        List<Map<String, Object>> usuarios = repositorio_usuario.findByNombreUsuarioContainingIgnoreCase(termino).stream().map(u -> Map.<String, Object>of("id", u.getId() != null ? u.getId() : "", "nombre_usuario", u.getNombreUsuario() != null ? u.getNombreUsuario() : "", "foto_perfil", u.getFotoPerfil() != null ? u.getFotoPerfil() : "", "karma", u.getKarma())).toList();

        return ResponseEntity.ok(Map.of("comunidades", comunidades, "publicaciones", publicaciones, "usuarios", usuarios));
    }
}