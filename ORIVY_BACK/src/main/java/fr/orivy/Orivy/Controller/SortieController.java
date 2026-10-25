package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.SortieDto;
import fr.orivy.Orivy.Model.Sortie;
import fr.orivy.Orivy.Service.SortieService;

@RestController
@RequestMapping("/api/sorties")
@CrossOrigin(origins = "*")
public class SortieController {

    private final SortieService sortieService;

    public SortieController(SortieService sortieService) {
        this.sortieService = sortieService;
    }

    @GetMapping
    public List<SortieDto> getAllSorties() {
        return sortieService.getAllSorties().stream().map(SortieDto::depuis).toList();
    }

    @GetMapping("/{id}")
    public SortieDto getSortie(@PathVariable Long id) {
        return SortieDto.depuis(sortieService.getSortie(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SortieDto creerSortie(@RequestBody Sortie sortie, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.creerSortie(sortie, idDe(jwt)));
    }

    @PutMapping("/{id}")
    public SortieDto modifierSortie(@PathVariable Long id, @RequestBody Sortie sortie, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.modifierSortie(id, sortie, idDe(jwt), estAdmin(jwt)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimerSortie(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        sortieService.supprimerSortie(id, idDe(jwt), estAdmin(jwt));
    }

    // utilisateurId deviendra obligatoire quand Utilisateur sera une vraie entité
    @PostMapping("/{id}/inscription")
    public void inscription(@PathVariable Long id, @RequestParam(required = false) Long utilisateurId) {
        sortieService.inscrireUtilisateurASortie(id, utilisateurId);
    }

    @DeleteMapping("/{id}/inscription")
    public void desinscription(@PathVariable Long id, @RequestParam(required = false) Long utilisateurId) {
        sortieService.desinscrireUtilisateurDeSortie(id, utilisateurId);
    }

    private Long idDe(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    private boolean estAdmin(Jwt jwt) {
        return "admin".equalsIgnoreCase(jwt.getClaimAsString("role"));
    }
}
