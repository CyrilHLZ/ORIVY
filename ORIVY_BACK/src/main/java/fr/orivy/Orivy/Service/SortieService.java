package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
        Utilisateur organisateur = utilisateurRepository.findById(organisateurId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        sortie.setId(null);
        sortie.setOrganisateur(organisateur);
        return sortieRepository.save(sortie);
    }

    public Sortie modifierSortie(Long id, Sortie sortie, Long appelantId, boolean estAdmin) {
        Sortie sortieExistante = trouverSortie(id);
        verifierDroits(sortieExistante, appelantId, estAdmin);
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

    // TODO : à brancher quand Sortie aura une relation @ManyToMany avec Utilisateur
    public void inscrireUtilisateurASortie(Long sortieId, Long utilisateurId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Inscription pas encore disponible");
    }

    public void desinscrireUtilisateurDeSortie(Long sortieId, Long utilisateurId) {
        throw new ResponseStatusException(HttpStatus.NOT_IMPLEMENTED, "Désinscription pas encore disponible");
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
}
