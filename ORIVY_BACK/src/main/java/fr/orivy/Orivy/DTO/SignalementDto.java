package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.Signalement;

public record SignalementDto(Long id, UtilisateurPublicDto auteur, String cibleType, Long cibleId,
                             String motif, LocalDateTime dateCreation) {

    public static SignalementDto depuis(Signalement s) {
        return new SignalementDto(s.getId(), UtilisateurPublicDto.depuis(s.getAuteur()), s.getCibleType(),
                s.getCibleId(), s.getMotif(), s.getDateCreation());
    }
}
