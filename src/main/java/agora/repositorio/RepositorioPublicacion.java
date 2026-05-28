package agora.repositorio;

import agora.modelo.Publicacion;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RepositorioPublicacion extends MongoRepository<Publicacion, String>
{
    List<Publicacion> findByComunidad(String comunidad, Sort sort);

    List<Publicacion> findByAutor(String autor, Sort sort);
}