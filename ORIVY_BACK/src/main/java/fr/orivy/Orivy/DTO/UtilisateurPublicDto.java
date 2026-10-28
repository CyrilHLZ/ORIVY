package fr.orivy.Orivy.DTO;

import fr.orivy.Orivy.Model.Utilisateur;

public record UtilisateurPublicDto(Long id, String prenom, String nom, String ville, String bio, String photoUrl) {

    public static UtilisateurPublicDto depuis(Utilisateur u) {
        return new UtilisateurPublicDto(u.getId(), u.getPrenom(), u.getNom(), u.getVille(), u.getBio(), u.getPhotoUrl());
    }
}

