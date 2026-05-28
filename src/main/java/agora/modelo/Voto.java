package agora.modelo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Document(collection = "VOTO")
public class Voto
{
    @Id
    private String id;
    @Field("usuario_id")
    private String usuarioId;
    @Field("objetivo_id")
    private String objetivoId;
    @Field("tipo_objetivo")
    private String tipoObjetivo;
    @Field("autor_objetivo_id")
    private String autorObjetivoId;
    @Field("valor")
    private int valor;

    public Voto()
    {

    }

    public Voto(String usuarioId, String objetivoId, String tipoObjetivo, String autorObjetivoId, int valor)
    {
        this.usuarioId = usuarioId;
        this.objetivoId = objetivoId;
        this.tipoObjetivo = tipoObjetivo;
        this.autorObjetivoId = autorObjetivoId;
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
        return usuarioId;
    }

    public void setUsuarioId(String usuarioId)
    {
        this.usuarioId = usuarioId;
    }

    public String getObjetivoId()
    {
        return objetivoId;
    }

    public void setObjetivoId(String objetivoId)
    {
        this.objetivoId = objetivoId;
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
        return autorObjetivoId;
    }

    public void setAutorObjetivoId(String autorObjetivoId)
    {
        this.autorObjetivoId = autorObjetivoId;
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