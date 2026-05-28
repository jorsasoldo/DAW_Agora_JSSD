package agora.controlador;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ControladorVistas
{
    @GetMapping("/login")
    public String login()
    {
        return "login";
    }

    @GetMapping("/")
    public String inicio()
    {
        return "redirect:/login";
    }

    @GetMapping("/registro")
    public String registro()
    {
        return "registro";
    }

    @GetMapping("/perfil-setup")
    public String perfilSetup()
    {
        return "perfil-setup";
    }
}