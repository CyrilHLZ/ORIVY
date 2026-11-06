package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.Suggestion;

public record SuggestionDto(Long id, UtilisateurPublicDto auteur, String type, String nomLieu, String categorie,
                            String adresse, Double latitude, Double longitude, String message, LocalDateTime dateCreation) {

    public static SuggestionDto depuis(Suggestion s) {
        return new SuggestionDto(s.getId(), s.getAuteur() == null ? null : UtilisateurPublicDto.depuis(s.getAuteur()),
                s.getType(), s.getNomLieu(), s.getCategorie(), s.getAdresse(), s.getLatitude(), s.getLongitude(),
                s.getMessage(), s.getDateCreation());
    }
}
