package agora.controlador;

import agora.modelo.Comunidad;
import agora.modelo.Publicacion;
import agora.modelo.Usuario;
import agora.repositorio.RepositorioComunidad;
import agora.repositorio.RepositorioPublicacion;
import agora.repositorio.RepositorioUsuario;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/buscar")
public class ControladorBusqueda
{
    private final RepositorioComunidad repositorio_comunidad;
    private final RepositorioPublicacion repositorio_publicacion;
    private final RepositorioUsuario repositorio_usuario;

    public ControladorBusqueda(RepositorioComunidad repositorio_comunidad, RepositorioPublicacion repositorio_publicacion, RepositorioUsuario repositorio_usuario)
    {
        this.repositorio_comunidad = repositorio_comunidad;
        this.repositorio_publicacion = repositorio_publicacion;
        this.repositorio_usuario = repositorio_usuario;
    }

    @GetMapping
    public ResponseEntity<?> buscar(@RequestParam String q)
    {
        if(q == null || q.isBlank())
            return ResponseEntity.badRequest().body(Map.of("error", "El parámetro q es obligatorio"));

        String termino = q.trim();

        List<Map<String, Object>> comunidades = repositorio_comunidad.buscarPorTexto(termino).stream().filter(c -> !c.getEsPrivada()).map(c -> Map.<String, Object>of("id", c.getId() != null ? c.getId() : "", "nombre", c.getNombre() != null ? c.getNombre() : "", "descripcion", c.getDescripcion() != null ? c.getDescripcion() : "", "icono", c.getIcono() != null ? c.getIcono() : "", "total_miembros", c.getTotalMiembros(), "es_privada", c.getEsPrivada())).toList();

        List<Map<String, Object>> publicaciones = repositorio_publicacion.findByTituloContainingIgnoreCase(termino, Sort.by(Sort.Direction.DESC, "creado_en")).stream().map(p -> Map.<String, Object>of("id", p.getId() != null ? p.getId() : "", "titulo", p.getTitulo() != null ? p.getTitulo() : "", "autor", p.getAutor() != null ? p.getAutor().toString() : "", "comunidad", p.getComunidad() != null ? p.getComunidad().toString() : "", "puntaje_votos", p.getPuntajeVotos(), "total_comentarios", p.getTotalComentarios())).toList();

        List<Map<String, Object>> usuarios = repositorio_usuario.findByNombreUsuarioContainingIgnoreCase(termino).stream().map(u -> Map.<String, Object>of("id", u.getId() != null ? u.getId() : "", "nombre_usuario", u.getNombreUsuario() != null ? u.getNombreUsuario() : "", "foto_perfil", u.getFotoPerfil() != null ? u.getFotoPerfil() : "", "karma", u.getKarma())).toList();

        return ResponseEntity.ok(Map.of("comunidades", comunidades, "publicaciones", publicaciones, "usuarios", usuarios));
    }
}