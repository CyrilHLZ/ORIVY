package fr.orivy.Orivy.Controller;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
import fr.orivy.Orivy.Service.DecoupageService;
import fr.orivy.Orivy.Service.FichierService;
import fr.orivy.Orivy.Service.OpenStreetMapService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class CarteController {

    private final PointInteretRepository pointInteretRepository;
    private final PromenadeRepository promenadeRepository;
    private final ActiviteCarteRepository activiteRepository;
    private final FichierService fichierService;
    private final OpenStreetMapService openStreetMap;
    private final DecoupageService decoupage;

    public CarteController(PointInteretRepository pointInteretRepository,
            PromenadeRepository promenadeRepository,
            ActiviteCarteRepository activiteRepository,
            FichierService fichierService,
            OpenStreetMapService openStreetMap,
            DecoupageService decoupage) {
        this.decoupage = decoupage;
        this.pointInteretRepository = pointInteretRepository;
        this.promenadeRepository = promenadeRepository;
        this.activiteRepository = activiteRepository;
        this.fichierService = fichierService;
        this.openStreetMap = openStreetMap;
    }

    // Restaurants et bars (~60 000 lieux) : pas dans /api/carte (liste des activités, accueil…) ;
    // la carte les montre département par département (/api/carte/departement/{code})
    public static final Set<String> PAR_ZONE = Set.of("restaurant", "bar");

    @GetMapping("/carte")
    public CarteResponse carte() {
        Map<String, Long> nombresParZone = new HashMap<>();
        pointInteretRepository.compterParType(PAR_ZONE).forEach((ligne) -> nombresParZone.put((String) ligne[0], (Long) ligne[1]));
        return new CarteResponse(pointInteretRepository.findByTypeNotIn(PAR_ZONE), promenadeRepository.findAll(),
                activiteRepository.findAll(), nombresParZone);
    }

    /* Carte, 1re étape : nombre de lieux par catégorie dans chaque région et chaque département.
       Quelques kilo-octets au lieu de 100 000 lieux : la carte colorie les zones avec ces nombres. */
    @GetMapping("/carte/zones")
    public ZonesResponse zones() {
        Map<String, Map<String, Long>> parDepartement = new HashMap<>();
        Map<String, Map<String, Long>> parRegion = new HashMap<>();
        Map<String, String> regionDe = new HashMap<>();
        decoupage.departements().forEach((d) -> regionDe.put(d.code(), d.region()));
        for (Object[] ligne : pointInteretRepository.compterParDepartementEtType()) {
            String departement = (String) ligne[0], type = (String) ligne[1];
            long nombre = (Long) ligne[2];
            parDepartement.computeIfAbsent(departement, (k) -> new HashMap<>()).merge(type, nombre, Long::sum);
            String region = regionDe.get(departement);
            if (region != null) parRegion.computeIfAbsent(region, (k) -> new HashMap<>()).merge(type, nombre, Long::sum);
        }
        List<Zone> regions = DecoupageService.REGIONS.entrySet().stream()
                .map((r) -> new Zone(r.getKey(), r.getValue(), null, parRegion.getOrDefault(r.getKey(), Map.of())))
                .toList();
        List<Zone> departements = decoupage.departements().stream()
                .map((d) -> new Zone(d.code(), d.nom(), d.region(), parDepartement.getOrDefault(d.code(), Map.of())))
                .toList();
        return new ZonesResponse(regions, departements);
    }

    /* Carte, 2e étape : tous les lieux du département choisi (« 75 », « 2A », « 974 ») */
    @GetMapping("/carte/departement/{code}")
    public List<PointInteret> lieuxDuDepartement(@PathVariable String code) {
        return pointInteretRepository.findByDepartement(code);
    }

    @GetMapping("/points-interet")
    public List<PointInteret> pointsInteret() { return pointInteretRepository.findAll(); }

    /* Un seul lieu (lien /carte?lieu=point-12 : la carte ouvre son département puis sa fiche) */
    @GetMapping("/points-interet/{id}")
    public PointInteret pointInteret(@PathVariable Long id) { return trouver(id); }

    private PointInteret trouver(Long id) {
        return pointInteretRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Point introuvable"));
    }

    @PostMapping("/points-interet")
    public PointInteret creerPointInteret(@Valid @RequestBody PointInteret point) {
        point.setDepartement(decoupage.departementDe(point.getLatitude(), point.getLongitude()));
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
        existing.setDepartement(decoupage.departementDe(point.getLatitude(), point.getLongitude()));
        existing.setAdresse(point.getAdresse());
        existing.setImageUrl(point.getImageUrl());
        existing.setCouleur(point.getCouleur());
        existing.setImageSource(point.getImageSource());
        existing.setImageLicence(point.getImageLicence());
        return pointInteretRepository.save(existing);
    }

    @DeleteMapping("/points-interet/{id}")
    public void supprimerPointInteret(@PathVariable Long id) {
        PointInteret point = trouver(id);
        openStreetMap.retenirSuppression(point);   // un lieu OpenStreetMap ne reviendra pas au prochain import
        pointInteretRepository.delete(point);
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

    /* Retirer la photo d'un lieu (admin) : la fiche affiche « Photo en attente » */
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

    // nombresParZone : { restaurant: 52000, bar: 9800 } (ces lieux ne sont pas dans pointsInteret)
    public record CarteResponse(List<PointInteret> pointsInteret, List<Promenade> promenades,
            List<ActiviteCarte> activites, Map<String, Long> nombresParZone) {
    }

    // Une région ou un département, et son nombre de lieux par catégorie { "parc": 120, "restaurant": 3400 }
    public record Zone(String code, String nom, String region, Map<String, Long> nombres) {
    }

    public record ZonesResponse(List<Zone> regions, List<Zone> departements) {
    }
}
