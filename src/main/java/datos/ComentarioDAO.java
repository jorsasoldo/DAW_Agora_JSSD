package datos;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import modelo.Comentario;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

public class ComentarioDAO
{
    private final MongoCollection<Document> coleccion;

    public ComentarioDAO()
    {
        MongoDatabase db = Conexion.getDatabase();
        this.coleccion = db.getCollection("COMENTARIO");
    }

    public String insertar(Comentario c)
    {
        List<ObjectId> hiloIds = new ArrayList<>();

        if(c.get_hilo() != null)
            for(String hid : c.get_hilo())
                hiloIds.add(new ObjectId(hid));

        Document doc = new Document().append("publicacion_id", new ObjectId(c.get_publicacion_id())).append("autor", new ObjectId(c.get_autor())).append("contenido", c.get_contenido()).append("hilo", hiloIds).append("puntaje_votos", 0).append("eliminado", false).append("creado_en", new Date());

        if(c.get_padre_id() != null && !c.get_padre_id().isEmpty())
            doc.append("padre_id", new ObjectId(c.get_padre_id()));

        else
            doc.append("padre_id", null);

        coleccion.insertOne(doc);

        return doc.getObjectId("_id").toHexString();
    }

    public List<Comentario> listar_por_publicacion(String publicacion_id)
    {
        List<Comentario> lista = new ArrayList<>();

        for(Document doc : coleccion.find(Filters.eq("publicacion_id", new ObjectId(publicacion_id))))
            lista.add(docToComentario(doc));

        return lista;
    }

    public Comentario busca_id(String id)
    {
        Document doc = coleccion.find(Filters.eq("_id", new ObjectId(id))).first();

        if(doc != null)
            return docToComentario(doc);

        else
            return null;
    }

    public boolean actualizar_contenido(String id, String nuevo_contenido)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.combine(Updates.set("contenido", nuevo_contenido), Updates.set("actualizado_en", new Date())));

        return resultado.getModifiedCount() > 0;
    }

    public boolean incrementa_puntaje_votos(String id, int valor)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.inc("puntaje_votos", valor));

        return resultado.getModifiedCount() > 0;
    }

    public boolean eliminar_suave(String id)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.combine(Updates.set("eliminado", true), Updates.set("actualizado_en", new Date())));

        return resultado.getModifiedCount() > 0;
    }

    public boolean eliminar(String id)
    {
        var resultado = coleccion.deleteOne(Filters.eq("_id", new ObjectId(id)));

        return resultado.getDeletedCount() > 0;
    }

    private Comentario docToComentario(Document doc)
    {
        Comentario c = new Comentario();

        c.set_id(doc.getObjectId("_id").toHexString());
        c.set_publicacion_id(doc.getObjectId("publicacion_id").toHexString());
        c.set_autor(doc.getObjectId("autor").toHexString());
        c.set_contenido(doc.getString("contenido"));
        c.set_puntaje_votos(doc.getInteger("puntaje_votos", 0));
        c.set_eliminado(doc.getBoolean("eliminado", false));
        c.set_creado_en(doc.getDate("creado_en"));
        c.set_actualizado_en(doc.getDate("actualizado_en"));

        ObjectId padreId = doc.getObjectId("padre_id");

        if(padreId != null)
            c.set_padre_id(padreId.toHexString());

        @SuppressWarnings("unchecked")
        List<ObjectId> hiloIds = (List<ObjectId>) doc.get("hilo");

        if(hiloIds != null)
            c.set_hilo(hiloIds.stream().map(ObjectId::toHexString).collect(Collectors.toList()));

        else
            c.set_hilo(new ArrayList<>());

        return c;
    }
}