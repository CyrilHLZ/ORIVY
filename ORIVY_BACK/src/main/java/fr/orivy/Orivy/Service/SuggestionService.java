package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.DTO.NouvelleSuggestionDto;
import fr.orivy.Orivy.Model.Suggestion;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.SuggestionRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class SuggestionService {

    private final SuggestionRepository suggestionRepository;
    private final UtilisateurRepository utilisateurRepository;

    public SuggestionService(SuggestionRepository suggestionRepository, UtilisateurRepository utilisateurRepository) {
        this.suggestionRepository = suggestionRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public Suggestion suggerer(Long auteurId, NouvelleSuggestionDto d) {
        String nom = nettoyer(d.nomLieu()), adresse = nettoyer(d.adresse()), message = nettoyer(d.message());
        if ("lieu".equals(d.type()) && (nom == null || adresse == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Donne le nom du lieu et son adresse (ou sa ville).");
        }
        if ("idee".equals(d.type()) && message == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Écris ton idée en quelques mots.");
        }
        Utilisateur auteur = utilisateurRepository.findById(auteurId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
        boolean position = d.latitude() != null && d.longitude() != null
                && Math.abs(d.latitude()) <= 90 && Math.abs(d.longitude()) <= 180;
        return suggestionRepository.save(new Suggestion(auteur, d.type(), nom, nettoyer(d.categorie()), adresse,
                position ? d.latitude() : null, position ? d.longitude() : null, message));
    }

    public List<Suggestion> aTraiter() {
        return suggestionRepository.findByTraiteFalseOrderByDateCreationDesc();
    }

    // @Transactional : Hibernate voit le changement et l'enregistre (pas besoin de save())
    @Transactional
    public void marquerTraitee(Long id) {
        suggestionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Suggestion introuvable."))
                .setTraite(true);
    }

    private static String nettoyer(String texte) {
        return texte == null || texte.isBlank() ? null : texte.trim();
    }
}
