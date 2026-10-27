package fr.orivy.Orivy.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Sortie;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.SortieRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class SortieService {

    private final SortieRepository sortieRepository;
    private final UtilisateurRepository utilisateurRepository;

    public SortieService(SortieRepository sortieRepository, UtilisateurRepository utilisateurRepository) {
        this.sortieRepository = sortieRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    public List<Sortie> getAllSorties() {
        return sortieRepository.findAll();
    }

    public Sortie getSortie(Long id) {
        return trouverSortie(id);
    }

    // L'organisateur vient du jeton, jamais du corps de la requête
    public Sortie creerSortie(Sortie sortie, Long organisateurId) {
        if (sortie.getDateDebut().isBefore(LocalDateTime.now())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date ne peut pas être dans le passé.");
        }
        sortie.setId(null);
        sortie.setOrganisateur(trouverUtilisateur(organisateurId));
        return sortieRepository.save(sortie);
    }

    public Sortie modifierSortie(Long id, Sortie sortie, Long appelantId, boolean estAdmin) {
        Sortie sortieExistante = trouverSortie(id);
        verifierDroits(sortieExistante, appelantId, estAdmin);
        boolean dateModifiee = !sortie.getDateDebut().equals(sortieExistante.getDateDebut());
        if (dateModifiee && sortie.getDateDebut().isBefore(LocalDateTime.now())) {
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date ne peut pas être dans le passé.");
    }
        sortieExistante.setNom(sortie.getNom());
        sortieExistante.setDescription(sortie.getDescription());
        sortieExistante.setCategorie(sortie.getCategorie());
        sortieExistante.setDateDebut(sortie.getDateDebut());
        sortieExistante.setLieu(sortie.getLieu());
        sortieExistante.setLatitude(sortie.getLatitude());
        sortieExistante.setLongitude(sortie.getLongitude());
        return sortieRepository.save(sortieExistante);
    }

    public void supprimerSortie(Long id, Long appelantId, boolean estAdmin) {
        Sortie sortie = trouverSortie(id);
        verifierDroits(sortie, appelantId, estAdmin);
        sortieRepository.delete(sortie);
    }

    // @Transactional : sortie et utilisateur sont chargés dans la même session Hibernate,
    // donc un même membre = un même objet Java, et le Set ignore bien les doublons
    @Transactional
    public Sortie inscrire(Long sortieId, Long utilisateurId) {
        Sortie sortie = trouverSortie(sortieId);
        if (sortie.getDateDebut() != null && sortie.getDateDebut().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette sortie est déjà passée.");
        }
        sortie.getParticipants().add(trouverUtilisateur(utilisateurId));
        return sortieRepository.save(sortie);
    }

    @Transactional
    public Sortie desinscrire(Long sortieId, Long utilisateurId) {
        Sortie sortie = trouverSortie(sortieId);
        sortie.getParticipants().remove(trouverUtilisateur(utilisateurId));
        return sortieRepository.save(sortie);
    }

    private Utilisateur trouverUtilisateur(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
    }

    private Sortie trouverSortie(Long id) {
        return sortieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sortie introuvable"));
    }

    // Seuls l'organisateur et un admin peuvent modifier ou supprimer.
    // Une sortie sans organisateur (créée avant son ajout) n'est gérable que par un admin.
    private void verifierDroits(Sortie sortie, Long appelantId, boolean estAdmin) {
        boolean estOrganisateur = sortie.getOrganisateur() != null
                && sortie.getOrganisateur().getId().equals(appelantId);
        if (!estAdmin && !estOrganisateur) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seul l'organisateur peut gérer cette sortie.");
        }
    }

    public List<Sortie> getSortiesOrganisees(Long utilisateurId) {
        return sortieRepository.findByOrganisateurId(utilisateurId);
    }

    public List<Sortie> getSortiesRejointes(Long utilisateurId) {
        return sortieRepository.findByParticipantsId(utilisateurId);
    }
}