package agora.modelo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;

//Spring data solo acepta queries con camel case :((
@Document(collection = "USUARIO")
public class Usuario
{
    @Id
    private String id;
    @Field("nombre_usuario")
    private String nombreUsuario;
    private String email;
    private String contrasena;
    @Field("foto_perfil")
    private String fotoPerfil;
    private String biografia;
    @Field("karma")
    private int karma;
    @Field("comunidades_suscritas")
    private List<String> comunidadesSuscritas;
    @Field("creado_en")
    private Date creadoEn;
    private String rol;

    public Usuario()
    {

    }

    public Usuario(String nombreUsuario, String email, String contrasena)
    {
        this.nombreUsuario = nombreUsuario;
        this.email = email;
        this.contrasena = contrasena;
    }

    public String getId()
    {
        return id;
    }

    public void setId(String id)
    {
        this.id = id;
    }

    public String getNombreUsuario()
    {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario)
    {
        this.nombreUsuario = nombreUsuario;
    }

    public String getEmail()
    {
        return email;
    }

    public void setEmail(String email)
    {
        this.email = email;
    }

    public String getContrasena()
    {
        return contrasena;
    }
    public void setContrasena(String contrasena)
    {
        this.contrasena = contrasena;
    }

    public String getFotoPerfil()
    {
        return fotoPerfil;
    }

    public void setFotoPerfil(String fotoPerfil)
    {
        this.fotoPerfil = fotoPerfil;
    }

    public String getBiografia()
    {
        return biografia;
    }

    public void setBiografia(String biografia)
    {
        this.biografia = biografia;
    }

    public int getKarma()
    {
        return karma;
    }

    public void setKarma(int karma)
    {
        this.karma = karma;
    }

    public List<String> getComunidadesSuscritas()
    {
        return comunidadesSuscritas;
    }

    public void setComunidadesSuscritas(List<String> comunidadesSuscritas)
    {
        this.comunidadesSuscritas = comunidadesSuscritas;
    }

    public Date getCreadoEn()
    {
        return creadoEn;
    }
    public void setCreadoEn(Date creadoEn)
    {
        this.creadoEn = creadoEn;
    }

    public String getRol()
    {
        return rol;
    }

    public void setRol(String rol)
    {
        this.rol = rol;
    }
}