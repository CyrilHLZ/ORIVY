package fr.orivy.Orivy.DTO;

// Le format unique de toutes les erreurs renvoyées au front

import java.util.Map;

public record ErreurApi(String message, Map<String, String> champs) {

    public static ErreurApi simple(String message) {
        return new ErreurApi(message, Map.of());
    }
}

