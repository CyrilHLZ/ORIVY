package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.DTO.NouveauSignalementDto;
import fr.orivy.Orivy.Model.Signalement;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.SignalementRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class SignalementService {

    private static final List<String> TYPES = List.of("membre", "sortie", "commentaire", "photo");

    private final SignalementRepository signalementRepository;
    private final UtilisateurRepository utilisateurRepository;

    public SignalementService(SignalementRepository signalementRepository, UtilisateurRepository utilisateurRepository) {
        this.signalementRepository = signalementRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public Signalement signaler(Long auteurId, NouveauSignalementDto demande) {
        if (!TYPES.contains(demande.cibleType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "On ne peut signaler qu'un membre, une sortie, un commentaire ou une photo.");
        }
        Utilisateur auteur = utilisateurRepository.findById(auteurId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
        return signalementRepository.save(new Signalement(auteur, demande.cibleType(), demande.cibleId(), demande.motif().trim()));
    }

    public List<Signalement> aTraiter() {
        return signalementRepository.findByTraiteFalseOrderByDateCreationDesc();
    }

    // Pas besoin de save() : la méthode est @Transactional, Hibernate voit le changement (dirty checking)
    @Transactional
    public void marquerTraite(Long id) {
        signalementRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Signalement introuvable."))
                .setTraite(true);
    }
}
