package datos;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Sorts;
import com.mongodb.client.model.Updates;
import modelo.Publicacion;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class PublicacionDAO
{
    private final MongoCollection<Document> coleccion;

    public PublicacionDAO()
    {
        MongoDatabase db = Conexion.getDatabase();
        this.coleccion = db.getCollection("PUBLICACION");
    }

    public String insertar(Publicacion p)
    {
        Document doc = new Document().append("titulo", p.get_titulo()).append("tipo", p.get_tipo()).append("autor", new ObjectId(p.get_autor())).append("comunidad", new ObjectId(p.get_comunidad())).append("puntaje_votos", 0).append("votos_positivos", 0).append("votos_negativos", 0).append("total_comentarios", 0).append("fijada", false).append("bloqueada", false).append("creado_en", new Date());

        if(p.get_contenido() != null && !p.get_contenido().isEmpty())
            doc.append("contenido", p.get_contenido());

        if(p.get_enlace() != null && !p.get_enlace().isEmpty())
            doc.append("enlace", p.get_enlace());

        if(p.get_url_imagen() != null && !p.get_url_imagen().isEmpty())
            doc.append("url_imagen", p.get_url_imagen());

        if(p.get_etiqueta() != null && !p.get_etiqueta().isEmpty())
            doc.append("etiqueta", p.get_etiqueta());

        coleccion.insertOne(doc);

        return doc.getObjectId("_id").toHexString();
    }

    public List<Publicacion> listar()
    {
        List<Publicacion> lista = new ArrayList<>();

        for(Document doc : coleccion.find().sort(Sorts.descending("creado_en")))
            lista.add(docToPublicacion(doc));

        return lista;
    }

    public List<Publicacion> listar_por_comunidad(String comunidad_id)
    {
        List<Publicacion> lista = new ArrayList<>();

        for(Document doc : coleccion.find(Filters.eq("comunidad", new ObjectId(comunidad_id))).sort(Sorts.descending("creado_en")))
            lista.add(docToPublicacion(doc));

        return lista;
    }

    public List<Publicacion> listar_por_autor(String autor_id)
    {
        List<Publicacion> lista = new ArrayList<>();

        for(Document doc : coleccion.find(Filters.eq("autor", new ObjectId(autor_id))).sort(Sorts.descending("creado_en")))
            lista.add(docToPublicacion(doc));

        return lista;
    }

    public Publicacion busca_id(String id)
    {
        Document doc = coleccion.find(Filters.eq("_id", new ObjectId(id))).first();

        if(doc != null)
            return docToPublicacion(doc);

        else
            return null;
    }

    public boolean actualizar(String id, String titulo, String contenido, String etiqueta)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.combine(Updates.set("titulo", titulo), Updates.set("contenido", contenido), Updates.set("etiqueta", etiqueta), Updates.set("actualizado_en", new Date())));

        return resultado.getModifiedCount() > 0;
    }

    public boolean incrementa_puntaje_votos(String id, int valor)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.inc("puntaje_votos", valor));

        return resultado.getModifiedCount() > 0;
    }

    public boolean incrementa_votos_positivos(String id, int valor)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.inc("votos_positivos", valor));

        return resultado.getModifiedCount() > 0;
    }

    public boolean incrementa_votos_negativos(String id, int valor)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.inc("votos_negativos", valor));

        return resultado.getModifiedCount() > 0;
    }

    public boolean incrementa_total_comentarios(String id, int valor)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.inc("total_comentarios", valor));

        return resultado.getModifiedCount() > 0;
    }

    public boolean set_fijada(String id, boolean fijada)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.set("fijada", fijada));

        return resultado.getModifiedCount() > 0;
    }

    public boolean set_bloqueada(String id, boolean bloqueada)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.set("bloqueada", bloqueada));

        return resultado.getModifiedCount() > 0;
    }

    public boolean eliminar(String id)
    {
        var resultado = coleccion.deleteOne(Filters.eq("_id", new ObjectId(id)));

        return resultado.getDeletedCount() > 0;
    }

    private Publicacion docToPublicacion(Document doc)
    {
        Publicacion p = new Publicacion();

        p.set_id(doc.getObjectId("_id").toHexString());
        p.set_titulo(doc.getString("titulo"));
        p.set_tipo(doc.getString("tipo"));
        p.set_contenido(doc.getString("contenido"));
        p.set_enlace(doc.getString("enlace"));
        p.set_url_imagen(doc.getString("url_imagen"));
        p.set_autor(doc.getObjectId("autor").toHexString());
        p.set_comunidad(doc.getObjectId("comunidad").toHexString());
        p.set_puntaje_votos(doc.getInteger("puntaje_votos", 0));
        p.set_votos_positivos(doc.getInteger("votos_positivos", 0));
        p.set_votos_negativos(doc.getInteger("votos_negativos", 0));
        p.set_total_comentarios(doc.getInteger("total_comentarios", 0));
        p.set_etiqueta(doc.getString("etiqueta"));
        p.set_fijada(doc.getBoolean("fijada", false));
        p.set_bloqueada(doc.getBoolean("bloqueada", false));
        p.set_creado_en(doc.getDate("creado_en"));
        p.set_actualizado_en(doc.getDate("actualizado_en"));

        return p;
    }
}