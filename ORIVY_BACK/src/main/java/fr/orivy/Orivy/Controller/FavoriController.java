package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.FavoriDto;
import fr.orivy.Orivy.Service.FavoriService;

@RestController
@RequestMapping("/api/favoris")
public class FavoriController {

    private final FavoriService favoriService;

    public FavoriController(FavoriService favoriService) {
        this.favoriService = favoriService;
    }

    @GetMapping
    public List<FavoriDto> mesFavoris(@AuthenticationPrincipal Jwt jwt) {
        return favoriService.mesFavoris(idDe(jwt)).stream().map(FavoriDto::depuis).toList();
    }

    @PostMapping("/{cibleType}/{cibleId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FavoriDto ajouter(@PathVariable String cibleType, @PathVariable Long cibleId, @AuthenticationPrincipal Jwt jwt) {
        return FavoriDto.depuis(favoriService.ajouter(idDe(jwt), cibleType, cibleId));
    }

    @DeleteMapping("/{cibleType}/{cibleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void retirer(@PathVariable String cibleType, @PathVariable Long cibleId, @AuthenticationPrincipal Jwt jwt) {
        favoriService.retirer(idDe(jwt), cibleType, cibleId);
    }

    private Long idDe(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
