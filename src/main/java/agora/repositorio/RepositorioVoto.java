package agora.repositorio;

import agora.modelo.Voto;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RepositorioVoto extends MongoRepository<Voto, String>
{
    Optional<Voto> findByUsuarioIdAndObjetivoId(ObjectId usuarioId, ObjectId objetivoId);

    List<Voto> findByObjetivoId(ObjectId objetivoId);

    List<Voto> findByUsuarioId(ObjectId usuarioId);

    void deleteByUsuarioIdAndObjetivoId(ObjectId usuarioId, ObjectId objetivoId);
}