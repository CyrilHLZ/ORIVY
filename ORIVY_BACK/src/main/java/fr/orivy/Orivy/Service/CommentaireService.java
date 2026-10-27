package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Commentaire;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.CommentaireRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final UtilisateurRepository utilisateurRepository;

    public CommentaireService(CommentaireRepository commentaireRepository, UtilisateurRepository utilisateurRepository) {
        this.commentaireRepository = commentaireRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public List<Commentaire> getCommentaires(String cibleType, Long cibleId) {
        return commentaireRepository.findByCibleTypeAndCibleId(cibleType, cibleId);
    }

    // L'auteur vient du jeton, jamais du corps de la requête
    public Commentaire creerCommentaire(Commentaire commentaire, Long auteurId) {
        Utilisateur auteur = utilisateurRepository.findById(auteurId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        commentaire.setAuteur(auteur);
        return commentaireRepository.save(commentaire);
    }
}
