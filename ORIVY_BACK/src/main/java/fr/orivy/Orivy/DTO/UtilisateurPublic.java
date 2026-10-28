package fr.orivy.Orivy.DTO;

import fr.orivy.Orivy.Model.Utilisateur;

public record UtilisateurPublic(Long id, String prenom, String nom, String ville, String bio, String photoUrl) {

    public static UtilisateurPublic depuis(Utilisateur u) {
        return new UtilisateurPublic(u.getId(), u.getPrenom(), u.getNom(), u.getVille(), u.getBio(), u.getPhotoUrl());
    }
}

