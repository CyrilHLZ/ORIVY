package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.PhotoSortie;


public record PhotoSortieDto(Long id, String url, UtilisateurPublicDto auteur, LocalDateTime dateAjout) {

    public static PhotoSortieDto depuis(PhotoSortie p) {
        return new PhotoSortieDto(p.getId(), p.getUrl(), UtilisateurPublicDto.depuis(p.getAuteur()), p.getDateAjout());
    }
}
