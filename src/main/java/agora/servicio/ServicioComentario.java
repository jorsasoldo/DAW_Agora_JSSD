package agora.servicio;

import agora.modelo.Comentario;
import agora.modelo.Publicacion;

import agora.repositorio.RepositorioComentario;
import agora.repositorio.RepositorioPublicacion;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class ServicioComentario
{
    private final RepositorioComentario repositorio_comentario;
    private final RepositorioPublicacion repositorio_publicacion;
    private final MongoTemplate mongo_template;

    public ServicioComentario(RepositorioComentario repositorio_comentario, RepositorioPublicacion repositorio_publicacion, MongoTemplate mongo_template)
    {
        this.repositorio_comentario = repositorio_comentario;
        this.repositorio_publicacion = repositorio_publicacion;
        this.mongo_template = mongo_template;
    }

    public List<Comentario> lista_por_publicacion(String publicacion_id)
    {
        return repositorio_comentario.findByPublicacionId(publicacion_id);
    }

    public Comentario busca_id(String id)
    {
        return repositorio_comentario.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comentario no encontrado"));
    }

    //Construccion e insercion del hilo/arbol de comentarios
    public String crea_comentario(String id_publicacion, String id_usuario, String contenido, String id_padre)
    {
        Publicacion pub = repositorio_publicacion.findById(id_publicacion).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicacion no encontrada"));

        if(pub.getBloqueada())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Esta publicacion tiene los comentarios bloqueados");

        //Construye el hilo de padres
        List<String> hilo = new ArrayList<>();

        if(id_padre != null && !id_padre.isBlank())
        {
            Comentario padre = repositorio_comentario.findById(id_padre).orElse(null);

            if(padre != null)
            {
                if(padre.getHilo() != null)
                    hilo.addAll(padre.getHilo());

                hilo.add(id_padre);
            }
        }

        Comentario nuevo = new Comentario(id_publicacion, id_usuario, contenido);
        nuevo.setPadreId((id_padre != null && !id_padre.isBlank()) ? id_padre : null);
        nuevo.setHilo(hilo);
        nuevo.setCreadoEn(new Date());

        repositorio_comentario.save(nuevo);

        //Incrementa contador de comentarios de la publicacion
        Query q = Query.query(Criteria.where("_id").is(id_publicacion));
        mongo_template.updateFirst(q, new Update().inc("total_comentarios", 1), Publicacion.class);

        return nuevo.getId();
    }

    public void edita_comentario(String id, String id_usuario, String rol, String contenido)
    {
        Comentario c = busca_id(id);

        if(!c.getAutor().equals(id_usuario) && !"admin".equals(rol))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo el autor puede edita_comentario este comentario");

        Query q = Query.query(Criteria.where("_id").is(id));
        mongo_template.updateFirst(q, new Update().set("contenido", contenido).set("actualizado_en", new Date()), Comentario.class);
    }

    //Marca comentario como elimiado
    public void elimina_suave_cometario(String id, String id_usuario, String rol)
    {
        Comentario c = busca_id(id);

        boolean es_autor = c.getAutor().equals(id_usuario);

        if(!es_autor && !"admin".equals(rol))
        {
            //Verifica si es moderador de la comunidad de la publicacion
            boolean es_moderador = repositorio_publicacion.findById(c.getPublicacionId()).map(pub -> {return false;}).orElse(false);

            if(!es_moderador)
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para eliminar este comentario");
        }

        Query q = Query.query(Criteria.where("_id").is(id));

        mongo_template.updateFirst(q, new Update().set("eliminado", true).set("actualizado_en", new Date()), Comentario.class);
    }
}