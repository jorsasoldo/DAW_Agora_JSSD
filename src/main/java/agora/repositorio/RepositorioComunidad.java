package agora.repositorio;

import agora.modelo.Comunidad;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface RepositorioComunidad extends MongoRepository<Comunidad, String>
{
    Optional<Comunidad> findByNombre(String nombre);
}