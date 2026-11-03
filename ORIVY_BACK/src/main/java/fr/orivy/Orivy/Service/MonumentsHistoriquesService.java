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
import java.util.Set;

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
 * Import des Monuments historiques (base Mérimée, ministère de la Culture, Licence Ouverte).
 * Un CSV public, séparé par des « | », d'environ 47 000 monuments (dont 44 500 avec leurs coordonnées).
 * Quand : au démarrage si aucun monument n'est encore importé, puis chaque vendredi à 5 h
 * (le ministère met le fichier à jour le jeudi).
 * Photos : Wikidata relie la plupart des monuments à leur référence Mérimée et à une photo de
 * Wikimedia Commons (environ 85 % des monuments).
 */
@Service
public class MonumentsHistoriquesService {

    private static final Logger log = LoggerFactory.getLogger(MonumentsHistoriquesService.class);
    public static final String SOURCE = "monuments-historiques";
    // Maisons et immeubles privés : protégés, mais rien à visiter (environ 5 000)
    private static final Set<String> SANS_INTERET = Set.of("Maison", "Immeuble", "Immeubles");
    // Propriété Wikidata qui porte la référence Mérimée
    private static final String PROPRIETE_WIKIDATA = "P380";

    private final PointInteretRepository repository;

    @Value("${orivy.monuments-historiques.url}")
    private String url;

    public MonumentsHistoriquesService(PointInteretRepository repository) {
        this.repository = repository;
    }

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void premierImport() {
        if (repository.countBySource(SOURCE) == 0) importer();
    }

    @Async
    @Scheduled(cron = "0 0 5 * * FRI")
    public void importChaqueSemaine() {
        importer();
    }

    public synchronized void importer() {
        Path fichier = null;
        try {
            log.info("Monuments historiques : téléchargement de la base Mérimée…");
            fichier = OutilsImport.telecharger(url);
            lire(fichier);
            List<PointInteret> photos = OutilsImport.poserPhotos(repository.findBySource(SOURCE),
                    OutilsImport.photosWikidata(PROPRIETE_WIKIDATA));
            repository.saveAll(photos);
            log.info("Monuments historiques : {} photos ajoutées ou mises à jour", photos.size());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("Monuments historiques : import interrompu", e);
        } finally {
            if (fichier != null) fichier.toFile().delete();
        }
    }

    private void lire(Path fichier) throws Exception {
        // Les monuments déjà importés, retrouvés par leur référence (PA00079071…)
        Map<String, PointInteret> existants = new HashMap<>();
        repository.findBySource(SOURCE).forEach((p) -> existants.put(p.getIdExterne(), p));

        List<PointInteret> aEnregistrer = new ArrayList<>();
        try (Reader lecteur = Files.newBufferedReader(fichier, StandardCharsets.UTF_8)) {
            for (CSVRecord ligne : OutilsImport.CSV_MINISTERE.parse(lecteur)) {
                String reference = ligne.get("Reference");
                double[] gps = coordonnees(ligne.get("coordonnees_au_format_WGS84"));
                String nom = premierRempli(ligne.get("Titre_editorial_de_la_notice"), ligne.get("Denomination_de_l_edifice"));
                if (reference.isBlank() || gps == null || nom == null) continue;   // pas de position : pas sur la carte
                if (SANS_INTERET.contains(nom)) continue;
                // « Église », « Château » tout seuls : on ajoute la commune → « Église (Vézelay) »
                String commune = ligne.get("Commune_forme_editoriale").split(";")[0].trim();
                if (!nom.contains(" ") && !commune.isBlank()) nom = nom + " (" + commune + ")";

                String maj = ligne.get("Date_de_la_derniere_mise_a_jour");
                PointInteret point = existants.remove(reference);   // ce qui reste à la fin a disparu du fichier
                if (point != null && maj.equals(point.getMajExterne())) continue;   // rien n'a changé
                if (point == null) {
                    point = new PointInteret();
                    point.setSource(SOURCE);
                    point.setIdExterne(reference);
                }
                point.setNom(couper(nom, 255));
                point.setType("monument");
                point.setLatitude(gps[0]);
                point.setLongitude(gps[1]);
                point.setAdresse(couper(String.join(", ", List.of(ligne.get("Adresse_forme_editoriale"), commune)
                        .stream().filter((s) -> !s.isBlank()).toList()), 255));
                point.setDescription(couper(description(ligne), 255));
                point.setMajExterne(maj);
                aEnregistrer.add(point);
            }
        }
        repository.saveAll(aEnregistrer);
        repository.deleteAll(existants.values());   // retirés de la base Mérimée
        log.info("Monuments historiques : {} monuments ajoutés ou mis à jour, {} retirés", aEnregistrer.size(), existants.size());
    }

    /* « Classé MH · 16e s. — Croix en pierre… » */
    private static String description(CSVRecord ligne) {
        String protection = ligne.get("Typologie_de_la_protection").split(";")[0];
        String siecle = ligne.get("Format_abrege_du_siecle_de_construction").split(";")[0];
        String tete = String.join(" · ", List.of(protection, siecle).stream().filter((s) -> !s.isBlank()).toList());
        String texte = premierRempli(ligne.get("Historique"), ligne.get("Precision_de_la_protection"));
        if (texte == null) return tete.isBlank() ? null : tete;
        return tete.isBlank() ? texte : tete + " — " + texte;
    }
}
