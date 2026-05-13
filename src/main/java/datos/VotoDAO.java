package datos;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import modelo.Voto;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.List;

public class VotoDAO
{
    private final MongoCollection<Document> coleccion;

    public VotoDAO()
    {
        MongoDatabase db = Conexion.getDatabase();
        this.coleccion = db.getCollection("VOTO");
    }

    public String insertar(Voto v)
    {
        Document doc = new Document().append("usuario_id", new ObjectId(v.get_usuario_id())).append("objetivo_id", new ObjectId(v.get_objetivo_id())).append("tipo_objetivo", v.get_tipo_objetivo()).append("autor_objetivo_id", new ObjectId(v.get_autor_objetivo_id())).append("valor", v.get_valor());

        coleccion.insertOne(doc);

        return doc.getObjectId("_id").toHexString();
    }

    public Voto busca_id(String id)
    {
        Document doc = coleccion.find(Filters.eq("_id", new ObjectId(id))).first();

        if(doc != null)
            return docToVoto(doc);

        else
            return null;
    }

    public Voto busca_por_usuario_y_objetivo(String usuario_id, String objetivo_id)
    {
        Document doc = coleccion.find(Filters.and(Filters.eq("usuario_id",  new ObjectId(usuario_id)), Filters.eq("objetivo_id", new ObjectId(objetivo_id)))).first();

        if(doc != null)
            return docToVoto(doc);

        else
            return null;
    }

    public List<Voto> listar_por_objetivo(String objetivo_id)
    {
        List<Voto> lista = new ArrayList<>();

        for(Document doc : coleccion.find(Filters.eq("objetivo_id", new ObjectId(objetivo_id))))
            lista.add(docToVoto(doc));

        return lista;
    }

    public List<Voto> listar_por_usuario(String usuario_id)
    {
        List<Voto> lista = new ArrayList<>();

        for(Document doc : coleccion.find(Filters.eq("usuario_id", new ObjectId(usuario_id))))
            lista.add(docToVoto(doc));

        return lista;
    }

    public boolean eliminar(String id)
    {
        var resultado = coleccion.deleteOne(Filters.eq("_id", new ObjectId(id)));

        return resultado.getDeletedCount() > 0;
    }

    public boolean eliminar_por_usuario_y_objetivo(String usuario_id, String objetivo_id)
    {
        var resultado = coleccion.deleteOne(Filters.and(Filters.eq("usuario_id",  new ObjectId(usuario_id)), Filters.eq("objetivo_id", new ObjectId(objetivo_id))));

        return resultado.getDeletedCount() > 0;
    }

    private Voto docToVoto(Document doc)
    {
        Voto v = new Voto();

        v.set_id(doc.getObjectId("_id").toHexString());
        v.set_usuario_id(doc.getObjectId("usuario_id").toHexString());
        v.set_objetivo_id(doc.getObjectId("objetivo_id").toHexString());
        v.set_tipo_objetivo(doc.getString("tipo_objetivo"));
        v.set_autor_objetivo_id(doc.getObjectId("autor_objetivo_id").toHexString());
        v.set_valor(doc.getInteger("valor", 0));

        return v;
    }
}