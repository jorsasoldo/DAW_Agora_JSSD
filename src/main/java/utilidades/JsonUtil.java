package utilidades;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.util.Map;

public class JsonUtil
{
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .setSerializationInclusion(JsonInclude.Include.ALWAYS);

    public static void cabeceras(HttpServletResponse res)
    {
        res.setContentType("application/json;charset=UTF-8");
        res.setCharacterEncoding("UTF-8");

        res.setHeader("Access-Control-Allow-Origin",  "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    //Respuesta 200 ok con cualquier objeto serializable
    public static void ok(HttpServletResponse res, Object objeto) throws IOException
    {
        res.setStatus(HttpServletResponse.SC_OK);
        MAPPER.writeValue(res.getWriter(), objeto);
    }

    //Respuesta de error con codigo HTTP y mensaje
    public static void error(HttpServletResponse res, int codigo, String mensaje) throws IOException
    {
        res.setStatus(codigo);
        ObjectNode nodo = MAPPER.createObjectNode();
        nodo.put("error", mensaje);
        MAPPER.writeValue(res.getWriter(), nodo);
    }

    //Lee el body completo como string
    public static String lee_body(HttpServletRequest req) throws IOException
    {
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = req.getReader();

        String linea;

        while ((linea = reader.readLine()) != null)
            sb.append(linea);

        return sb.toString();
    }

    //Parsea el body json y devuelve un Map<String, Object> listo para usar
    public static Map<String, Object> parsea_body(HttpServletRequest req) throws IOException
    {
        String body = lee_body(req);

        if (body == null || body.isBlank())
            return Map.of();

        return MAPPER.readValue(body, Map.class);
    }

    //Extrae un campo String de un map parseado
    public static String campo_string(Map<String, Object> datos, String campo)
    {
        Object valor = datos.get(campo);
        return (valor != null) ? valor.toString() : null;
    }

    //Convierte cualquier objeto serializable a string json
    public static String toJson(Object objeto) throws IOException
    {
        return MAPPER.writeValueAsString(objeto);
    }

    public static ObjectMapper getMapper()
    {
        return MAPPER;
    }

    //Valida que un string sea un objectid de MongoDB valido
    public static boolean es_objectid_valido(String id)
    {
        return id != null && id.matches("[0-9a-fA-F]{24}");
    }

}