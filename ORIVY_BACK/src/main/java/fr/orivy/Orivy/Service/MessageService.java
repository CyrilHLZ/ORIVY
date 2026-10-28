package fr.orivy.Orivy.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.DTO.ConversationDto;
import fr.orivy.Orivy.DTO.UtilisateurPublicDto;
import fr.orivy.Orivy.Model.Message;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.MessageRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    public MessageService(MessageRepository messageRepository, UtilisateurRepository utilisateurRepository,
                          NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.notificationService = notificationService;
    }

    public Message envoyer(Long expediteurId, Long destinataireId, String contenu) {
        if (expediteurId.equals(destinataireId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tu ne peux pas t'écrire à toi-même.");
        }
        if (contenu == null || contenu.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ton message est vide.");
        }
        if (contenu.length() > 2000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ton message est trop long (2000 caractères maximum).");
        }
        Utilisateur expediteur = trouverUtilisateur(expediteurId);
        Utilisateur destinataire = trouverUtilisateur(destinataireId);
        Message message = messageRepository.save(new Message(expediteur, destinataire, contenu.trim()));

        notificationService.notifier(destinataire, "message",
                expediteur.getPrenom() + " t'a envoyé un message", "/messages?avec=" + expediteurId);
        return message;
    }

    // Ouvrir une conversation = lire les messages reçus
    @Transactional
    public List<Message> conversation(Long moiId, Long membreId) {
        List<Message> messages = messageRepository.conversation(moiId, membreId);
        messages.stream()
                .filter((m) -> m.getDestinataire().getId().equals(moiId) && !m.isLu())
                .forEach((m) -> m.setLu(true));
        return messages;
    }

    // Une ligne par personne : son dernier message et le nombre de non lus
    public List<ConversationDto> conversations(Long moiId) {
        Map<Long, ConversationDto> parMembre = new LinkedHashMap<>();
        for (Message m : messageRepository.findByExpediteurIdOrDestinataireIdOrderByDateEnvoiDesc(moiId, moiId)) {
            Utilisateur autre = m.getExpediteur().getId().equals(moiId) ? m.getDestinataire() : m.getExpediteur();
            long nonLu = (!m.isLu() && m.getDestinataire().getId().equals(moiId)) ? 1 : 0;
            ConversationDto existante = parMembre.get(autre.getId());
            if (existante == null) {
                // Tri du plus récent au plus ancien : le 1er message rencontré est le dernier envoyé
                parMembre.put(autre.getId(), new ConversationDto(UtilisateurPublicDto.depuis(autre), m.getContenu(), m.getDateEnvoi(), nonLu));
            } else if (nonLu == 1) {
                parMembre.put(autre.getId(), new ConversationDto(existante.membre(), existante.dernierMessage(), existante.date(), existante.nonLus() + 1));
            }
        }
        return new ArrayList<>(parMembre.values());
    }

    // On ne peut supprimer que SES messages envoyés
    public void supprimer(Long moiId, Long messageId) {
        Message message = messageRepository.findById(messageId)
                .filter((m) -> m.getExpediteur().getId().equals(moiId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message introuvable."));
        messageRepository.delete(message);
    }

    private Utilisateur trouverUtilisateur(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
    }
}

