package fr.orivy.Orivy.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.DTO.ChangementEmailDto;
import fr.orivy.Orivy.DTO.ChangementMotDePasseDto;
import fr.orivy.Orivy.DTO.ReponseConnexionDto;
import fr.orivy.Orivy.DTO.UtilisateurPriveeDto;
import fr.orivy.Orivy.DTO.UtilisateurPublicDto;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Service.JetonService;
import fr.orivy.Orivy.Service.UtilisateurService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    private final JetonService jetonService;


    public UtilisateurController(UtilisateurService utilisateurService, JetonService jetonService) {
        this.utilisateurService = utilisateurService;
        this.jetonService = jetonService;
    }

    @PostMapping("/inscription")
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurPriveeDto inscription(@RequestBody Utilisateur utilisateur) {
        return UtilisateurPriveeDto.depuis(utilisateurService.creerUtilisateur(utilisateur));
    }

    @PutMapping("/{id}")
    public UtilisateurPriveeDto modifierUtilisateur(@PathVariable Long id, @RequestBody Utilisateur utilisateur,
                                             @AuthenticationPrincipal Jwt jwt) {
        if (!estLuiMemeOuAdmin(id, jwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu ne peux modifier que ton propre profil.");
        }
        return UtilisateurPriveeDto.depuis(utilisateurService.modifierUtilisateur(id, utilisateur));
    }


    @PostMapping("/connexion")
    public ReponseConnexionDto connexion(@RequestBody Utilisateur identifiants) {
        Utilisateur utilisateur = utilisateurService.authentifierUtilisateur(identifiants.getEmail(), identifiants.getMotDePasse());
        return new ReponseConnexionDto(jetonService.generateToken(utilisateur), UtilisateurPriveeDto.depuis(utilisateur));
    }

    @GetMapping
    public List<UtilisateurPublicDto> getAllUtilisateurs() {
        return utilisateurService.getAllUtilisateurs().stream().map(UtilisateurPublicDto::depuis).toList();
    }

    // L'appelant est-il ce membre, ou un admin ? (pour voir tout le profil, ou le modifier)
    private boolean estLuiMemeOuAdmin(Long id, Jwt jwt) {
        boolean estAdmin = "admin".equalsIgnoreCase(jwt.getClaimAsString("role"));
        boolean estProprietaire = jwt.getSubject().equals(id.toString());
        return estAdmin || estProprietaire;
    }

    @GetMapping("/{id}")
    public Object getUtilisateur(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Utilisateur utilisateur = utilisateurService.getUtilisateur(id);
        if (estLuiMemeOuAdmin(id, jwt)) {
            return UtilisateurPriveeDto.depuis(utilisateur);
        }
        return UtilisateurPublicDto.depuis(utilisateur);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimerUtilisateur(@PathVariable Long id) {
        utilisateurService.supprimerUtilisateur(id);
    }

    @PutMapping("/moi/mot-de-passe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changerMotDePasse(@RequestBody ChangementMotDePasseDto demande, @AuthenticationPrincipal Jwt jwt) {
        utilisateurService.changerMotDePasse(Long.valueOf(jwt.getSubject()),
                demande.ancienMotDePasse(), demande.nouveauMotDePasse());
    }

    // Envoi d'une photo de profil (formulaire « multipart », champ « photo »)
    @PostMapping("/moi/photo")
    public UtilisateurPriveeDto changerPhoto(@RequestParam("photo") MultipartFile photo, @AuthenticationPrincipal Jwt jwt) throws IOException {
        return UtilisateurPriveeDto.depuis(utilisateurService.changerPhoto(Long.valueOf(jwt.getSubject()), photo));
    }

    @PutMapping("/moi/email")
    public UtilisateurPriveeDto changerEmail(@Valid @RequestBody ChangementEmailDto demande, @AuthenticationPrincipal Jwt jwt) {
        return UtilisateurPriveeDto.depuis(utilisateurService.changerEmail(Long.valueOf(jwt.getSubject()),
                demande.motDePasse(), demande.nouvelEmail()));
    }
}
