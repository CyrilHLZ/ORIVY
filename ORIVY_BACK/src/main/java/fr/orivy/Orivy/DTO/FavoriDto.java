package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.Favori;

public record FavoriDto(String cibleType, Long cibleId, LocalDateTime dateAjout) {

    public static FavoriDto depuis(Favori f) {
        return new FavoriDto(f.getCibleType(), f.getCibleId(), f.getDateAjout());
    }
}
