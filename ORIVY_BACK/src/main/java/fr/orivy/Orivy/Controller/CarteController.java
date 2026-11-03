package fr.orivy.Orivy.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.ActiviteCarte;
import fr.orivy.Orivy.Model.PointInteret;
import fr.orivy.Orivy.Model.Promenade;
import fr.orivy.Orivy.Repository.ActiviteCarteRepository;
import fr.orivy.Orivy.Repository.PointInteretRepository;
import fr.orivy.Orivy.Repository.PromenadeRepository;
import fr.orivy.Orivy.Service.FichierService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class CarteController {

    private final PointInteretRepository pointInteretRepository;
    private final PromenadeRepository promenadeRepository;
    private final ActiviteCarteRepository activiteRepository;
    private final FichierService fichierService;

    public CarteController(PointInteretRepository pointInteretRepository,
            PromenadeRepository promenadeRepository,
            ActiviteCarteRepository activiteRepository,
            FichierService fichierService) {
        this.pointInteretRepository = pointInteretRepository;
        this.promenadeRepository = promenadeRepository;
        this.activiteRepository = activiteRepository;
        this.fichierService = fichierService;
    }

    // Les lieux saisis dans ORIVY ; les lieux importés passent par /carte/zone
    @GetMapping("/carte")
    public CarteResponse carte() {
        return new CarteResponse(pointInteretRepository.findBySourceIsNull(), promenadeRepository.findAll(),
                activiteRepository.findAll());
    }

    /* Lieux importés (Monuments historiques…) dans la zone affichée : 1000 au plus, la carte ne les demande que de près.
       /api/carte/zone?nord=45.9&sud=45.7&est=5.0&ouest=4.7&types=parc,culture */
    @GetMapping("/carte/zone")
    public List<PointInteret> zone(@RequestParam double nord, @RequestParam double sud,
            @RequestParam double est, @RequestParam double ouest,
            @RequestParam(required = false) List<String> types) {
        PageRequest limite = PageRequest.of(0, 1000);
        if (types == null || types.isEmpty()) {
            return pointInteretRepository.findBySourceIsNotNullAndMasqueFalseAndLatitudeBetweenAndLongitudeBetween(sud, nord, ouest, est, limite);
        }
        return pointInteretRepository.findBySourceIsNotNullAndMasqueFalseAndTypeInAndLatitudeBetweenAndLongitudeBetween(types, sud, nord, ouest, est, limite);
    }

    /* Lieux importés à moins de km kilomètres, les plus proches d'abord (500 au plus) : page Activités.
       /api/carte/autour?lat=45.76&lng=4.83&km=25&type=parc */
    @GetMapping("/carte/autour")
    public List<PointInteret> autour(@RequestParam double lat, @RequestParam double lng,
            @RequestParam(defaultValue = "25") double km, @RequestParam(required = false) String type) {
        double rayon = Math.min(km, 100);
        double cos = Math.cos(Math.toRadians(lat));
        double dLat = rayon / 111.0;                       // 1° de latitude ≈ 111 km
        double dLng = rayon / (111.0 * Math.max(cos, 0.01));
        return pointInteretRepository.autour(lat, lng, cos, lat - dLat, lat + dLat, lng - dLng, lng + dLng,
                type == null || type.isBlank() ? null : type, PageRequest.of(0, 500));
    }

    // /api/carte/recherche?q=chateau → 8 lieux importés au plus
    @GetMapping("/carte/recherche")
    public List<PointInteret> recherche(@RequestParam String q) {
        if (q.trim().length() < 3) return List.of();
        return pointInteretRepository.findTop8BySourceIsNotNullAndMasqueFalseAndNomContainingIgnoreCase(q.trim());
    }

    @GetMapping("/points-interet")
    public List<PointInteret> pointsInteret() { return pointInteretRepository.findBySourceIsNull(); }

    // Un lieu précis (ex. lien /carte?lieu=point-12 vers un lieu importé)
    @GetMapping("/points-interet/{id}")
    public PointInteret pointInteret(@PathVariable Long id) {
        return trouver(id);
    }

    // Un lieu qui existe et n'a pas été supprimé (masqué) par l'admin, sinon 404
    private PointInteret trouver(Long id) {
        return pointInteretRepository.findById(id)
                .filter((p) -> !p.isMasque())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Point introuvable"));
    }

    @PostMapping("/points-interet")
    public PointInteret creerPointInteret(@Valid @RequestBody PointInteret point) {
        return pointInteretRepository.save(point);
    }

    @PutMapping("/points-interet/{id}")
    public PointInteret modifierPointInteret(@PathVariable Long id, @Valid @RequestBody PointInteret point) {
        PointInteret existing = trouver(id);
        // Nouvelle adresse d'image : c'est désormais l'admin qui décide de la photo
        if (point.getImageUrl() == null ? existing.getImageUrl() != null : !point.getImageUrl().equals(existing.getImageUrl())) {
            existing.setPhotoChoisie(true);
        }
        existing.setNom(point.getNom());
        existing.setDescription(point.getDescription());
        existing.setType(point.getType());
        existing.setLatitude(point.getLatitude());
        existing.setLongitude(point.getLongitude());
        existing.setAdresse(point.getAdresse());
        existing.setImageUrl(point.getImageUrl());
        existing.setCouleur(point.getCouleur());
        existing.setImageSource(point.getImageSource());
        existing.setImageLicence(point.getImageLicence());
        return pointInteretRepository.save(existing);
    }

    /* Supprimer un lieu (admin). Un lieu importé est seulement masqué : supprimé pour de bon,
       l'import de la semaine suivante le recréerait (doublon revenu). */
    @DeleteMapping("/points-interet/{id}")
    public void supprimerPointInteret(@PathVariable Long id) {
        PointInteret point = trouver(id);
        if (point.getSource() == null) {
            pointInteretRepository.delete(point);
        } else {
            point.setMasque(true);
            pointInteretRepository.save(point);
        }
    }

    /* Changer la photo d'un lieu (admin) : un fichier JPEG, PNG ou WebP de 2 Mo au plus */
    @PostMapping("/points-interet/{id}/photo")
    public PointInteret changerPhoto(@PathVariable Long id, @RequestPart("photo") MultipartFile photo) throws IOException {
        PointInteret point = trouver(id);
        point.setImageUrl(fichierService.enregistrerImage(photo, "lieux", "lieu-" + id));
        point.setImageSource("ORIVY");
        point.setImageLicence(null);
        point.setPhotoChoisie(true);
        return pointInteretRepository.save(point);
    }

    /* Retirer la photo d'un lieu (admin) : la fiche affiche « Photo en attente », l'import ne la remet pas */
    @DeleteMapping("/points-interet/{id}/photo")
    public PointInteret retirerPhoto(@PathVariable Long id) {
        PointInteret point = trouver(id);
        point.setImageUrl(null);
        point.setImageSource(null);
        point.setImageLicence(null);
        point.setPhotoChoisie(true);
        return pointInteretRepository.save(point);
    }

    @GetMapping("/promenades")
    public List<Promenade> promenades() { return promenadeRepository.findAll(); }

    @PostMapping("/promenades")
    public Promenade creerPromenade(@Valid @RequestBody Promenade promenade) {
        return promenadeRepository.save(promenade);
    }

    public record CarteResponse(List<PointInteret> pointsInteret, List<Promenade> promenades,
            List<ActiviteCarte> activites) {
    }
}