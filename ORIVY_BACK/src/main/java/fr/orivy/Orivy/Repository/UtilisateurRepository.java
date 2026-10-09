package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import fr.orivy.Orivy.Model.Utilisateur;

@Repository
public class UtilisateurRepository {

    public String creerUtilisateur(Utilisateur utilisateur) {
        return "Utilisateur créé avec succès";
    }

    public String modifierUtilisateur(Utilisateur utilisateur) {
        return "Utilisateur modifié avec succès";
    }

    public String supprimerUtilisateur(String email) {
        return "Utilisateur supprimé avec succès";
    }

    public Utilisateur getUtilisateur(String email) {
        return new Utilisateur();
    }

    public List<Utilisateur> getAllUtilisateurs() {
        return List.of(new Utilisateur(), new Utilisateur());
    }

    public String authentifierUtilisateur(String email, String motDePasse) {
        return "Utilisateur authentifié avec succès";
    }

    public String deconnecterUtilisateur(String email) {
        return "Utilisateur déconnecté avec succès";
    }

    public String recupererMotDePasse(String email) {
        return "Mot de passe récupéré avec succès";
    }

    public String modifierMotDePasse(String email, String nouveauMotDePasse) {
        return "Mot de passe modifié avec succès";
    }

    public String modifierRoleUtilisateur(String email, String nouveauRole) {
        return "Role de l'utilisateur modifié avec succès";
    }
}
