package agora.controlador;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@ControllerAdvice
public class ManejadorExcepciones {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> maneja_response_status_exception(ResponseStatusException ex)
    {
        //Captura los errores controlados
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> maneja_cualquier_error(Exception ex)
    {
        //Captura cualquier otro error fisico
        ex.printStackTrace();

        return ResponseEntity.internalServerError().body(Map.of("error", "Error interno del servidor: " + ex.getMessage()));
    }
}