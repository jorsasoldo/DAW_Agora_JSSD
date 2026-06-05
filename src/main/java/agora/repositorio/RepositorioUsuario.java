package agora.repositorio;

import agora.modelo.Usuario;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface RepositorioUsuario extends MongoRepository<Usuario, String>
{
    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    List<Usuario> findByNombreUsuarioContainingIgnoreCase(String texto);
}