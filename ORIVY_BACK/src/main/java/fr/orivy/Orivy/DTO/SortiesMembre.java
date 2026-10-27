package fr.orivy.Orivy.DTO;

import java.util.List;

public record SortiesMembre(List<SortieDto> organisees, List<SortieDto> rejointes) {
}

