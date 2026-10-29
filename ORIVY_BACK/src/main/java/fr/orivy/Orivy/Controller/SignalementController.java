package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.NouveauSignalementDto;
import fr.orivy.Orivy.DTO.SignalementDto;
import fr.orivy.Orivy.Service.SignalementService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/signalements")
public class SignalementController {

    private final SignalementService signalementService;

    public SignalementController(SignalementService signalementService) {
        this.signalementService = signalementService;
    }

    // Tout membre connecté
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SignalementDto signaler(@Valid @RequestBody NouveauSignalementDto demande, @AuthenticationPrincipal Jwt jwt) {
        return SignalementDto.depuis(signalementService.signaler(Long.valueOf(jwt.getSubject()), demande));
    }

    // Admin seulement (règle dans SecurityConfig)
    @GetMapping
    public List<SignalementDto> aTraiter() {
        return signalementService.aTraiter().stream().map(SignalementDto::depuis).toList();
    }

    @PutMapping("/{id}/traite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marquerTraite(@PathVariable Long id) {
        signalementService.marquerTraite(id);
    }
}
