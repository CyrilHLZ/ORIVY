package fr.orivy.Orivy.DTO;

import fr.orivy.Orivy.Model.Categorie;

// Ce que l'API renvoie / reçoit pour une catégorie
public record CategorieDto(Long id, String cle, String nom, String pluriel, String emoji, String couleur, Integer ordre) {

    public static CategorieDto depuis(Categorie c) {
        return new CategorieDto(c.getId(), c.getCle(), c.getNom(), c.getPluriel(), c.getEmoji(), c.getCouleur(), c.getOrdre());
    }
}
