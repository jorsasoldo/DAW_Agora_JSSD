package agora.repositorio;

import agora.modelo.Comunidad;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RepositorioComunidad extends MongoRepository<Comunidad, String>
{
    Optional<Comunidad> findByNombre(String nombre);

    @Query("{'$or': [{'nombre': {'$regex': ?0, '$options': 'i'}}, {'descripcion': {'$regex': ?0, '$options': 'i'}}]}")
    List<Comunidad> buscarPorTexto(String texto);
}