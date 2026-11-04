package fr.orivy.Orivy.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.Component.ImageEnrichmentRunner;
import fr.orivy.Orivy.Service.OpenStreetMapService;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ImageEnrichmentRunner runner;
    private final OpenStreetMapService openStreetMap;

    public AdminController(ImageEnrichmentRunner runner, OpenStreetMapService openStreetMap) {
        this.runner = runner;
        this.openStreetMap = openStreetMap;
    }

    @PostMapping("/enrich-images")
    public ResponseEntity<String> triggerEnrichment() {
        runner.enrichMissingImages();
        return ResponseEntity.accepted().body("Enrichissement lancé en tâche de fond.");
    }

    // Relance tout de suite l'import OpenStreetMap (sinon : le 1er de chaque mois)
    @PostMapping("/import-osm")
    public ResponseEntity<String> importOpenStreetMap() {
        openStreetMap.importerEnFond();
        return ResponseEntity.accepted().body("Import OpenStreetMap lancé en tâche de fond.");
    }
}
