package modelo;

import java.io.Serializable;
import java.util.Date;

public class Publicacion implements Serializable
{
    private static final long serialVersionUID = 1L;

    private String id;
    private String titulo;
    private String tipo;
    private String contenido;
    private String enlace;
    private String url_imagen;
    private String autor;
    private String comunidad;
    private int puntaje_votos;
    private int votos_positivos;
    private int votos_negativos;
    private int total_comentarios;
    private String etiqueta;
    private boolean fijada;
    private boolean bloqueada;
    private Date creado_en;
    private Date actualizado_en;

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

    public String get_id()
    {
        return id;
    }

    public void set_id(String id)
    {
        this.id = id;
    }

    public String get_titulo()
    {
        return titulo;
    }

    public void set_titulo(String titulo)
    {
        this.titulo = titulo;
    }

    public String get_tipo()
    {
        return tipo;
    }

    public void set_tipo(String tipo)
    {
        this.tipo = tipo;
    }

    public String get_contenido()
    {
        return contenido;
    }

    public void set_contenido(String contenido)
    {
        this.contenido = contenido;
    }

    public String get_enlace()
    {
        return enlace;
    }

    public void set_enlace(String enlace)
    {
        this.enlace = enlace;
    }

    public String get_url_imagen()
    {
        return url_imagen;
    }

    public void set_url_imagen(String url_imagen)
    {
        this.url_imagen = url_imagen;
    }

    public String get_autor()
    {
        return autor;
    }

    public void set_autor(String autor)
    {
        this.autor = autor;
    }

    public String get_comunidad()
    {
        return comunidad;
    }

    public void set_comunidad(String comunidad)
    {
        this.comunidad = comunidad;
    }

    public int get_puntaje_votos()
    {
        return puntaje_votos;
    }

    public void set_puntaje_votos(int puntaje_votos)
    {
        this.puntaje_votos = puntaje_votos;
    }

    public int get_votos_positivos()
    {
        return votos_positivos;
    }

    public void set_votos_positivos(int votos_positivos)
    {
        this.votos_positivos = votos_positivos;
    }

    public int get_votos_negativos()
    {
        return votos_negativos;
    }

    public void set_votos_negativos(int votos_negativos)
    {
        this.votos_negativos = votos_negativos;
    }

    public int get_total_comentarios()
    {
        return total_comentarios;
    }

    public void set_total_comentarios(int total_comentarios)
    {
        this.total_comentarios = total_comentarios;
    }

    public String get_etiqueta()
    {
        return etiqueta;
    }

    public void set_etiqueta(String etiqueta)
    {
        this.etiqueta = etiqueta;
    }

    public boolean is_fijada()
    {
        return fijada;
    }

    public void set_fijada(boolean fijada)
    {
        this.fijada = fijada;
    }

    public boolean is_bloqueada()
    {
        return bloqueada;
    }

    public void set_bloqueada(boolean bloqueada)
    {
        this.bloqueada = bloqueada;
    }

    public Date get_creado_en()
    {
        return creado_en;
    }

    public void set_creado_en(Date creado_en)
    {
        this.creado_en = creado_en;
    }

    public Date get_actualizado_en()
    {
        return actualizado_en;
    }

    public void set_actualizado_en(Date actualizado_en)
    {
        this.actualizado_en = actualizado_en;
    }

    @Override
    public String toString()
    {
        return "Publicacion{id=" + id + ", titulo=" + titulo + ", tipo=" + tipo + ", autor=" + autor + ", comunidad=" + comunidad + "}";
    }
}