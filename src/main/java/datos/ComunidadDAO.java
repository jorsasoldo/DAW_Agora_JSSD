package datos;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import modelo.Comunidad;
import org.bson.Document;
import org.bson.types.ObjectId;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ComunidadDAO
{
    private final MongoCollection<Document> coleccion;

    public ComunidadDAO()
    {
        MongoDatabase db = Conexion.getDatabase();
        this.coleccion = db.getCollection("COMUNIDAD");
    }

    public String insertar(Comunidad c)
    {
        List<ObjectId> moderadoresIds = new ArrayList<>();

        if(c.get_moderadores() != null)
            for(String mid : c.get_moderadores())
                moderadoresIds.add(new ObjectId(mid));

        List<Document> reglasDoc = new ArrayList<>();

        if(c.get_reglas() != null)
            for(Map<String, String> regla : c.get_reglas())
            {
                Document r = new Document().append("titulo", regla.get("titulo"));

                if(regla.containsKey("descripcion"))
                    r.append("descripcion", regla.get("descripcion"));

                reglasDoc.add(r);
            }

        Document doc = new Document().append("nombre", c.get_nombre()).append("creado_por", new ObjectId(c.get_creado_por())).append("creado_en", new Date()).append("total_miembros", 0).append("es_privada", c.is_es_privada()).append("moderadores", moderadoresIds).append("reglas", reglasDoc);

        if(c.get_descripcion() != null && !c.get_descripcion().isEmpty())
            doc.append("descripcion", c.get_descripcion());

        if(c.get_banner() != null && !c.get_banner().isEmpty())
            doc.append("banner", c.get_banner());

        if(c.get_icono() != null && !c.get_icono().isEmpty())
            doc.append("icono", c.get_icono());

        coleccion.insertOne(doc);

        return doc.getObjectId("_id").toHexString();
    }

    public List<Comunidad> listar()
    {
        List<Comunidad> lista = new ArrayList<>();

        for(Document doc : coleccion.find())
            lista.add(docToComunidad(doc));

        return lista;
    }

    public Comunidad busca_id(String id)
    {
        Document doc = coleccion.find(Filters.eq("_id", new ObjectId(id))).first();

        if(doc != null)
            return docToComunidad(doc);

        else
            return null;
    }

    public Comunidad busca_nombre(String nombre)
    {
        Document doc = coleccion.find(Filters.eq("nombre", nombre)).first();

        if(doc != null)
            return docToComunidad(doc);

        else
            return null;
    }

    public boolean actualizar(String id, String descripcion, String banner, String icono)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)),
                Updates.combine(Updates.set("descripcion", descripcion), Updates.set("banner", banner), Updates.set("icono", icono)));

        return resultado.getModifiedCount() > 0;
    }

    public boolean incrementa_miembros(String id, int valor)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.inc("total_miembros", valor));

        return resultado.getModifiedCount() > 0;
    }

    public boolean agregar_moderador(String comunidad_id, String usuario_id)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(comunidad_id)), Updates.addToSet("moderadores", new ObjectId(usuario_id)));

        return resultado.getModifiedCount() > 0;
    }

    public boolean eliminar(String id)
    {
        var resultado = coleccion.deleteOne(Filters.eq("_id", new ObjectId(id)));

        return resultado.getDeletedCount() > 0;
    }

    @SuppressWarnings("unchecked")
    private Comunidad docToComunidad(Document doc)
    {
        Comunidad c = new Comunidad();

        c.set_id(doc.getObjectId("_id").toHexString());
        c.set_nombre(doc.getString("nombre"));
        c.set_descripcion(doc.getString("descripcion"));
        c.set_banner(doc.getString("banner"));
        c.set_icono(doc.getString("icono"));
        c.set_total_miembros(doc.getInteger("total_miembros", 0));
        c.set_creado_por(doc.getObjectId("creado_por").toHexString());
        c.set_creado_en(doc.getDate("creado_en"));
        c.set_es_privada(doc.getBoolean("es_privada", false));

        List<ObjectId> moderadoresIds = (List<ObjectId>) doc.get("moderadores");

        if(moderadoresIds != null)
            c.set_moderadores(moderadoresIds.stream().map(ObjectId::toHexString).collect(Collectors.toList()));

        else
            c.set_moderadores(new ArrayList<>());

        List<Document> reglasDoc = (List<Document>) doc.get("reglas");

        List<Map<String, String>> reglas = new ArrayList<>();

        if(reglasDoc != null)
            for(Document r : reglasDoc)
            {
                Map<String, String> regla = new HashMap<>();
                regla.put("titulo", r.getString("titulo"));

                if(r.getString("descripcion") != null)
                    regla.put("descripcion", r.getString("descripcion"));

                reglas.add(regla);
            }

        c.set_reglas(reglas);

        return c;
    }
}