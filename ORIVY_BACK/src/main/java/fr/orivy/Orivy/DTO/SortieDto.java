package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;
import java.util.List;

import fr.orivy.Orivy.Model.Sortie;

public record SortieDto(Long id, String nom, String description, String categorie, LocalDateTime dateDebut,
                        String lieu, Double latitude, Double longitude, UtilisateurPublic organisateur,
                        List<UtilisateurPublic> participants) {

    public static SortieDto depuis(Sortie s) {
        // Les sorties créées avant l'ajout de l'organisateur n'en ont pas
        UtilisateurPublic organisateur = s.getOrganisateur() != null ? UtilisateurPublic.depuis(s.getOrganisateur()) : null;
        List<UtilisateurPublic> participants = s.getParticipants().stream().map(UtilisateurPublic::depuis).toList();
        return new SortieDto(s.getId(), s.getNom(), s.getDescription(), s.getCategorie(), s.getDateDebut(),
                             s.getLieu(), s.getLatitude(), s.getLongitude(), organisateur, participants);
    }
}
