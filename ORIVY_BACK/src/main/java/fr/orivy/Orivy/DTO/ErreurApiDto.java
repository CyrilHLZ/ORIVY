package fr.orivy.Orivy.DTO;

// Le format unique de toutes les erreurs renvoyées au front

import java.util.Map;

public record ErreurApiDto(String message, Map<String, String> champs) {

    public static ErreurApiDto simple(String message) {
        return new ErreurApiDto(message, Map.of());
    }
}

