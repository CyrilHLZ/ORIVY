package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Blocage;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.AbonnementRepository;
import fr.orivy.Orivy.Repository.BlocageRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class BlocageService {

    private final BlocageRepository blocageRepository;
    private final AbonnementRepository abonnementRepository;
    private final UtilisateurRepository utilisateurRepository;

    public BlocageService(BlocageRepository blocageRepository, AbonnementRepository abonnementRepository,
                          UtilisateurRepository utilisateurRepository) {
        this.blocageRepository = blocageRepository;
        this.abonnementRepository = abonnementRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    // Vrai si l'un des deux a bloqué l'autre (dans un sens OU dans l'autre)
    public boolean entreEux(Long a, Long b) {
        return blocageRepository.existsByBloqueurIdAndBloqueId(a, b) || blocageRepository.existsByBloqueurIdAndBloqueId(b, a);
    }

    public void bloquer(Long moi, Long membreId) {
        if (moi.equals(membreId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tu ne peux pas te bloquer toi-même.");
        }
        if (blocageRepository.existsByBloqueurIdAndBloqueId(moi, membreId)) return;
        Utilisateur bloqueur = trouver(moi);
        Utilisateur bloque = trouver(membreId);
        blocageRepository.save(new Blocage(bloqueur, bloque));
        // On ne se suit plus, dans les deux sens
        abonnementRepository.findByAbonneIdAndSuiviId(moi, membreId).ifPresent(abonnementRepository::delete);
        abonnementRepository.findByAbonneIdAndSuiviId(membreId, moi).ifPresent(abonnementRepository::delete);
    }

    public void debloquer(Long moi, Long membreId) {
        blocageRepository.findByBloqueurIdAndBloqueId(moi, membreId).ifPresent(blocageRepository::delete);
    }

    public List<Utilisateur> mesBlocages(Long moi) {
        return blocageRepository.findByBloqueurId(moi).stream().map(Blocage::getBloque).toList();
    }

    private Utilisateur trouver(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable."));
    }
}
