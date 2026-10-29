package fr.orivy.Orivy.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.PhotoSortie;
import fr.orivy.Orivy.Model.Sortie;
import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.PhotoSortieRepository;
import fr.orivy.Orivy.Repository.SortieRepository;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class SortieService {

    private final SortieRepository sortieRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;
    private final FichierService fichierService;
    private final PhotoSortieRepository photoSortieRepository;

    public SortieService(SortieRepository sortieRepository, UtilisateurRepository utilisateurRepository,
                         NotificationService notificationService, FichierService fichierService,
                         PhotoSortieRepository photoSortieRepository) {
        this.sortieRepository = sortieRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.notificationService = notificationService;
        this.fichierService = fichierService;
        this.photoSortieRepository = photoSortieRepository;
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

    @Transactional
    public Sortie modifierSortie(Long id, Sortie sortie, Long appelantId, boolean estAdmin) {
        Sortie sortieExistante = trouverSortie(id);
        verifierDroits(sortieExistante, appelantId, estAdmin);
        boolean dateModifiee = !sortie.getDateDebut().equals(sortieExistante.getDateDebut());
        if (dateModifiee && sortie.getDateDebut().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date ne peut pas être dans le passé.");
        }

        // On ne peut pas descendre sous le nombre de personnes déjà inscrites
        if (sortie.getNombreMax() != null && sortie.getNombreMax() < sortieExistante.getParticipants().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Il y a déjà " + sortieExistante.getParticipants().size() + " inscrits.");
        }

        sortieExistante.setNombreMax(sortie.getNombreMax());
        sortieExistante.setNom(sortie.getNom());
        sortieExistante.setDescription(sortie.getDescription());
        sortieExistante.setCategorie(sortie.getCategorie());
        sortieExistante.setDateDebut(sortie.getDateDebut());
        sortieExistante.setLieu(sortie.getLieu());
        sortieExistante.setLatitude(sortie.getLatitude());
        sortieExistante.setLongitude(sortie.getLongitude());
        remplirDepuisAttente(sortieExistante);   // des places ajoutées ? on inscrit les premiers en attente
        Sortie enregistree = sortieRepository.save(sortieExistante);

        // On prévient chaque participant (sauf celui qui vient de modifier)
        for (Utilisateur p : enregistree.getParticipants()) {
            if (!p.getId().equals(appelantId)) {
                notificationService.notifier(p, "sortie-modifiee",
                        "La sortie « " + enregistree.getNom() + " » a été modifiée",
                        "/sorties/" + enregistree.getId());
            }
        }
        return enregistree;
    }

    @Transactional
    public void supprimerSortie(Long id, Long appelantId, boolean estAdmin) {
        Sortie sortie = trouverSortie(id);
        verifierDroits(sortie, appelantId, estAdmin);
        // Les photos de l'album pointent vers la sortie (clé étrangère) : on les supprime d'abord,
        // sinon la base refuse de supprimer la sortie (erreur 500)
        photoSortieRepository.deleteAll(photoSortieRepository.findBySortieIdOrderByDateAjoutDesc(id));
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
        
        if (estComplete(sortie)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette sortie est complète.");
        }

        Utilisateur participant = trouverUtilisateur(utilisateurId);
        // add renvoie false si le membre était déjà inscrit : dans ce cas, pas de nouvelle notification
        boolean nouveau = sortie.getParticipants().add(participant);
        sortie.getAttente().remove(participant);   // s'il était en attente, il n'y est plus

        // On prévient l'organisateur (sauf s'il rejoint sa propre sortie)
        if (nouveau && sortie.getOrganisateur() != null && !sortie.getOrganisateur().getId().equals(utilisateurId)) {
            notificationService.notifier(sortie.getOrganisateur(), "inscription",
                    participant.getPrenom() + " a rejoint ta sortie « " + sortie.getNom() + " »",
                    "/sorties/" + sortie.getId());
        }
        return sortieRepository.save(sortie);
    }

    @Transactional
    public Sortie desinscrire(Long sortieId, Long utilisateurId) {
        Sortie sortie = trouverSortie(sortieId);
        sortie.getParticipants().remove(trouverUtilisateur(utilisateurId));
        remplirDepuisAttente(sortie);   // la place libérée revient au premier de la liste
        return sortieRepository.save(sortie);
    }

    @Transactional
    public Sortie rejoindreAttente(Long sortieId, Long utilisateurId) {
        Sortie sortie = trouverSortie(sortieId);
        Utilisateur membre = trouverUtilisateur(utilisateurId);
        if (!estComplete(sortie)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Il reste des places : rejoins directement la sortie.");
        }
        if (sortie.getParticipants().contains(membre) || sortie.getAttente().contains(membre)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tu es déjà inscrit·e ou en attente.");
        }
        sortie.getAttente().add(membre);
        return sortieRepository.save(sortie);
    }

    @Transactional
    public Sortie quitterAttente(Long sortieId, Long utilisateurId) {
        Sortie sortie = trouverSortie(sortieId);
        sortie.getAttente().removeIf((u) -> u.getId().equals(utilisateurId));
        return sortieRepository.save(sortie);
    }

    private boolean estComplete(Sortie sortie) {
        return sortie.getNombreMax() != null && sortie.getParticipants().size() >= sortie.getNombreMax();
    }

    // Une place s'est libérée : on inscrit les premiers de la liste (premier arrivé, premier servi),
    // tant qu'il reste de la place. while et pas if : +2 places = 2 personnes inscrites d'un coup.
    private void remplirDepuisAttente(Sortie sortie) {
        while (!sortie.getAttente().isEmpty() && !estComplete(sortie)) {
            Utilisateur suivant = sortie.getAttente().remove(0);
            sortie.getParticipants().add(suivant);
            notificationService.notifier(suivant, "attente",
                    "Une place s'est libérée : tu es inscrit·e à « " + sortie.getNom() + " » !",
                    "/sorties/" + sortie.getId());
        }
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

    public Sortie changerPhoto(Long id, MultipartFile fichier, Long appelantId, boolean estAdmin) throws IOException {
        Sortie sortie = trouverSortie(id);
        verifierDroits(sortie, appelantId, estAdmin);   // seul l'organisateur (ou un admin)
        sortie.setImageUrl(fichierService.enregistrerMedia(fichier, "sorties", "sortie-" + id));
        return sortieRepository.save(sortie);
    }

        public List<Sortie> rechercher(String mot) {
        if (mot == null || mot.isBlank()) return List.of();
        return sortieRepository.rechercher(mot.trim());
    }

    public List<PhotoSortie> album(Long sortieId) {
        return photoSortieRepository.findBySortieIdOrderByDateAjoutDesc(sortieId);
    }

    @Transactional
    public PhotoSortie ajouterAuAlbum(Long sortieId, MultipartFile fichier, Long auteurId) throws IOException {
        Sortie sortie = trouverSortie(sortieId);
        Utilisateur auteur = trouverUtilisateur(auteurId);
        boolean organisateur = sortie.getOrganisateur() != null && sortie.getOrganisateur().getId().equals(auteurId);
        if (!organisateur && !sortie.getParticipants().contains(auteur)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Rejoins la sortie pour partager tes photos.");
        }
        String url = fichierService.enregistrerMedia(fichier, "albums", "album-" + sortieId);
        return photoSortieRepository.save(new PhotoSortie(sortie, auteur, url));
    }

    public void retirerDeLAlbum(Long photoId, Long appelantId, boolean estAdmin) {
        PhotoSortie photo = photoSortieRepository.findById(photoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Photo introuvable."));
        boolean auteur = photo.getAuteur().getId().equals(appelantId);
        boolean organisateur = photo.getSortie().getOrganisateur() != null
                && photo.getSortie().getOrganisateur().getId().equals(appelantId);
        if (!auteur && !organisateur && !estAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tu ne peux retirer que tes propres photos.");
        }
        photoSortieRepository.delete(photo);
    }
}