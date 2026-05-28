package agora.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil
{
    //Duracion de token de 8 hrs en milisegundos
    private static final long EXPIRACION_MS = 8 * 60 * 60 * 1000L;

    private final SecretKey clave;

    public JwtUtil(@Value("${jwt.secret}") String secret)
    {
        this.clave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String genera_token(String id, String email, String nombre_usuario, String rol)
    {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + EXPIRACION_MS);

        return Jwts.builder().subject(id).claim("email", email).claim("nombre_usuario", nombre_usuario).claim("rol", rol).issuedAt(ahora).expiration(expira).signWith(clave).compact();
    }

    public Claims valida_token(String token)
    {
        return Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
    }

    public String get_id(String token)
    {
        return valida_token(token).getSubject();
    }

    public String get_email(String token)
    {
        return valida_token(token).get("email", String.class);
    }

    public String get_nombre_usuario(String token)
    {
        return valida_token(token).get("nombre_usuario", String.class);
    }
    public String get_rol(String token)
    {
        return valida_token(token).get("rol", String.class);
    }
}