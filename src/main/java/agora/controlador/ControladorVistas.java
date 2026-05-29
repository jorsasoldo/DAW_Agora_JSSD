package agora.controlador;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ControladorVistas
{
    @GetMapping(value = "/")
    public String raiz()
    {
        return "forward:/index.html";
    }

    @GetMapping(value = "/{path:^(?!api).*}", produces = MediaType.TEXT_HTML_VALUE)
    public String spa()
    {
        return "forward:/index.html";
    }
}