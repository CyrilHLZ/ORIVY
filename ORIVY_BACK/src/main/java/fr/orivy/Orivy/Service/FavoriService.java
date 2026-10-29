package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Favori;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.FavoriRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class FavoriService {

    private static final List<String> TYPES = List.of("point", "activite", "sortie");

    private final FavoriRepository favoriRepository;
    private final UtilisateurRepository utilisateurRepository;

    public FavoriService(FavoriRepository favoriRepository, UtilisateurRepository utilisateurRepository) {
        this.favoriRepository = favoriRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public List<Favori> mesFavoris(Long utilisateurId) {
        return favoriRepository.findByUtilisateurIdOrderByDateAjoutDesc(utilisateurId);
    }

    // Ajouter deux fois ne fait rien de plus : on renvoie le favori déjà existant
    public Favori ajouter(Long utilisateurId, String cibleType, Long cibleId) {
        if (!TYPES.contains(cibleType) || cibleId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "On ne peut aimer qu'un lieu ou une sortie.");
        }
        return favoriRepository.findByUtilisateurIdAndCibleTypeAndCibleId(utilisateurId, cibleType, cibleId)
                .orElseGet(() -> {
                    Utilisateur utilisateur = utilisateurRepository.findById(utilisateurId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
                    return favoriRepository.save(new Favori(utilisateur, cibleType, cibleId));
                });
    }

    public void retirer(Long utilisateurId, String cibleType, Long cibleId) {
        favoriRepository.findByUtilisateurIdAndCibleTypeAndCibleId(utilisateurId, cibleType, cibleId)
                .ifPresent(favoriRepository::delete);
    }
}
