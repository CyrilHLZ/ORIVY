package fr.orivy.Orivy.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/*
 * Ce qu'envoie le formulaire « Suggérer » :
 *   type « lieu » : nomLieu et adresse obligatoires (vérifiés par SuggestionService), catégorie et message facultatifs ;
 *   type « idee » : message obligatoire.
 * latitude / longitude : facultatives (le centre de la carte, si le membre coche « Le lieu est au centre de la carte »).
 */
public record NouvelleSuggestionDto(
        @NotBlank @Pattern(regexp = "lieu|idee", message = "Type de suggestion inconnu.") String type,
        @Size(max = 255, message = "255 caractères maximum.") String nomLieu,
        @Size(max = 50) String categorie,
        @Size(max = 255, message = "255 caractères maximum.") String adresse,
        Double latitude,
        Double longitude,
        @Size(max = 1000, message = "1 000 caractères maximum.") String message) {
}
