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

import fr.orivy.Orivy.DTO.UtilisateurPublicDto;
import fr.orivy.Orivy.Service.AbonnementService;

@RestController
@RequestMapping("/api/utilisateurs/{id}")
public class AbonnementController {

    private final AbonnementService abonnementService;

    public AbonnementController(AbonnementService abonnementService) {
        this.abonnementService = abonnementService;
    }

    @PostMapping("/abonnement")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void suivre(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        abonnementService.suivre(Long.valueOf(jwt.getSubject()), id);
    }

    @DeleteMapping("/abonnement")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void neplusSuivre(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        abonnementService.neplusSuivre(Long.valueOf(jwt.getSubject()), id);
    }

    @GetMapping("/abonnes")
    public List<UtilisateurPublicDto> abonnes(@PathVariable Long id) {
        return abonnementService.abonnes(id).stream().map(UtilisateurPublicDto::depuis).toList();
    }

    @GetMapping("/abonnements")
    public List<UtilisateurPublicDto> abonnements(@PathVariable Long id) {
        return abonnementService.abonnements(id).stream().map(UtilisateurPublicDto::depuis).toList();
    }
}
