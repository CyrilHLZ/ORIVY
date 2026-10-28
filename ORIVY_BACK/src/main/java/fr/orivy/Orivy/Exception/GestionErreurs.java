package fr.orivy.Orivy.Exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;


import fr.orivy.Orivy.DTO.ErreurApiDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestControllerAdvice
public class GestionErreurs {

    private static final Logger log = LoggerFactory.getLogger(GestionErreurs.class);

        // 400 : le corps de la requête n'est pas du JSON valide
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErreurApiDto> jsonInvalide(HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest().body(ErreurApiDto.simple("La requête est mal formée."));
    }

    // 413 : fichier envoyé trop lourd (limite dans application.properties)
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErreurApiDto> fichierTropLourd(MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).body(ErreurApiDto.simple("La photo ne doit pas dépasser 2 Mo."));
    }

    // 404 : l'adresse demandée n'existe pas
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErreurApiDto> adresseInconnue(NoResourceFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ErreurApiDto.simple("Cette adresse n'existe pas."));
    }

    // 400 : un champ ne respecte pas @NotBlank, @NotNull…
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErreurApiDto> validation(MethodArgumentNotValidException e) {
        Map<String, String> champs = new LinkedHashMap<>();
        for (FieldError erreur : e.getBindingResult().getFieldErrors()) {
            champs.put(erreur.getField(), erreur.getDefaultMessage());
        }
        String premier = champs.values().iterator().next();   // le message principal = la première erreur
        return ResponseEntity.badRequest().body(new ErreurApiDto(premier, champs));
    }

    // 403, 404, 409… : les erreurs que tu lances toi-même avec throw new ResponseStatusException(...)
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErreurApiDto> statut(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(ErreurApiDto.simple(e.getReason()));
    }

    // 500 : tout le reste (bug, erreur de base de données…)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErreurApiDto> inattendue(Exception e) {
        log.error("Erreur inattendue", e);   // le détail reste dans la console du back
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErreurApiDto.simple("Une erreur est survenue. Réessaie plus tard."));
    }
}
