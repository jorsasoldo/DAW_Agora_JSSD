package agora.repositorio;

import agora.modelo.Comentario;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RepositorioComentario extends MongoRepository<Comentario, String>
{
    List<Comentario> findByPublicacionId(String publicacion_id);
}