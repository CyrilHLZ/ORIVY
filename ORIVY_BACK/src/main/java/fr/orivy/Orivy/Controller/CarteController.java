package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.ActiviteCarte;
import fr.orivy.Orivy.Model.Commentaire;
import fr.orivy.Orivy.Model.PointInteret;
import fr.orivy.Orivy.Model.Promenade;
import fr.orivy.Orivy.Repository.ActiviteCarteRepository;
import fr.orivy.Orivy.Repository.CommentaireRepository;
import fr.orivy.Orivy.Repository.PointInteretRepository;
import fr.orivy.Orivy.Repository.PromenadeRepository;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CarteController {

    private final PointInteretRepository pointInteretRepository;
    private final PromenadeRepository promenadeRepository;
    private final ActiviteCarteRepository activiteRepository;
    private final CommentaireRepository commentaireRepository;

    public CarteController(PointInteretRepository pointInteretRepository,
            PromenadeRepository promenadeRepository,
            ActiviteCarteRepository activiteRepository,
            CommentaireRepository commentaireRepository) {
        this.pointInteretRepository = pointInteretRepository;
        this.promenadeRepository = promenadeRepository;
        this.activiteRepository = activiteRepository;
        this.commentaireRepository = commentaireRepository;
    }

    @GetMapping("/carte")
    public CarteResponse carte() {
        return new CarteResponse(pointInteretRepository.findAll(), promenadeRepository.findAll(),
                activiteRepository.findAll());
    }

    @GetMapping("/points-interet")
    public List<PointInteret> pointsInteret() { return pointInteretRepository.findAll(); }

    @PostMapping("/points-interet")
    public PointInteret creerPointInteret(@Valid @RequestBody PointInteret point) {
        return pointInteretRepository.save(point);
    }

    @PutMapping("/points-interet/{id}")
    public PointInteret modifierPointInteret(@PathVariable Long id, @Valid @RequestBody PointInteret point) {
        PointInteret existing = pointInteretRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Point introuvable"));
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
        if (!pointInteretRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Point introuvable");
        }
        pointInteretRepository.deleteById(id);
    }

    @GetMapping("/promenades")
    public List<Promenade> promenades() { return promenadeRepository.findAll(); }

    @PostMapping("/promenades")
    public Promenade creerPromenade(@Valid @RequestBody Promenade promenade) {
        return promenadeRepository.save(promenade);
    }

    @GetMapping("/{cibleType}/{cibleId}/commentaires")
    public List<Commentaire> commentaires(@PathVariable String cibleType, @PathVariable Long cibleId) {
        return commentaireRepository.findByCibleTypeAndCibleId(cibleType, cibleId);
    }

    @PostMapping("/commentaires")
    public Commentaire creerCommentaire(@Valid @RequestBody Commentaire commentaire) {
        if (commentaire.getCibleType() == null || commentaire.getCibleType().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le type de cible est obligatoire");
        }
        return commentaireRepository.save(commentaire);
    }

    public record CarteResponse(List<PointInteret> pointsInteret, List<Promenade> promenades,
            List<ActiviteCarte> activites) {
    }
}