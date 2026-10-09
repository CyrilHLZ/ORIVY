package fr.orivy.Orivy.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.Component.ImageEnrichmentRunner;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final ImageEnrichmentRunner runner;

    public AdminController(ImageEnrichmentRunner runner) {
        this.runner = runner;
    }

    @PostMapping("/enrich-images")
    public ResponseEntity<String> triggerEnrichment() {
        runner.enrichMissingImages();
        return ResponseEntity.accepted().body("Enrichissement lancé en tâche de fond.");
    }
}