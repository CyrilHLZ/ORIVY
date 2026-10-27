package fr.orivy.Orivy.DTO;

import java.time.LocalDate;

import fr.orivy.Orivy.Model.Utilisateur;

// Tout le profil sauf le mot de passe : pour soi-même et pour l'admin
public record UtilisateurPrivee(Long id, String nom, String prenom, LocalDate dateDeNaissance,
                                String email, String role, String numeroTelephone, String adresse,
                                String ville, String codePostal, String pays, String bio) {

    public static UtilisateurPrivee depuis(Utilisateur u) {
        return new UtilisateurPrivee(u.getId(), u.getNom(), u.getPrenom(), u.getDateDeNaissance(),
                                     u.getEmail(), u.getRole(), u.getNumeroTelephone(), u.getAdresse(),
                                     u.getVille(), u.getCodePostal(), u.getPays(), u.getBio());
    }
}
