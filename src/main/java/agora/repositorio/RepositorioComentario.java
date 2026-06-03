package agora.repositorio;

import agora.modelo.Comentario;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RepositorioComentario extends MongoRepository<Comentario, String>
{
    List<Comentario> findByPublicacionId(ObjectId publicacionId);
}