package seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.*;
import java.io.IOException;

@WebFilter(filterName = "FiltroJWT")
public class FiltroJWT implements Filter
{
    private static final String COOKIE_JWT = "jwt_token";
    private static final String LOGIN_URL  = "/login";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
    {
        HttpServletRequest  req = (HttpServletRequest)  request;
        HttpServletResponse res = (HttpServletResponse) response;

        String token = extrae_token(req);

        if(token == null)
        {
            //Si no hay token redirige al login
            res.sendRedirect(req.getContextPath() + LOGIN_URL);
            return;
        }

        try
        {
            Claims claims = JwtUtil.valida_token(token);

            //Pone los datos del usuario como atributos del request
            req.setAttribute("jwt_userId", claims.getSubject());
            req.setAttribute("jwt_email", claims.get("email", String.class));
            req.setAttribute("jwt_nombreUsuario", claims.get("nombre_usuario", String.class));
            req.setAttribute("jwt_rol", claims.get("rol", String.class));

            chain.doFilter(request, response);
        }

        catch(JwtException | IllegalArgumentException ex)
        {
            //Si es un token invalido o expirado se limpia la cookie y redirige al login
            Cookie cookieExpirada = new Cookie(COOKIE_JWT,"");
            cookieExpirada.setMaxAge(0);
            cookieExpirada.setPath("/");
            res.addCookie(cookieExpirada);

            res.sendRedirect(req.getContextPath() + LOGIN_URL + "?sesion=expirada");
        }
    }

    private String extrae_token(HttpServletRequest req)
    {
        if(req.getCookies() != null)
        {
            for(Cookie c : req.getCookies())
            {
                if(COOKIE_JWT.equals(c.getName()))
                    return c.getValue();
            }
        }

        String authHeader = req.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer "))
            return authHeader.substring(7);

        return null;
    }

    @Override public void init(FilterConfig fc)
    {

    }

    @Override public void destroy()
    {

    }
}