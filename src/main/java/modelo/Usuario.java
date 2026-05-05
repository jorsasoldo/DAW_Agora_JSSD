package modelo;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

public class Usuario implements Serializable
{

    private static final long serialVersionUID = 1L;

    private String id;
    private String nombre_usuario;
    private String email;
    private String contrasena;
    private String foto_perfil;
    private String biografia;
    private int karma;
    private List<String> comunidades_suscritas;
    private Date creado_en;
    private String rol;

    public Usuario()
    {

    }

    public Usuario(String nombre_usuario, String email, String contrasena)
    {
        this.nombre_usuario = nombre_usuario;
        this.email = email;
        this.contrasena = contrasena;
    }

    public String get_id()
    {
        return id;
    }

    public void set_id(String id)
    {
        this.id = id;
    }

    public String get_nombre_usuario()
    {
        return nombre_usuario;
    }

    public void set_nombre_usuario(String nombre_usuario)
    {
        this.nombre_usuario = nombre_usuario;
    }

    public String get_email()
    {
        return email;
    }

    public void set_email(String email)
    {
        this.email = email;
    }

    public String get_contrasena()
    {
        return contrasena;
    }

    public void set_contrasena(String contrasena)
    {
        this.contrasena = contrasena;
    }

    public String get_foto_perfil()
    {
        return foto_perfil;
    }

    public void set_foto_perfil(String foto_perfil)
    {
        this.foto_perfil = foto_perfil;
    }

    public String get_biografia()
    {
        return biografia;
    }

    public void set_biografia(String biografia)
    {
        this.biografia = biografia;
    }

    public int get_karma()
    {
        return karma;
    }

    public void set_karma(int karma)
    {
        this.karma = karma;
    }

    public List<String> get_comunidades_suscritas()
    {
        return comunidades_suscritas;
    }

    public void set_comunidades_suscritas(List<String> sus)
    {
        this.comunidades_suscritas = sus;
    }

    public Date get_creado_en()
    {
        return creado_en;
    }

    public void set_creado_en(Date creado_en)
    {
        this.creado_en = creado_en;
    }

    public String get_rol()
    {
        return rol;
    }

    public void set_rol(String rol)
    {
        this.rol = rol;
    }

    @Override
    public String toString()
    {
        return "Usuario{id=" + id + ", nombre_usuario=" + nombre_usuario + ", email=" + email + ", rol=" + rol + "}";
    }
}