package agora.repositorio;

import agora.modelo.Voto;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RepositorioVoto extends MongoRepository<Voto, String>
{
    Optional<Voto> findByUsuarioIdAndObjetivoId(String usuario_id, String objetivo_id);

    List<Voto> findByObjetivoId(String objetivo_id);

    List<Voto> findByUsuarioId(String usuario_id);

    void deleteByUsuarioIdAndObjetivoId(String usuario_id, String objetivo_id);
}