package agora.modelo;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "VOTO")
public class Voto
{
    @Id
    private String id;
    @Field("usuario_id")
    private ObjectId usuarioId;
    @Field("objetivo_id")
    private ObjectId objetivoId;
    @Field("tipo_objetivo")
    private String tipoObjetivo;
    @Field("autor_objetivo_id")
    private ObjectId autorObjetivoId;
    @Field("valor")
    private int valor;

    public Voto()
    {

    }

    public Voto(String usuarioId, String objetivoId, String tipoObjetivo, String autorObjetivoId, int valor)
    {
        this.usuarioId = new ObjectId(usuarioId);
        this.objetivoId = new ObjectId(objetivoId);
        this.tipoObjetivo = tipoObjetivo;
        this.autorObjetivoId = new ObjectId(autorObjetivoId);
        this.valor = valor;
    }

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public String getUsuarioId()
    {
        return usuarioId != null ? usuarioId.toHexString() : null;
    }

    public void setUsuarioId(String usuarioId)
    {
        this.usuarioId = usuarioId != null ? new ObjectId(usuarioId) : null;
    }

    public String getObjetivoId()
    {
        return objetivoId != null ? objetivoId.toHexString() : null;
    }

    public void setObjetivoId(String objetivoId)
    {
        this.objetivoId = objetivoId != null ? new ObjectId(objetivoId) : null;
    }

    public String getTipoObjetivo()
    {
        return tipoObjetivo;
    }

    public void setTipoObjetivo(String tipoObjetivo)
    {
        this.tipoObjetivo = tipoObjetivo;
    }

    public String getAutorObjetivoId()
    {
        return autorObjetivoId != null ? autorObjetivoId.toHexString() : null;
    }

    public void setAutorObjetivoId(String autorObjetivoId)
    {
        this.autorObjetivoId = autorObjetivoId != null ? new ObjectId(autorObjetivoId) : null;
    }

    public int getValor()
    {
        return valor;
    }

    public void setValor(int valor)
    {
        this.valor = valor;
    }
}