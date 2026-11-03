package fr.orivy.Orivy.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.Component.ImageEnrichmentRunner;
import fr.orivy.Orivy.Service.MonumentsHistoriquesService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ImageEnrichmentRunner runner;
    private final MonumentsHistoriquesService monuments;

    public AdminController(ImageEnrichmentRunner runner, MonumentsHistoriquesService monuments) {
        this.runner = runner;
        this.monuments = monuments;
    }

    @PostMapping("/enrich-images")
    public ResponseEntity<String> triggerEnrichment() {
        runner.enrichMissingImages();
        return ResponseEntity.accepted().body("Enrichissement lancé en tâche de fond.");
    }

    // Relance tout de suite l'import des Monuments historiques (sinon : chaque vendredi à 5 h)
    @PostMapping("/monuments-historiques")
    public ResponseEntity<String> importerMonuments() {
        monuments.importChaqueSemaine();
        return ResponseEntity.accepted().body("Import des Monuments historiques lancé en tâche de fond.");
    }
}