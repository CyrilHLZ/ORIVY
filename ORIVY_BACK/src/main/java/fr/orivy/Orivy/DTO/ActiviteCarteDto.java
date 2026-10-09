package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ActiviteCarteDto(
        Long id,
        @NotBlank String nom,
        String description,
        @NotBlank String categorie,
        @NotNull LocalDateTime dateDebut,
        String lieu,
        Double latitude,
        Double longitude,
        String imageUrl) {
}