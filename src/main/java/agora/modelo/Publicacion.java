package agora.modelo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;

@Document(collection = "PUBLICACION")
public class Publicacion
{
    @Id
    private String id;
    private String titulo;
    private String tipo;
    private String contenido;
    private String enlace;
    @Field("url_imagen")
    private String urlImagen;
    private String autor;
    private String comunidad;
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

    public Publicacion(String titulo, String tipo, String autor, String comunidad)
    {
        this.titulo = titulo;
        this.tipo = tipo;
        this.autor = autor;
        this.comunidad = comunidad;
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

    public String getTipo()
    {
        return tipo;
    }

    public void setTipo(String tipo)
    {
        this.tipo = tipo;
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
        return autor;
    }

    public void setAutor(String autor)
    {
        this.autor = autor;
    }

    public String getComunidad()
    {
        return comunidad;
    }

    public void setComunidad(String comunidad)
    {
        this.comunidad = comunidad;
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