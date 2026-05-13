package modelo;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

public class Comentario implements Serializable
{
    private static final long serialVersionUID = 1L;

    private String id;
    private String publicacion_id;
    private String autor;
    private String contenido;
    private String padre_id;
    private List<String> hilo;
    private int puntaje_votos;
    private boolean eliminado;
    private Date creado_en;
    private Date actualizado_en;

    public Comentario()
    {

    }

    public Comentario(String publicacion_id, String autor, String contenido)
    {
        this.publicacion_id = publicacion_id;
        this.autor = autor;
        this.contenido = contenido;
    }

    public String get_id()
    {
        return id;
    }

    public void set_id(String id)
    {
        this.id = id;
    }

    public String get_publicacion_id()
    {
        return publicacion_id;
    }

    public void set_publicacion_id(String publicacion_id)
    {
        this.publicacion_id = publicacion_id;
    }

    public String get_autor()
    {
        return autor;
    }

    public void set_autor(String autor)
    {
        this.autor = autor;
    }

    public String get_contenido()
    {
        return contenido;
    }

    public void set_contenido(String contenido)
    {
        this.contenido = contenido;
    }

    public String get_padre_id()
    {
        return padre_id;
    }

    public void set_padre_id(String padre_id)
    {
        this.padre_id = padre_id;
    }

    public List<String> get_hilo()
    {
        return hilo;
    }

    public void set_hilo(List<String> hilo)
    {
        this.hilo = hilo;
    }

    public int get_puntaje_votos()
    {
        return puntaje_votos;
    }

    public void set_puntaje_votos(int puntaje_votos)
    {
        this.puntaje_votos = puntaje_votos;
    }

    public boolean is_eliminado()
    {
        return eliminado;
    }

    public void set_eliminado(boolean eliminado)
    {
        this.eliminado = eliminado;
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
        return "Comentario{id=" + id + ", publicacion_id=" + publicacion_id + ", autor=" + autor + ", eliminado=" + eliminado + "}";
    }
}