package modelo;

import java.io.Serializable;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class Comunidad implements Serializable
{
    private static final long serialVersionUID = 1L;

    private String id;
    private String nombre;
    private String descripcion;
    private String banner;
    private String icono;
    private List<Map<String, String>> reglas;
    private List<String> moderadores;
    private int total_miembros;
    private String creado_por;
    private Date creado_en;
    private boolean es_privada;

    public Comunidad()
    {

    }

    public Comunidad(String nombre, String creado_por)
    {
        this.nombre = nombre;
        this.creado_por = creado_por;
    }

    public String get_id()
    {
        return id;
    }

    public void set_id(String id)
    {
        this.id = id;
    }

    public String get_nombre()
    {
        return nombre;
    }

    public void set_nombre(String nombre)
    {
        this.nombre = nombre;
    }

    public String get_descripcion()
    {
        return descripcion;
    }

    public void set_descripcion(String descripcion)
    {
        this.descripcion = descripcion;
    }

    public String get_banner()
    {
        return banner;
    }

    public void set_banner(String banner)
    {
        this.banner = banner;
    }

    public String get_icono()
    {
        return icono;
    }

    public void set_icono(String icono)
    {
        this.icono = icono;
    }

    public List<Map<String, String>> get_reglas()
    {
        return reglas;
    }

    public void set_reglas(List<Map<String, String>> reglas)
    {
        this.reglas = reglas;
    }

    public List<String> get_moderadores()
    {
        return moderadores;
    }

    public void set_moderadores(List<String> moderadores)
    {
        this.moderadores = moderadores;
    }

    public int get_total_miembros()
    {
        return total_miembros;
    }

    public void set_total_miembros(int total_miembros)
    {
        this.total_miembros = total_miembros;
    }

    public String get_creado_por()
    {
        return creado_por;
    }

    public void set_creado_por(String creado_por)
    {
        this.creado_por = creado_por;
    }

    public Date get_creado_en()
    {
        return creado_en;
    }

    public void set_creado_en(Date creado_en)
    {
        this.creado_en = creado_en;
    }

    public boolean is_es_privada()
    {
        return es_privada;
    }

    public void set_es_privada(boolean es_privada)
    {
        this.es_privada = es_privada;
    }

    @Override
    public String toString()
    {
        return "Comunidad{id=" + id + ", nombre=" + nombre + ", creado_por=" + creado_por + ", total_miembros=" + total_miembros + "}";
    }
}