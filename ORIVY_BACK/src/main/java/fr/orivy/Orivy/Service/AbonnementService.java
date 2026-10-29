package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Abonnement;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.AbonnementRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class AbonnementService {

    private final AbonnementRepository abonnementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    public AbonnementService(AbonnementRepository abonnementRepository, UtilisateurRepository utilisateurRepository,
                             NotificationService notificationService) {
        this.abonnementRepository = abonnementRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.notificationService = notificationService;
    }

    public void suivre(Long abonneId, Long suiviId) {
        if (abonneId.equals(suiviId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tu ne peux pas t'abonner à toi-même.");
        }
        if (abonnementRepository.findByAbonneIdAndSuiviId(abonneId, suiviId).isPresent()) return;
        Utilisateur abonne = trouver(abonneId);
        Utilisateur suivi = trouver(suiviId);
        abonnementRepository.save(new Abonnement(abonne, suivi));
        notificationService.notifier(suivi, "abonnement", abonne.getPrenom() + " s'est abonné à toi", "/profil/" + abonneId);
    }

    public void neplusSuivre(Long abonneId, Long suiviId) {
        abonnementRepository.findByAbonneIdAndSuiviId(abonneId, suiviId).ifPresent(abonnementRepository::delete);
    }

    public List<Utilisateur> abonnes(Long utilisateurId) {
        return abonnementRepository.findBySuiviId(utilisateurId).stream().map(Abonnement::getAbonne).toList();
    }

    public List<Utilisateur> abonnements(Long utilisateurId) {
        return abonnementRepository.findByAbonneId(utilisateurId).stream().map(Abonnement::getSuivi).toList();
    }

    private Utilisateur trouver(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
    }
}

