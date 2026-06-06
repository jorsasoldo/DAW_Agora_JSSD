package agora.modelo;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private List<ObjectId> moderadores;
    @Field("total_miembros")
    private int totalMiembros;
    @Field("creado_por")
    private ObjectId creadoPor;
    @Field("creado_en")
    private Date creadoEn;
    @Field("es_privada")
    private boolean esPrivada;
    @Field("invitados_pendientes")
    private List<ObjectId> invitadosPendientes;

    public Comunidad()
    {

    }

    public Comunidad(String nombre, String creadoPorId)
    {
        this.nombre = nombre;
        this.creadoPor = new ObjectId(creadoPorId);
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
        if(moderadores == null)
            return null;

        return moderadores.stream().map(ObjectId::toHexString).collect(Collectors.toList());
    }

    public void setModeradores(List<String> moderadoresIds)
    {
        if(moderadoresIds == null)
        {
            this.moderadores = null;
            return;
        }

        this.moderadores = moderadoresIds.stream().map(ObjectId::new).collect(Collectors.toList());
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
        return creadoPor != null ? creadoPor.toHexString() : null;
    }

    public void setCreadoPor(String creadoPorId)
    {
        this.creadoPor = creadoPorId != null ? new ObjectId(creadoPorId) : null;
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

    public List<String> getInvitadosPendientes()
    {
        if(invitadosPendientes == null)
            return null;

        return invitadosPendientes.stream().map(ObjectId::toHexString).collect(Collectors.toList());
    }

    public void setInvitadosPendientes(List<String> ids)
    {
        if(ids == null)
            {this.invitadosPendientes = null; return;}

        this.invitadosPendientes = ids.stream().map(ObjectId::new).collect(Collectors.toList());
    }
}