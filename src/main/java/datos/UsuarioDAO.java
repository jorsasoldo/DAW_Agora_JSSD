package datos;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import modelo.Usuario;
import org.bson.Document;
import org.bson.types.ObjectId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class UsuarioDAO
{
    private final MongoCollection<Document> coleccion;

    public UsuarioDAO()
    {
        MongoDatabase db = Conexion.getDatabase();
        this.coleccion = db.getCollection("USUARIO");
    }

    public String insertar(Usuario u)
    {
        Document doc = new Document().append("nombre_usuario", u.get_nombre_usuario()).append("email", u.get_email()).append("contrasena", u.get_contrasena()).append("karma", 0).append("comunidades_suscritas", new ArrayList<>()).append("creado_en", new Date()).append("rol", "usuario");

        if(u.get_foto_perfil() != null && !u.get_foto_perfil().isEmpty())
            doc.append("foto_perfil", u.get_foto_perfil());

        if(u.get_biografia() != null && !u.get_biografia().isEmpty())
            doc.append("biografia", u.get_biografia());

        coleccion.insertOne(doc);

        return doc.getObjectId("_id").toHexString();
    }

    public List<Usuario> listar()
    {
        List<Usuario> lista = new ArrayList<>();

        for(Document doc : coleccion.find())
            lista.add(docToUsuario(doc));

        return lista;
    }

    public Usuario busca_id(String id)
    {
        Document doc = coleccion.find(Filters.eq("_id", new ObjectId(id))).first();

        if(doc != null)
            return docToUsuario(doc);

        else
            return null;
    }

    public Usuario busca_email(String email)
    {
        Document doc = coleccion.find(Filters.eq("email", email)).first();

        if(doc != null)
            return docToUsuario(doc);

        else
            return null;
    }

    public boolean actualizar(String id, String biografia, String fotoPerfil)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(id)), Updates.combine(Updates.set("biografia",   biografia), Updates.set("foto_perfil", fotoPerfil)));

        return resultado.getModifiedCount() > 0;
    }

    public boolean incrementa_karma(String usuarioId, int valor)
    {
        var resultado = coleccion.updateOne(Filters.eq("_id", new ObjectId(usuarioId)), Updates.inc("karma", valor));

        return resultado.getModifiedCount() > 0;
    }

    public boolean eliminar(String id)
    {
        var resultado = coleccion.deleteOne(Filters.eq("_id", new ObjectId(id)));

        return resultado.getDeletedCount() > 0;
    }

    private Usuario docToUsuario(Document doc)
    {
        Usuario u = new Usuario();

        u.set_id(doc.getObjectId("_id").toHexString());
        u.set_nombre_usuario(doc.getString("nombre_usuario"));
        u.set_email(doc.getString("email"));
        u.set_contrasena(doc.getString("contrasena"));
        u.set_foto_perfil(doc.getString("foto_perfil"));
        u.set_biografia(doc.getString("biografia"));
        u.set_karma(doc.getInteger("karma", 0));
        u.set_rol(doc.getString("rol"));
        u.set_creado_en(doc.getDate("creado_en"));

        return u;
    }
}