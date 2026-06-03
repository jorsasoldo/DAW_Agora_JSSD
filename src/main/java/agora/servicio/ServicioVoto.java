package agora.servicio;

import agora.modelo.Comentario;
import agora.modelo.Publicacion;
import agora.modelo.Voto;

import agora.repositorio.RepositorioComentario;
import agora.repositorio.RepositorioPublicacion;
import agora.repositorio.RepositorioVoto;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class ServicioVoto
{
    private final RepositorioVoto repositorio_voto;
    private final RepositorioPublicacion repositorio_publicacion;
    private final RepositorioComentario repositorio_comentario;
    private final MongoTemplate mongo_template;

    public ServicioVoto(RepositorioVoto repositorio_voto, RepositorioPublicacion repositorio_publicacion, RepositorioComentario repositorio_comentario, MongoTemplate mongo_template)
    {
        this.repositorio_voto = repositorio_voto;
        this.repositorio_publicacion = repositorio_publicacion;
        this.repositorio_comentario = repositorio_comentario;
        this.mongo_template = mongo_template;
    }

    public Optional<Voto> busca_voto(String usuario_id, String objetivo_id)
    {
        return repositorio_voto.findByUsuarioIdAndObjetivoId(new ObjectId(usuario_id), new ObjectId(objetivo_id));
    }

    //Procesa votos para registrarlos, cambiarlos o eliminarlos
    public Map<String, Object> procesa_voto(String id_votante, String id_objetivo, String tipo_objetivo, int valor)
    {
        //Valida tipo
        if(!"publicacion".equals(tipo_objetivo) && !"comentario".equals(tipo_objetivo))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo tipo_objetivo debe ser publicacion o comentario");

        //Valida valor
        if(valor != 1 && valor != -1 && valor != 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo valor debe ser 1, -1 o 0");

        String id_autor_objetivo = obtiene_autor_objetivo(id_objetivo, tipo_objetivo);

        if(id_autor_objetivo == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El objetivo votado no existe");

        if(id_votante.equals(id_autor_objetivo))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes votar tus propias publicaciones");

        Optional<Voto> voto_existente_opt = repositorio_voto.findByUsuarioIdAndObjetivoId(new ObjectId(id_votante), new ObjectId(id_objetivo));

        Map<String, Object> resultado = new HashMap<>();

        if(voto_existente_opt.isEmpty())
        {
            if(valor == 0)
            {
                resultado.put("mensaje", "No hay voto que retirar");
                resultado.put("valor", 0);
                return resultado;
            }

            Voto nuevo = new Voto(id_votante, id_objetivo, tipo_objetivo, id_autor_objetivo, valor);
            repositorio_voto.save(nuevo);

            aplica_puntaje_objetivo(id_objetivo, tipo_objetivo, valor);
            incrementa_karma(id_autor_objetivo, valor);

            resultado.put("mensaje", "Voto registrado");
            resultado.put("valor", valor);
        }

        else
        {
            Voto voto_existente = voto_existente_opt.get();
            int valor_anterior = voto_existente.getValor();

            if(valor == 0 || valor == valor_anterior)
            {
                //Retira voto
                repositorio_voto.deleteByUsuarioIdAndObjetivoId(new ObjectId(id_votante), new ObjectId(id_objetivo));

                aplica_puntaje_objetivo(id_objetivo, tipo_objetivo, -valor_anterior);
                incrementa_karma(id_autor_objetivo, -valor_anterior);

                resultado.put("mensaje", "Voto retirado");
                resultado.put("valor", 0);
            }

            else
            {
                //Cambia puntuacion
                int delta = valor - valor_anterior;
                repositorio_voto.deleteByUsuarioIdAndObjetivoId(new ObjectId(id_votante), new ObjectId(id_objetivo));

                Voto nuevo = new Voto(id_votante, id_objetivo, tipo_objetivo, id_autor_objetivo, valor);
                repositorio_voto.save(nuevo);

                aplica_puntaje_objetivo(id_objetivo, tipo_objetivo, delta);
                incrementa_karma(id_autor_objetivo, delta);

                resultado.put("mensaje", "Voto actualizado");
                resultado.put("valor", valor);
            }
        }

        return resultado;
    }

    private String obtiene_autor_objetivo(String id_objetivo, String tipo_objetivo)
    {
        if("publicacion".equals(tipo_objetivo))
            return repositorio_publicacion.findById(id_objetivo).map(Publicacion::getAutor).orElse(null);

        else
            return repositorio_comentario.findById(id_objetivo).map(Comentario::getAutor).orElse(null);
    }

    private void aplica_puntaje_objetivo(String id, String tipo, int delta)
    {
        if("publicacion".equals(tipo))
        {
            Query q = Query.query(Criteria.where("_id").is(new ObjectId(id)));

            Update u = new Update().inc("puntaje_votos", delta);

            if(delta > 0)
                u.inc("votos_positivos", delta);

            else if(delta < 0)
                u.inc("votos_negativos", Math.abs(delta));

            mongo_template.updateFirst(q, u, Publicacion.class);
        }

        else
        {
            Query q = Query.query(Criteria.where("_id").is(new ObjectId(id)));
            mongo_template.updateFirst(q, new Update().inc("puntaje_votos", delta), Comentario.class);
        }
    }

    private void incrementa_karma(String usuario_id, int valor)
    {
        Query q = Query.query(Criteria.where("_id").is(new ObjectId(usuario_id)));
        mongo_template.updateFirst(q, new Update().inc("karma", valor), agora.modelo.Usuario.class);
    }
}