package fr.orivy.Orivy.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NouveauSignalementDto(
        @NotBlank String cibleType,
        @NotNull Long cibleId,
        @NotBlank(message = "Explique en quelques mots ce qui ne va pas.")
        @Size(max = 500, message = "500 caractères maximum.") String motif) {
}
