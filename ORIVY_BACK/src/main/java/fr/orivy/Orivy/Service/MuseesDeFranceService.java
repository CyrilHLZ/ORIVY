package fr.orivy.Orivy.Service;

import static fr.orivy.Orivy.Service.OutilsImport.coordonnees;
import static fr.orivy.Orivy.Service.OutilsImport.couper;
import static fr.orivy.Orivy.Service.OutilsImport.premierRempli;

import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import fr.orivy.Orivy.Model.PointInteret;
import fr.orivy.Orivy.Repository.PointInteretRepository;

/*
 * Import des Musées de France (base Muséofile, ministère de la Culture, Licence Ouverte).
 * Un CSV public, séparé par des « | », d'environ 1 200 musées labellisés « Musée de France ».
 * Quand : au démarrage si aucun musée n'est encore importé, puis chaque vendredi à 5 h 30.
 * Photos : Wikidata, par l'identifiant Muséofile (M0037…).
 */
@Service
public class MuseesDeFranceService {

    private static final Logger log = LoggerFactory.getLogger(MuseesDeFranceService.class);
    public static final String SOURCE = "musees-de-france";
    // Propriété Wikidata qui porte l'identifiant Muséofile
    private static final String PROPRIETE_WIKIDATA = "P539";

    private final PointInteretRepository repository;

    @Value("${orivy.musees-de-france.url}")
    private String url;

    public MuseesDeFranceService(PointInteretRepository repository) {
        this.repository = repository;
    }

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void premierImport() {
        if (repository.countBySource(SOURCE) == 0) importer();
    }

    @Async
    @Scheduled(cron = "0 30 5 * * FRI")
    public void importChaqueSemaine() {
        importer();
    }

    public synchronized void importer() {
        Path fichier = null;
        try {
            log.info("Musées de France : téléchargement de la base Muséofile…");
            fichier = OutilsImport.telecharger(url);
            lire(fichier);
            List<PointInteret> photos = OutilsImport.poserPhotos(repository.findBySource(SOURCE),
                    OutilsImport.photosWikidata(PROPRIETE_WIKIDATA));
            repository.saveAll(photos);
            log.info("Musées de France : {} photos ajoutées ou mises à jour", photos.size());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Musées de France : import interrompu", e);
        } finally {
            if (fichier != null) fichier.toFile().delete();
        }
    }

    private void lire(Path fichier) throws Exception {
        // Les musées déjà importés, retrouvés par leur identifiant Muséofile (M0037…)
        Map<String, PointInteret> existants = new HashMap<>();
        repository.findBySource(SOURCE).forEach((p) -> existants.put(p.getIdExterne(), p));

        List<PointInteret> aEnregistrer = new ArrayList<>();
        try (Reader lecteur = Files.newBufferedReader(fichier, StandardCharsets.UTF_8)) {
            for (CSVRecord ligne : OutilsImport.CSV_MINISTERE.parse(lecteur)) {
                String identifiant = ligne.get("Identifiant");
                double[] gps = coordonnees(ligne.get("Coordonnees"));
                String nom = premierRempli(ligne.get("Nom_officiel"));
                if (identifiant.isBlank() || gps == null || nom == null) continue;   // pas de position : pas sur la carte

                String maj = ligne.get("Date_de_mise_a_jour");
                PointInteret point = existants.remove(identifiant);   // ce qui reste à la fin a disparu du fichier
                if (point != null && maj.equals(point.getMajExterne())) continue;   // rien n'a changé
                if (point == null) {
                    point = new PointInteret();
                    point.setSource(SOURCE);
                    point.setIdExterne(identifiant);
                }
                // « musée de l'impression sur étoffes » → « Musée de l'impression sur étoffes »
                point.setNom(couper(nom.substring(0, 1).toUpperCase() + nom.substring(1), 255));
                point.setType("culture");
                point.setLatitude(gps[0]);
                point.setLongitude(gps[1]);
                point.setAdresse(couper(String.join(", ", List.of(ligne.get("Adresse"), ligne.get("Ville"))
                        .stream().filter((s) -> !s.isBlank()).toList()), 255));
                // « Atout » dit ce qu'il y a à voir ; sinon l'histoire du musée
                point.setDescription(couper(premierRempli(ligne.get("Atout"), ligne.get("Histoire")), 255));
                point.setMajExterne(maj);
                aEnregistrer.add(point);
            }
        }
        repository.saveAll(aEnregistrer);
        repository.deleteAll(existants.values());   // retirés de la liste des Musées de France
        log.info("Musées de France : {} musées ajoutés ou mis à jour, {} retirés", aEnregistrer.size(), existants.size());
    }
}
