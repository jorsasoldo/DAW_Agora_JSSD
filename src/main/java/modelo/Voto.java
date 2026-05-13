package modelo;

import java.io.Serializable;

public class Voto implements Serializable
{
    private static final long serialVersionUID = 1L;

    private String id;
    private String usuario_id;
    private String objetivo_id;
    private String tipo_objetivo;
    private String autor_objetivo_id;
    private int valor;

    public Voto()
    {

    }

    public Voto(String usuario_id, String objetivo_id, String tipo_objetivo, String autor_objetivo_id, int valor)
    {
        this.usuario_id = usuario_id;
        this.objetivo_id = objetivo_id;
        this.tipo_objetivo = tipo_objetivo;
        this.autor_objetivo_id = autor_objetivo_id;
        this.valor = valor;
    }

    public String get_id()
    {
        return id;
    }

    public void set_id(String id)
    {
        this.id = id;
    }

    public String get_usuario_id()
    {
        return usuario_id;
    }

    public void set_usuario_id(String usuario_id)
    {
        this.usuario_id = usuario_id;
    }

    public String get_objetivo_id()
    {
        return objetivo_id;
    }

    public void set_objetivo_id(String objetivo_id)
    {
        this.objetivo_id = objetivo_id;
    }

    public String get_tipo_objetivo()
    {
        return tipo_objetivo;
    }

    public void set_tipo_objetivo(String tipo_objetivo)
    {
        this.tipo_objetivo = tipo_objetivo;
    }

    public String get_autor_objetivo_id()
    {
        return autor_objetivo_id;
    }

    public void set_autor_objetivo_id(String autor_objetivo_id)
    {
        this.autor_objetivo_id = autor_objetivo_id;
    }

    public int get_valor()
    {
        return valor;
    }

    public void set_valor(int valor)
    {
        this.valor = valor;
    }

    @Override
    public String toString()
    {
        return "Voto{id=" + id + ", usuario_id=" + usuario_id + ", objetivo_id=" + objetivo_id + ", tipo_objetivo=" + tipo_objetivo + ", valor=" + valor + "}";
    }
}