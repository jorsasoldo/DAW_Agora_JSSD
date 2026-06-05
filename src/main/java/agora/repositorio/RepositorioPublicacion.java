package agora.repositorio;

import agora.modelo.Publicacion;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface RepositorioPublicacion extends MongoRepository<Publicacion, String>
{
    List<Publicacion> findByComunidad(ObjectId comunidad, Sort sort);

    List<Publicacion> findByAutor(ObjectId autor, Sort sort);

    List<Publicacion> findByTituloContainingIgnoreCase(String titulo, Sort sort);
}