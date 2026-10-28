package fr.orivy.Orivy.Component;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import fr.orivy.Orivy.DTO.ImageResultDto;
import fr.orivy.Orivy.Model.PointInteret;
import fr.orivy.Orivy.Repository.PointInteretRepository;
import fr.orivy.Orivy.Service.ImageEnrichmentService;

@Component
public class ImageEnrichmentRunner {

    private static final Logger log = LoggerFactory.getLogger(ImageEnrichmentRunner.class);

    private final PointInteretRepository repository;
    private final ImageEnrichmentService enrichmentService;

    public ImageEnrichmentRunner(PointInteretRepository repository, ImageEnrichmentService enrichmentService) {
        this.repository = repository;
        this.enrichmentService = enrichmentService;
    }

    @Async
    public void enrichMissingImages() {
        List<PointInteret> points = repository.findByImageUrlIsNull();
        int total = points.size();
        log.info("Enrichissement de {} points sans image", total);

        int found = 0;
        for (PointInteret point : points) {
            Optional<ImageResultDto> result = enrichmentService.findImage(point);

            if (result.isPresent()) {
                ImageResultDto img = result.get();
                point.setImageUrl(img.url());
                point.setImageSource("Wikimedia Commons");
                point.setImageLicence(img.license() + " — " + img.attribution());
                repository.save(point);
                found++;
            }

            try {
                Thread.sleep(200); // throttle : respecte l'API MediaWiki
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        log.info("Enrichissement terminé, {} images trouvées sur {}", found, total);
    }
}