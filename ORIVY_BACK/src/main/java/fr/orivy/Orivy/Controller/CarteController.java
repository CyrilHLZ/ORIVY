package fr.orivy.Orivy.Controller;

import java.io.IOException;
import java.util.List;

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

    public CarteController(PointInteretRepository pointInteretRepository,
            PromenadeRepository promenadeRepository,
            ActiviteCarteRepository activiteRepository,
            FichierService fichierService,
            OpenStreetMapService openStreetMap) {
        this.pointInteretRepository = pointInteretRepository;
        this.promenadeRepository = promenadeRepository;
        this.activiteRepository = activiteRepository;
        this.fichierService = fichierService;
        this.openStreetMap = openStreetMap;
    }

    @GetMapping("/carte")
    public CarteResponse carte() {
        return new CarteResponse(pointInteretRepository.findAll(), promenadeRepository.findAll(),
                activiteRepository.findAll());
    }

    @GetMapping("/points-interet")
    public List<PointInteret> pointsInteret() { return pointInteretRepository.findAll(); }

    private PointInteret trouver(Long id) {
        return pointInteretRepository.findById(id)
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

    public record CarteResponse(List<PointInteret> pointsInteret, List<Promenade> promenades,
            List<ActiviteCarte> activites) {
    }
}