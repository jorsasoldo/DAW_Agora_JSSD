package agora.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtFiltroAutenticacion extends OncePerRequestFilter
{
    private final JwtUtil jwt_util;

    public JwtFiltroAutenticacion(JwtUtil jwt_util)
    {
        this.jwt_util = jwt_util;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException
    {
        String token = extrae_token(req);

        if(token != null)
        {
            try
            {
                Claims claims = jwt_util.valida_token(token);

                String usuario_id = claims.getSubject();
                String rol = claims.get("rol", String.class);
                String email = claims.get("email", String.class);
                String nombre_usuario = claims.get("nombre_usuario", String.class);

                //Guarda los atributos para usarlos en los controladores
                req.setAttribute("jwt_usuario_id", usuario_id);
                req.setAttribute("jwt_email", email);
                req.setAttribute("jwt_nombre_usuario", nombre_usuario);
                req.setAttribute("jwt_rol", rol);

                var auth = new UsernamePasswordAuthenticationToken(usuario_id, null, List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase())));

                SecurityContextHolder.getContext().setAuthentication(auth);
            }

            catch(JwtException | IllegalArgumentException ex)
            {
                //Si es un token invalido limpia la cookie y deja que spring security la rechace
                elimina_cookie(res);
            }
        }

        chain.doFilter(req, res);
    }

    private String extrae_token(HttpServletRequest req)
    {
        if(req.getCookies() != null)
            for(Cookie c : req.getCookies())
                if("jwt_token".equals(c.getName()))
                    return c.getValue();

        String auth = req.getHeader("Authorization");

        if(auth != null && auth.startsWith("Bearer "))
            return auth.substring(7);

        return null;
    }

    private void elimina_cookie(HttpServletResponse res)
    {
        Cookie expirada = new Cookie("jwt_token", "");
        expirada.setMaxAge(0);
        expirada.setPath("/");
        res.addCookie(expirada);
    }
}