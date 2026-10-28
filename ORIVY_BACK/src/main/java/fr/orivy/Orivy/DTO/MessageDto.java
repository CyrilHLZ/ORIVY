package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.Message;

public record MessageDto(Long id, Long expediteurId, String contenu, LocalDateTime dateEnvoi, boolean lu) {

    public static MessageDto depuis(Message m) {
        return new MessageDto(m.getId(), m.getExpediteur().getId(), m.getContenu(), m.getDateEnvoi(), m.isLu());
    }
}
