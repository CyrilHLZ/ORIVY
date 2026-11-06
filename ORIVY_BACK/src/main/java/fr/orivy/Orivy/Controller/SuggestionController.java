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

import fr.orivy.Orivy.DTO.NouvelleSuggestionDto;
import fr.orivy.Orivy.DTO.SuggestionDto;
import fr.orivy.Orivy.Service.SuggestionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/suggestions")
public class SuggestionController {

    private final SuggestionService suggestionService;

    public SuggestionController(SuggestionService suggestionService) {
        this.suggestionService = suggestionService;
    }

    // Tout membre connecté
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SuggestionDto suggerer(@Valid @RequestBody NouvelleSuggestionDto demande, @AuthenticationPrincipal Jwt jwt) {
        return SuggestionDto.depuis(suggestionService.suggerer(Long.valueOf(jwt.getSubject()), demande));
    }

    // Admin seulement (règles dans SecurityConfig)
    @GetMapping
    public List<SuggestionDto> aTraiter() {
        return suggestionService.aTraiter().stream().map(SuggestionDto::depuis).toList();
    }

    @PutMapping("/{id}/traitee")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marquerTraitee(@PathVariable Long id) {
        suggestionService.marquerTraitee(id);
    }
}
