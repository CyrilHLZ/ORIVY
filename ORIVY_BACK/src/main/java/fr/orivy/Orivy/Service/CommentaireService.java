package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Commentaire;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.CommentaireRepository;
import fr.orivy.Orivy.Repository.SortieRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final SortieRepository sortieRepository;
    private final NotificationService notificationService;

    public CommentaireService(CommentaireRepository commentaireRepository, UtilisateurRepository utilisateurRepository,
                              SortieRepository sortieRepository, NotificationService notificationService) {
        this.commentaireRepository = commentaireRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.sortieRepository = sortieRepository;
        this.notificationService = notificationService;
    }

    public List<Commentaire> getCommentaires(String cibleType, Long cibleId) {
        return commentaireRepository.findByCibleTypeAndCibleId(cibleType, cibleId);
    }

    // L'auteur vient du jeton, jamais du corps de la requête
    public Commentaire creerCommentaire(Commentaire commentaire, Long auteurId) {
        Utilisateur auteur = utilisateurRepository.findById(auteurId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        commentaire.setAuteur(auteur);
        Commentaire enregistre = commentaireRepository.save(commentaire);

        // Commentaire sur une sortie : on prévient l'organisateur (sauf s'il commente lui-même)
        if ("sortie".equals(commentaire.getCibleType()) && commentaire.getCibleId() != null) {
            sortieRepository.findById(commentaire.getCibleId()).ifPresent((sortie) -> {
                if (sortie.getOrganisateur() != null && !sortie.getOrganisateur().getId().equals(auteurId)) {
                    notificationService.notifier(sortie.getOrganisateur(), "commentaire",
                            auteur.getPrenom() + " a commenté ta sortie « " + sortie.getNom() + " »",
                            "/sorties/" + sortie.getId() + "#commentaires");
                }
            });
        }
        return enregistre;
    }
}
