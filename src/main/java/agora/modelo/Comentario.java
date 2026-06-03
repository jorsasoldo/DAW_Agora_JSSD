package agora.modelo;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Document(collection = "COMENTARIO")
public class Comentario
{
    @Id
    private String id;
    @Field("publicacion_id")
    private ObjectId publicacionId;
    private ObjectId autor;
    private String contenido;
    @Field("padre_id")
    private ObjectId padreId;
    private List<ObjectId> hilo;
    @Field("puntaje_votos")
    private int puntajeVotos;
    private boolean eliminado;
    @Field("creado_en")
    private Date creadoEn;
    @Field("actualizado_en")
    private Date actualizadoEn;

    public Comentario()
    {

    }

    public Comentario(String publicacionId, String autorId, String contenido)
    {
        this.publicacionId = new ObjectId(publicacionId);
        this.autor = new ObjectId(autorId);
        this.contenido = contenido;
    }

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public String getPublicacionId()
    {
        return publicacionId != null ? publicacionId.toHexString() : null;
    }

    public void setPublicacionId(String publicacionId)
    {
        this.publicacionId = publicacionId != null ? new ObjectId(publicacionId) : null;
    }

    public String getAutor()
    {
        return autor != null ? autor.toHexString() : null;
    }

    public void setAutor(String autorId)
    {
        this.autor = autorId != null ? new ObjectId(autorId) : null;
    }

    public String getContenido()
    {
        return contenido;
    }

    public void setContenido(String contenido)
    {
        this.contenido = contenido;
    }

    public String getPadreId()
    {
        return padreId != null ? padreId.toHexString() : null;
    }

    public void setPadreId(String padreId)
    {
        this.padreId = (padreId != null && !padreId.isBlank()) ? new ObjectId(padreId) : null;
    }

    public List<String> getHilo()
    {
        if(hilo == null)
            return null;

        return hilo.stream().map(ObjectId::toHexString).collect(Collectors.toList());
    }

    public void setHilo(List<String> hiloIds)
    {
        if(hiloIds == null)
        {
            this.hilo = null;
            return;
        }

        this.hilo = hiloIds.stream().map(ObjectId::new).collect(Collectors.toList());
    }

    public int getPuntajeVotos()
    {
        return puntajeVotos;
    }

    public void setPuntajeVotos(int puntajeVotos)
    {
        this.puntajeVotos = puntajeVotos;
    }

    public boolean getEliminado()
    {
        return eliminado;
    }

    public void setEliminado(boolean eliminado)
    {
        this.eliminado = eliminado;
    }

    public Date getCreadoEn()
    {
        return creadoEn;
    }

    public void setCreadoEn(Date creadoEn)
    {
        this.creadoEn = creadoEn;
    }

    public Date getActualizadoEn()
    {
        return actualizadoEn;
    }

    public void setActualizadoEn(Date actualizadoEn)
    {
        this.actualizadoEn = actualizadoEn;
    }
}