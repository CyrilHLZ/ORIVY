package fr.orivy.Orivy.DTO;

import java.time.LocalDate;

import fr.orivy.Orivy.Model.Sortie;

// Ce que l'API renvoie d'une sortie : l'organisateur n'y figure qu'en version publique
public record SortieDto(Long id, String nom, String description, String categorie, LocalDate dateDebut,
                        String lieu, Double latitude, Double longitude, UtilisateurPublic organisateur) {

    public static SortieDto depuis(Sortie s) {
        // Les sorties créées avant l'ajout de l'organisateur n'en ont pas
        UtilisateurPublic organisateur = s.getOrganisateur() != null ? UtilisateurPublic.depuis(s.getOrganisateur()) : null;
        return new SortieDto(s.getId(), s.getNom(), s.getDescription(), s.getCategorie(), s.getDateDebut(),
                             s.getLieu(), s.getLatitude(), s.getLongitude(), organisateur);
    }
}
