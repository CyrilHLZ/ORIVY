package fr.orivy.Orivy.Service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Sortie;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.AbonnementRepository;
import fr.orivy.Orivy.Repository.BlocageRepository;
import fr.orivy.Orivy.Repository.CommentaireRepository;
import fr.orivy.Orivy.Repository.FavoriRepository;
import fr.orivy.Orivy.Repository.MessageRepository;
import fr.orivy.Orivy.Repository.NotificationRepository;
import fr.orivy.Orivy.Repository.PhotoSortieRepository;
import fr.orivy.Orivy.Repository.SignalementRepository;
import fr.orivy.Orivy.Repository.SortieRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

/*
 * Supprimer un compte (RGPD : droit à l'effacement).
 * Tout ce qui pointe vers le membre est supprimé AVANT lui, sinon la base refuse (clé étrangère → 500).
 * @Transactional : tout ou rien. Si une étape échoue, la base revient comme avant.
 */
@Service
public class SuppressionCompteService {

    private final UtilisateurRepository utilisateurRepository;
    private final SortieRepository sortieRepository;
    private final SortieService sortieService;
    private final PhotoSortieRepository photoSortieRepository;
    private final CommentaireRepository commentaireRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final FavoriRepository favoriRepository;
    private final AbonnementRepository abonnementRepository;
    private final BlocageRepository blocageRepository;
    private final SignalementRepository signalementRepository;
    private final PasswordEncoder passwordEncoder;

    public SuppressionCompteService(UtilisateurRepository utilisateurRepository, SortieRepository sortieRepository,
                                    SortieService sortieService, PhotoSortieRepository photoSortieRepository,
                                    CommentaireRepository commentaireRepository, MessageRepository messageRepository,
                                    NotificationRepository notificationRepository, FavoriRepository favoriRepository,
                                    AbonnementRepository abonnementRepository, BlocageRepository blocageRepository,
                                    SignalementRepository signalementRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.sortieRepository = sortieRepository;
        this.sortieService = sortieService;
        this.photoSortieRepository = photoSortieRepository;
        this.commentaireRepository = commentaireRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.favoriRepository = favoriRepository;
        this.abonnementRepository = abonnementRepository;
        this.blocageRepository = blocageRepository;
        this.signalementRepository = signalementRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Le membre supprime SON compte : on vérifie son mot de passe
    @Transactional
    public void supprimerMonCompte(Long id, String motDePasse) {
        Utilisateur utilisateur = trouver(id);
        if (motDePasse == null || !passwordEncoder.matches(motDePasse, utilisateur.getMotDePasse())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Mot de passe incorrect.");
        }
        supprimer(utilisateur);
    }

    // L'admin supprime un compte (DELETE /api/utilisateurs/{id})
    @Transactional
    public void supprimerParAdmin(Long id) {
        supprimer(trouver(id));
    }

    private void supprimer(Utilisateur utilisateur) {
        if ("admin".equalsIgnoreCase(utilisateur.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Un compte administrateur ne peut pas être supprimé ici.");
        }
        Long id = utilisateur.getId();

        // 1. Les sorties qu'il organise (avec leurs albums : supprimerSortie s'en charge)
        for (Sortie sortie : sortieRepository.findByOrganisateurId(id)) {
            sortieService.supprimerSortie(sortie.getId(), id, true);
        }
        // 2. Sa place dans les sorties des autres. On passe par les objets (et pas un DELETE direct)
        //    pour que la liste d'attente garde ses positions 0, 1, 2… sans trou
        for (Sortie sortie : sortieRepository.findByParticipantsId(id)) {
            sortie.getParticipants().removeIf((m) -> m.getId().equals(id));
        }
        for (Sortie sortie : sortieRepository.findByAttenteId(id)) {
            sortie.getAttente().removeIf((m) -> m.getId().equals(id));
        }
        // 3. Tout ce qu'il a écrit, reçu ou suivi
        photoSortieRepository.supprimerDuMembre(id);
        commentaireRepository.supprimerDuMembre(id);
        messageRepository.supprimerDuMembre(id);
        notificationRepository.supprimerDuMembre(id);
        favoriRepository.supprimerDuMembre(id);
        abonnementRepository.supprimerDuMembre(id);
        blocageRepository.supprimerDuMembre(id);
        signalementRepository.supprimerDuMembre(id);
        // 4. Enfin, le compte
        utilisateurRepository.delete(utilisateur);
    }

    private Utilisateur trouver(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
    }
}
