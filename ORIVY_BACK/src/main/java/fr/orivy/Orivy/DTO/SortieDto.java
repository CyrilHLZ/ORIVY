package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;
import java.util.List;

import fr.orivy.Orivy.Model.Sortie;

public record SortieDto(Long id, String nom, String description, String categorie, LocalDateTime dateDebut,
                        String lieu, Double latitude, Double longitude, UtilisateurPublicDto organisateur,
                        Integer nombreMax, String imageUrl,
                        List<UtilisateurPublicDto> participants, List<UtilisateurPublicDto> attente) {

    public static SortieDto depuis(Sortie s) {
        // Les sorties créées avant l'ajout de l'organisateur n'en ont pas
        UtilisateurPublicDto organisateur = s.getOrganisateur() != null ? UtilisateurPublicDto.depuis(s.getOrganisateur()) : null;
        List<UtilisateurPublicDto> participants = s.getParticipants().stream().map(UtilisateurPublicDto::depuis).toList();
        List<UtilisateurPublicDto> attente = s.getAttente().stream().map(UtilisateurPublicDto::depuis).toList();
        return new SortieDto(s.getId(), s.getNom(), s.getDescription(), s.getCategorie(), s.getDateDebut(),
                             s.getLieu(), s.getLatitude(), s.getLongitude(), organisateur,
                             s.getNombreMax(), s.getImageUrl(), participants, attente);
    }
}
