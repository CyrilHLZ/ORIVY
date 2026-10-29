package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.PhotoSortie;

// Une case du fil : le média, qui l'a posté, et la sortie d'où il vient
public record PublicationDto(Long id, String url, UtilisateurPublicDto auteur,
                             Long sortieId, String sortieNom, String sortieLieu, LocalDateTime dateAjout) {

    public static PublicationDto depuis(PhotoSortie p) {
        return new PublicationDto(p.getId(), p.getUrl(), UtilisateurPublicDto.depuis(p.getAuteur()),
                p.getSortie().getId(), p.getSortie().getNom(), p.getSortie().getLieu(), p.getDateAjout());
    }
}

