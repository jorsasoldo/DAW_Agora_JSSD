package seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public class JwtUtil
{
    //Duracion de token de 8 hrs en milisegundos
    private static final long EXPIRACION_MS = 8 * 60 * 60 * 1000L;

    //Lee la clave secreta desde variable de entorno
    private static final String SECRET_ENV = System.getenv("JWT_SECRET");

    private static final SecretKey CLAVE = Keys.hmacShaKeyFor(SECRET_ENV.getBytes(StandardCharsets.UTF_8));

    public static String genera_token(String id, String email, String nombre_usuario, String rol)
    {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + EXPIRACION_MS);

        return Jwts.builder().subject(id).claim("email", email).claim("nombre_usuario", nombre_usuario).claim("rol", rol).issuedAt(ahora).expiration(expira).signWith(CLAVE).compact();
    }

    public static Claims valida_token(String token)
    {
        return Jwts.parser().verifyWith(CLAVE).build().parseSignedClaims(token).getPayload();
    }

    public static String get_id(String token)
    {
        return valida_token(token).getSubject();
    }

    public static String get_email(String token)
    {
        return (String) valida_token(token).get("email");
    }

    public static String get_nombre_usuario(String token)
    {
        return (String) valida_token(token).get("nombre_usuario");
    }

    public static String get_rol(String token)
    {
        return (String) valida_token(token).get("rol");
    }
}