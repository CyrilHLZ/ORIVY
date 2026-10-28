package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Notification;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.NotificationRepository;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // Appelé par les autres services (sorties, commentaires…)
    public void notifier(Utilisateur destinataire, String type, String texte, String lien) {
        notificationRepository.save(new Notification(destinataire, type, texte, lien));
    }

    public List<Notification> mesNotifications(Long utilisateurId) {
        return notificationRepository.findByDestinataireIdOrderByDateCreationDesc(utilisateurId);
    }

    public long nombreNonLues(Long utilisateurId) {
        return notificationRepository.countByDestinataireIdAndLueFalse(utilisateurId);
    }

    public void marquerLue(Long id, Long utilisateurId) {
        Notification notification = trouverLaMienne(id, utilisateurId);
        notification.setLue(true);
        notificationRepository.save(notification);
    }

    public void supprimer(Long id, Long utilisateurId) {
        notificationRepository.delete(trouverLaMienne(id, utilisateurId));
    }

    // On ne touche qu'à SES notifications : celle d'un autre → 404 (on ne révèle pas qu'elle existe)
    private Notification trouverLaMienne(Long id, Long utilisateurId) {
        return notificationRepository.findById(id)
                .filter(n -> n.getDestinataire().getId().equals(utilisateurId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification introuvable."));
    }
}

