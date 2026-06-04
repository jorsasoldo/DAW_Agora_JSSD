package agora.modelo;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;

@Document(collection = "PUBLICACION")
public class Publicacion
{
    @Id
    private String id;
    private String titulo;
    private List<String> tipos;
    private String contenido;
    private String enlace;
    @Field("url_imagen")
    private String urlImagen;
    private ObjectId autor;
    private ObjectId comunidad;
    @Field("puntaje_votos")
    private int puntajeVotos;
    @Field("votos_positivos")
    private int votosPositivos;
    @Field("votos_negativos")
    private int votosNegativos;
    @Field("total_comentarios")
    private int totalComentarios;
    private String etiqueta;
    private boolean fijada;
    private boolean bloqueada;
    @Field("creado_en")
    private Date creadoEn;
    @Field("actualizado_en")
    private Date actualizadoEn;

    public Publicacion()
    {

    }

    public Publicacion(String titulo, List<String> tipos, String autorId, String comunidadId)
    {
        this.titulo = titulo;
        this.tipos = tipos;
        this.autor = new ObjectId(autorId);
        this.comunidad = new ObjectId(comunidadId);
    }

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public String getTitulo()
    {
        return titulo;
    }

    public void setTitulo(String titulo)
    {
        this.titulo = titulo;
    }

    public List<String> getTipos()
    {
        return tipos;
    }

    public void setTipos(List<String> tipos)
    {
        this.tipos = tipos;
    }

    public String getContenido()
    {
        return contenido;
    }

    public void setContenido(String contenido)
    {
        this.contenido = contenido;
    }

    public String getEnlace()
    {
        return enlace;
    }

    public void setEnlace(String enlace)
    {
        this.enlace = enlace;
    }

    public String getUrlImagen()
    {
        return urlImagen;
    }

    public void setUrlImagen(String urlImagen)
    {
        this.urlImagen = urlImagen;
    }

    public String getAutor()
    {
        return autor != null ? autor.toHexString() : null;
    }

    public void setAutor(String autorId)
    {
        this.autor = autorId != null ? new ObjectId(autorId) : null;
    }

    public String getComunidad()
    {
        return comunidad != null ? comunidad.toHexString() : null;
    }

    public void setComunidad(String comunidadId)
    {
        this.comunidad = comunidadId != null ? new ObjectId(comunidadId) : null;
    }

    public int getPuntajeVotos()
    {
        return puntajeVotos;
    }

    public void setPuntajeVotos(int puntajeVotos)
    {
        this.puntajeVotos = puntajeVotos;
    }

    public int getVotosPositivos()
    {
        return votosPositivos;
    }

    public void setVotosPositivos(int votosPositivos)
    {
        this.votosPositivos = votosPositivos;
    }

    public int getVotosNegativos()
    {
        return votosNegativos;
    }

    public void setVotosNegativos(int votosNegativos)
    {
        this.votosNegativos = votosNegativos;
    }

    public int getTotalComentarios()
    {
        return totalComentarios;
    }

    public void setTotalComentarios(int totalComentarios)
    {
        this.totalComentarios = totalComentarios;
    }

    public String getEtiqueta()
    {
        return etiqueta;
    }

    public void setEtiqueta(String etiqueta)
    {
        this.etiqueta = etiqueta;
    }

    public boolean getFijada()
    {
        return fijada;
    }

    public void setFijada(boolean fijada)
    {
        this.fijada = fijada;
    }

    public boolean getBloqueada()
    {
        return bloqueada;
    }

    public void setBloqueada(boolean bloqueada)
    {
        this.bloqueada = bloqueada;
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