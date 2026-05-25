package seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.*;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@WebFilter("/*")
public class FiltroJWT implements Filter
{
    private static final String COOKIE_JWT = "jwt_token";
    private static final String LOGIN_URL = "/login";

    //Rutas que no requieren autenticacion
    private static final Set<String> RUTAS_PUBLICAS = new HashSet<>(Arrays.asList("/login", "/login.jsp", "/registro", "/registro.jsp", "/perfil-setup", "/perfil-setup.jsp"));

    //Rutas de api que son publicas
    private static final Set<String> API_RUTAS_PUBLICAS = new HashSet<>(Arrays.asList("/api/auth/login", "/api/auth/logout"));

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException
    {
        HttpServletRequest  req = (HttpServletRequest)request;
        HttpServletResponse res = (HttpServletResponse)response;

        String context_path = req.getContextPath();
        String request_uri = req.getRequestURI();
        String path = request_uri.substring(context_path.length());

        if ("OPTIONS".equalsIgnoreCase(req.getMethod()))
        {
            res.setHeader("Access-Control-Allow-Origin",  "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        if(path.startsWith("/css/") || path.startsWith("/js/") || path.startsWith("/imagenes/") || path.startsWith("/WEB-INF/"))
        {
            chain.doFilter(request, response);
            return;
        }

        //Rutas web publicas html
        if (RUTAS_PUBLICAS.contains(path))
        {
            chain.doFilter(request, response);
            return;
        }

        //Rutas de api publicas json
        if (API_RUTAS_PUBLICAS.contains(path))
        {
            chain.doFilter(request, response);
            return;
        }

        //Extrae token
        String token = extrae_token(req);

        if(token == null)
        {
            responde_sin_token(req, res, path, context_path);
            return;
        }

        try
        {
            Claims claims = JwtUtil.valida_token(token);

            req.setAttribute("jwt_userId", claims.getSubject());
            req.setAttribute("jwt_email", claims.get("email", String.class));
            req.setAttribute("jwt_nombreUsuario", claims.get("nombre_usuario", String.class));
            req.setAttribute("jwt_rol", claims.get("rol", String.class));

            chain.doFilter(request, response);
        }

        catch(JwtException | IllegalArgumentException ex)
        {
            //Token invalido o expirado
            elimina_cookie(res);

            if(es_ruta_api(path))
                responde_error_json(res, HttpServletResponse.SC_UNAUTHORIZED, "Token invalido o expirado");

            else
                res.sendRedirect(context_path + LOGIN_URL + "?sesion=expirada");
        }
    }

    private void responde_sin_token(HttpServletRequest req, HttpServletResponse res, String path, String contextPath) throws IOException
    {
        if(es_ruta_api(path))
            responde_error_json(res, HttpServletResponse.SC_UNAUTHORIZED, "Se requiere autenticacion");

        else
            res.sendRedirect(contextPath + LOGIN_URL);
    }

    private void responde_error_json(HttpServletResponse res, int status, String mensaje) throws IOException
    {
        res.setContentType("application/json;charset=UTF-8");
        res.setHeader("Access-Control-Allow-Origin",  "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setStatus(status);
        res.getWriter().write("{\"error\":\"" + escapa_json(mensaje) + "\"}");
    }

    private boolean es_ruta_api(String path)
    {
        return path.startsWith("/api/");
    }

    private String extrae_token(HttpServletRequest req)
    {
        //Busca en cookies
        if (req.getCookies() != null)
            for(Cookie c : req.getCookies())
                if(COOKIE_JWT.equals(c.getName()))
                    return c.getValue();

        //Busca en header Authorization: Bearer <token>
        String authHeader = req.getHeader("Authorization");

        if(authHeader != null && authHeader.startsWith("Bearer"))
            return authHeader.substring(7);

        return null;
    }

    private void elimina_cookie(HttpServletResponse res)
    {
        Cookie expirada = new Cookie(COOKIE_JWT, "");
        expirada.setMaxAge(0);
        expirada.setPath("/");
        res.addCookie(expirada);
    }

    private String escapa_json(String s)
    {
        return s == null ? "" : s.replace("\"", "\\\"").replace("\n", "\\n");
    }

    @Override public void init(FilterConfig fc)
    {

    }

    @Override public void destroy()
    {

    }
}