package fr.orivy.Orivy.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
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

import fr.orivy.Orivy.DTO.ChangementEmail;
import fr.orivy.Orivy.DTO.ChangementMotDePasse;
import fr.orivy.Orivy.DTO.ReponseConnexion;
import fr.orivy.Orivy.DTO.UtilisateurPrivee;
import fr.orivy.Orivy.DTO.UtilisateurPublic;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Service.JetonService;
import fr.orivy.Orivy.Service.UtilisateurService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    private final JetonService jetonService;

    @Value("${orivy.dossier-uploads}")
    private String dossierUploads;

    public UtilisateurController(UtilisateurService utilisateurService, JetonService jetonService) {
        this.utilisateurService = utilisateurService;
        this.jetonService = jetonService;
    }

    @PostMapping("/inscription")
    @ResponseStatus(HttpStatus.CREATED)
    public UtilisateurPrivee inscription(@RequestBody Utilisateur utilisateur) {
        return UtilisateurPrivee.depuis(utilisateurService.creerUtilisateur(utilisateur));
    }

    @PutMapping("/{id}")
    public UtilisateurPrivee modifierUtilisateur(@PathVariable Long id, @RequestBody Utilisateur utilisateur,
                                             @AuthenticationPrincipal Jwt jwt) {
        if (!estLuiMemeOuAdmin(id, jwt)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu ne peux modifier que ton propre profil.");
        }
        return UtilisateurPrivee.depuis(utilisateurService.modifierUtilisateur(id, utilisateur));
    }


    @PostMapping("/connexion")
    public ReponseConnexion connexion(@RequestBody Utilisateur identifiants) {
        Utilisateur utilisateur = utilisateurService.authentifierUtilisateur(identifiants.getEmail(), identifiants.getMotDePasse());
        return new ReponseConnexion(jetonService.generateToken(utilisateur), UtilisateurPrivee.depuis(utilisateur));
    }

    @GetMapping
    public List<UtilisateurPublic> getAllUtilisateurs() {
        return utilisateurService.getAllUtilisateurs().stream().map(UtilisateurPublic::depuis).toList();
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
            return UtilisateurPrivee.depuis(utilisateur);
        }
        return UtilisateurPublic.depuis(utilisateur);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimerUtilisateur(@PathVariable Long id) {
        utilisateurService.supprimerUtilisateur(id);
    }

    @PutMapping("/moi/mot-de-passe")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changerMotDePasse(@RequestBody ChangementMotDePasse demande, @AuthenticationPrincipal Jwt jwt) {
        utilisateurService.changerMotDePasse(Long.valueOf(jwt.getSubject()),
                demande.ancienMotDePasse(), demande.nouveauMotDePasse());
    }

    // Envoi d'une photo de profil (formulaire « multipart », champ « photo »)
    @PostMapping("/moi/photo")
    public UtilisateurPrivee changerPhoto(@RequestParam("photo") MultipartFile photo, @AuthenticationPrincipal Jwt jwt) throws IOException {
        return UtilisateurPrivee.depuis(utilisateurService.changerPhoto(Long.valueOf(jwt.getSubject()), photo, dossierUploads));
    }

    @PutMapping("/moi/email")
    public UtilisateurPrivee changerEmail(@Valid @RequestBody ChangementEmail demande, @AuthenticationPrincipal Jwt jwt) {
        return UtilisateurPrivee.depuis(utilisateurService.changerEmail(Long.valueOf(jwt.getSubject()),
                demande.motDePasse(), demande.nouvelEmail()));
    }
}
