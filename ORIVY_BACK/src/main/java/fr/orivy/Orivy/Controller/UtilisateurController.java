package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Service.UtilisateurService;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "*")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;
    
    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @PostMapping("/inscription")
    public String creerUtilisateur(@RequestBody Utilisateur utilisateur) {
        return utilisateurService.creerUtilisateur(utilisateur);
    }

    public String modifierUtilisateur(@RequestBody Utilisateur utilisateur) {
        return utilisateurService.modifierUtilisateur(utilisateur);
    }

    public String supprimerUtilisateur(String email) {
        return utilisateurService.supprimerUtilisateur(email);
    }

    public Utilisateur getUtilisateur(@PathVariable String email) {
        return utilisateurService.getUtilisateur(email);
    }

    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurService.getAllUtilisateurs();
    }

    @PostMapping("/connexion")
    public String authentifierUtilisateur(@RequestBody Utilisateur utilisateur) {
        String email = utilisateur.getEmail();
        String motDePasse = utilisateur.getMotDePasse();
        return utilisateurService.authentifierUtilisateur(email, motDePasse);
    }

    public String deconnecterUtilisateur(String email) {
        return utilisateurService.deconnecterUtilisateur(email);
    }

    public String recupererMotDePasse(String email) {
        return utilisateurService.recupererMotDePasse(email);
    }

    public String modifierMotDePasse(String email, String nouveauMotDePasse) {
        return utilisateurService.modifierMotDePasse(email, nouveauMotDePasse);
    }

    public String modifierRoleUtilisateur(String email, String nouveauRole) {
        return utilisateurService.modifierRoleUtilisateur(email, nouveauRole);
    }

}
