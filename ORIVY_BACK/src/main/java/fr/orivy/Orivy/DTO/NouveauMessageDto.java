package fr.orivy.Orivy.DTO;

// Ce que le front envoie pour écrire à un membre : { "message": "…" }
public record NouveauMessageDto(String message) {
}
