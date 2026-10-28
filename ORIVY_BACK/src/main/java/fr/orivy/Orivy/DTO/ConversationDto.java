package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

// Le membre avec qui on parle, son dernier message, et le nombre de messages non lus
public record ConversationDto(UtilisateurPublicDto membre, String dernierMessage, LocalDateTime date, long nonLus) {
}

