package agora.controlador;

import org.apache.catalina.connector.ClientAbortException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@ControllerAdvice
public class ManejadorExcepciones
{

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> maneja_response_status_exception(ResponseStatusException ex)
    {
        //Captura los errores controlados
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> maneja_illegal_argument(IllegalArgumentException ex)
    {
        return ResponseEntity.badRequest().body(Map.of("error", "Id invalido: " + ex.getMessage()));
    }

    @ExceptionHandler(ClientAbortException.class)
    public void maneja_cliente_desconectado(ClientAbortException e)
    {
        //El cliente cerro la conexion antes de recibir la respuesta
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> maneja_cualquier_error(Exception ex)
    {
        //Captura cualquier otro error del servidor
        ex.printStackTrace();

        return ResponseEntity.internalServerError().body(Map.of("error", "Error interno del servidor: " + ex.getMessage()));
    }
}