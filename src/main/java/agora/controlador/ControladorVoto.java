package agora.controlador;

import agora.modelo.Voto;

import agora.servicio.ServicioVoto;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/votos")
public class ControladorVoto
{
    private final ServicioVoto servicio_voto;

    public ControladorVoto(ServicioVoto servicio_voto)
    {
        this.servicio_voto = servicio_voto;
    }

    @GetMapping
    public ResponseEntity<?> buscar(@RequestParam String objetivo, @RequestParam(required = false) String usuario, HttpServletRequest req)
    {
        String id_usuario = (usuario != null) ? usuario : (String)req.getAttribute("jwt_usuario_id");

        if(objetivo == null || !objetivo.matches("[0-9a-fA-F]{24}") || id_usuario == null || !id_usuario.matches("[0-9a-fA-F]{24}"))
            return ResponseEntity.badRequest().body(Map.of("error", "Parametros objetivo y usuario son obligatorios y deben ser ids validos"));

        Optional<Voto> voto_opt = servicio_voto.busca_voto(id_usuario, objetivo);

        Map<String, Object> m = new LinkedHashMap<>();

        if(voto_opt.isEmpty())
        {
            m.put("existe", false);
            m.put("valor", 0);
        }

        else
        {
            Voto v = voto_opt.get();

            m.put("existe", true);
            m.put("id", v.getId());
            m.put("usuario_id", v.getUsuarioId());
            m.put("objetivo_id", v.getObjetivoId());
            m.put("tipo_objetivo", v.getTipoObjetivo());
            m.put("valor", v.getValor());
        }

        return ResponseEntity.ok(m);
    }

    @PostMapping
    public ResponseEntity<?> votar(@RequestBody Map<String, Object> body, HttpServletRequest req)
    {
        String id_votante = (String)req.getAttribute("jwt_usuario_id");
        String id_objetivo = (String)body.get("objetivo_id");
        String tipo_objetivo = (String)body.get("tipo_objetivo");

        if(id_objetivo == null || !id_objetivo.matches("[0-9a-fA-F]{24}"))
            return ResponseEntity.badRequest().body(Map.of("error", "El campo objetivo_id es obligatorio"));

        int valor;

        try
        {
            valor = Integer.parseInt(String.valueOf(body.getOrDefault("valor", "0")));
        }

        catch (NumberFormatException e)
        {
            return ResponseEntity.badRequest().body(Map.of("error", "El campo valor debe ser 1, -1 o 0"));
        }

        Map<String, Object> resultado = servicio_voto.procesa_voto(id_votante, id_objetivo, tipo_objetivo, valor);

        return ResponseEntity.ok(resultado);
    }
}