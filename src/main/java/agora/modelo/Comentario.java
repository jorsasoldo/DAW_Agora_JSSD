package agora.modelo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;

@Document(collection = "COMENTARIO")
public class Comentario
{
    @Id
    private String id;
    @Field("publicacion_id")
    private String publicacionId;
    private String autor;
    private String contenido;
    @Field("padre_id")
    private String padreId;
    private List<String> hilo;
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

    public Comentario(String publicacionId, String autor, String contenido)
    {
        this.publicacionId = publicacionId;
        this.autor = autor;
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
        return publicacionId;
    }

    public void setPublicacionId(String publicacionId)
    {
        this.publicacionId = publicacionId;
    }

    public String getAutor()
    {
        return autor;
    }

    public void setAutor(String autor)
    {
        this.autor = autor;
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
        return padreId;
    }

    public void setPadreId(String padreId)
    {
        this.padreId = padreId;
    }

    public List<String> getHilo()
    {
        return hilo;
    }

    public void setHilo(List<String> hilo)
    {
        this.hilo = hilo;
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