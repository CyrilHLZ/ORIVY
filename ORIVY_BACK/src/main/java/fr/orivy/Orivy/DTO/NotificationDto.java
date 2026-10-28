package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.Notification;

public record NotificationDto(Long id, String type, String texte, String lien, boolean lue, LocalDateTime dateCreation) {

    public static NotificationDto depuis(Notification n) {
        return new NotificationDto(n.getId(), n.getType(), n.getTexte(), n.getLien(), n.isLue(), n.getDateCreation());
    }
}

