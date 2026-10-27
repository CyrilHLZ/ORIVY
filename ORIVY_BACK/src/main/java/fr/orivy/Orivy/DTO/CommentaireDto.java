package fr.orivy.Orivy.DTO;

import java.time.LocalDateTime;

import fr.orivy.Orivy.Model.Commentaire;

// Ce que l'API renvoie d'un commentaire : l'auteur n'y figure qu'en version publique
public record CommentaireDto(Long id, UtilisateurPublic auteur, String contenu, Integer note,
                             String cibleType, Long cibleId, LocalDateTime dateCreation) {

    public static CommentaireDto depuis(Commentaire c) {
        // Les commentaires écrits avant le lien avec le compte n'ont pas d'auteur
        UtilisateurPublic auteur = c.getAuteur() != null ? UtilisateurPublic.depuis(c.getAuteur()) : null;
        return new CommentaireDto(c.getId(), auteur, c.getContenu(), c.getNote(),
                                  c.getCibleType(), c.getCibleId(), c.getDateCreation());
    }
}
