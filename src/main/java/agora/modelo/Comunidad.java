package agora.modelo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;
import java.util.Map;

@Document(collection = "COMUNIDAD")
public class Comunidad
{
    @Id
    private String id;
    private String nombre;
    private String descripcion;
    private String banner;
    private String icono;
    private List<Map<String, String>> reglas;
    private List<String> moderadores;
    @Field("total_miembros")
    private int totalMiembros;
    @Field("creado_por")
    private String creadoPor;
    @Field("creado_en")
    private Date creadoEn;
    @Field("es_privada")
    private boolean esPrivada;

    public Comunidad()
    {

    }

    public Comunidad(String nombre, String creado_por)
    {
        this.nombre = nombre;
        this.creadoPor = creado_por;
    }

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public String getNombre()
    {
        return nombre;
    }
    public void setNombre(String nombre)
    {
        this.nombre = nombre;
    }

    public String getDescripcion()
    {
        return descripcion;
    }

    public void setDescripcion(String descripcion)
    {
        this.descripcion = descripcion;
    }

    public String getBanner()
    {
        return banner;
    }

    public void setBanner(String banner)
    {
        this.banner = banner;
    }

    public String getIcono()
    {
        return icono;
    }

    public void setIcono(String icono)
    {
        this.icono = icono;
    }

    public List<Map<String, String>> getReglas()
    {
        return reglas;
    }

    public void setReglas(List<Map<String, String>> reglas)
    {
        this.reglas = reglas;
    }

    public List<String> getModeradores()
    {
        return moderadores;
    }

    public void setModeradores(List<String> moderadores)
    {
        this.moderadores = moderadores;
    }

    public int getTotalMiembros()
    {
        return totalMiembros;
    }

    public void setTotalMiembros(int totalMiembros)
    {
        this.totalMiembros = totalMiembros;
    }

    public String getCreadoPor()
    {
        return creadoPor;
    }

    public void setCreadoPor(String creadoPor)
    {
        this.creadoPor = creadoPor;
    }

    public Date getCreadoEn()
    {
        return creadoEn;
    }

    public void setCreadoEn(Date creadoEn)
    {
        this.creadoEn = creadoEn;
    }

    public boolean getEsPrivada()
    {
        return esPrivada;
    }

    public void setEsPrivada(boolean esPrivada)
    {
        this.esPrivada = esPrivada;
    }
}