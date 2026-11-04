package fr.orivy.Orivy.Service;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import fr.orivy.Orivy.Model.PointInteret;
import fr.orivy.Orivy.Repository.PointInteretRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/*
 * Import des PLAGES et des CHÂTEAUX VISITABLES d'OpenStreetMap pour toute la France
 * (licence ODbL : citer « © OpenStreetMap »). Les autres lieux (musées, parcs…) viennent de la carte curée (V7).
 * Quand : au démarrage si rien n'est encore importé, puis le 1er de chaque mois à 4 h.
 * Photos : seulement celles du lieu lui-même (balises image / wikimedia_commons, ou photo Wikidata).
 */
@Service
public class OpenStreetMapService {

    private static final Logger log = LoggerFactory.getLogger(OpenStreetMapService.class);
    // Deux serveurs Overpass gratuits : souvent saturés (réponse 429 ou 502), on alterne entre eux
    private static final List<String> OVERPASS = List.of(
            "https://overpass-api.de/api/interpreter",
            "https://overpass.private.coffee/api/interpreter");
    private static final int ESSAIS = 6;
    private static final String WIKIDATA = "https://query.wikidata.org/sparql";
    private static final String AGENT = "Orivy/1.0 (import des lieux OpenStreetMap)";

    /* Catégorie ORIVY → filtres Overpass. L'ordre compte : un château-musée reste un château. */
    private static final Map<String, List<String>> REQUETES = new LinkedHashMap<>();
    static {
        // Lieux importés d'OpenStreetMap (© OpenStreetMap, ODbL). L'ordre compte : un château-musée
        // reste un château. Les filtres gardent des lieux VISITABLES (nommés, ouverts au public).
        REQUETES.put("chateau", List.of(
                "nwr[\"historic\"=\"castle\"][\"name\"][\"tourism\"~\"^(attraction|museum)$\"]",
                "nwr[\"historic\"=\"castle\"][\"name\"][\"opening_hours\"]"));
        REQUETES.put("unesco", List.of("nwr[\"heritage:operator\"=\"whc\"][\"name\"]"));   // patrimoine mondial UNESCO
        REQUETES.put("plage", List.of("nwr[\"natural\"=\"beach\"][\"name\"]"));
        REQUETES.put("cinema", List.of("nwr[\"amenity\"=\"cinema\"][\"name\"]"));
        REQUETES.put("zoo", List.of("nwr[\"tourism\"=\"zoo\"][\"name\"]"));
        REQUETES.put("aquarium", List.of("nwr[\"tourism\"=\"aquarium\"][\"name\"]"));
        REQUETES.put("parc_loisir", List.of("nwr[\"tourism\"=\"theme_park\"][\"name\"]"));
        REQUETES.put("parc_aquatique", List.of("nwr[\"leisure\"=\"water_park\"][\"name\"]"));
        REQUETES.put("piscine", List.of("nwr[\"leisure\"=\"swimming_pool\"][\"name\"][\"access\"=\"yes\"]"));  // publiques seulement
        REQUETES.put("montagne", List.of("nwr[\"natural\"=\"peak\"][\"name\"][\"wikidata\"]"));                // sommets notables
        REQUETES.put("cascade", List.of("nwr[\"waterway\"=\"waterfall\"][\"name\"]"));
        REQUETES.put("circuit", List.of("nwr[\"highway\"=\"raceway\"][\"name\"]"));
        REQUETES.put("bowling", List.of("nwr[\"leisure\"=\"bowling_alley\"][\"name\"]"));
        REQUETES.put("karting", List.of("nwr[\"sport\"=\"karting\"][\"name\"]"));
        REQUETES.put("paintball", List.of("nwr[\"sport\"=\"paintball\"][\"name\"]"));
        // Catégories ajoutées (toujours © OpenStreetMap, ODbL) — filtres conservateurs pour rester « visitables »
        REQUETES.put("camping", List.of("nwr[\"tourism\"=\"camp_site\"][\"name\"]"));
        REQUETES.put("phare", List.of("nwr[\"man_made\"=\"lighthouse\"][\"name\"]"));
        REQUETES.put("grotte", List.of("nwr[\"natural\"=\"cave_entrance\"][\"name\"][\"tourism\"]"));        // grottes ouvertes au public
        REQUETES.put("jardin", List.of("nwr[\"leisure\"=\"garden\"][\"name\"][\"garden:type\"=\"botanical\"]")); // jardins botaniques
        REQUETES.put("vignoble", List.of("nwr[\"craft\"=\"winery\"][\"name\"]"));
        REQUETES.put("thermes", List.of(
                "nwr[\"leisure\"=\"spa\"][\"name\"]",
                "nwr[\"amenity\"=\"public_bath\"][\"name\"]"));
    }

    private final PointInteretRepository repository;
    private final JdbcTemplate jdbc;
    private final ObjectMapper json = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();

    // false dans les tests : pas d'appel à Internet
    @Value("${orivy.osm.import-auto:true}")
    private boolean importAuto;

    public OpenStreetMapService(PointInteretRepository repository, JdbcTemplate jdbc) {
        this.repository = repository;
        this.jdbc = jdbc;
    }

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void premierImport() {
        // Au démarrage : on (ré)importe dès qu'une catégorie OpenStreetMap n'a encore aucun lieu
        // (premier lancement, ou juste après l'ajout de nouvelles catégories). Une fois toutes
        // remplies, cette condition est fausse et on attend l'import mensuel.
        if (!importAuto) return;
        boolean manque = REQUETES.keySet().stream().anyMatch((t) -> repository.countByTypeAndOsmIdIsNotNull(t) == 0);
        if (manque) importer();
    }

    @Async
    @Scheduled(cron = "0 0 4 1 * *")
    public void importChaqueMois() {
        if (importAuto) importer();
    }

    // Bouton admin : lancé à la demande, même si l'import automatique est coupé
    @Async
    public void importerEnFond() {
        importer();
    }

    /* L'admin supprime un lieu importé : on retient son identifiant pour ne pas le recréer */
    public void retenirSuppression(PointInteret point) {
        if (point.getOsmId() != null) {
            jdbc.update("INSERT INTO lieu_osm_retire (osm_id) SELECT ? WHERE NOT EXISTS "
                    + "(SELECT 1 FROM lieu_osm_retire WHERE osm_id = ?)", point.getOsmId(), point.getOsmId());
        }
    }

    public synchronized void importer() {
        log.info("OpenStreetMap : import des lieux…");
        Set<String> retires = new HashSet<>(jdbc.queryForList("SELECT osm_id FROM lieu_osm_retire", String.class));
        Map<String, PointInteret> existants = new HashMap<>();
        repository.findByOsmIdIsNotNull().forEach((p) -> existants.put(p.getOsmId(), p));
        // Les lieux d'ORIVY, pour ne pas créer de doublon (ex. le Louvre saisi à la main ET dans OpenStreetMap)
        List<PointInteret> orivy = repository.findByOsmIdIsNull();

        Map<String, PointInteret> lus = new LinkedHashMap<>();   // osmId → lieu, tous types confondus
        Map<String, String> wikidata = new HashMap<>();          // osmId → Q123 (pour la photo)
        Set<String> dejaVus = new HashSet<>();                   // « nom|case de ~1 km » : un lieu en double dans OSM
        Set<String> typesLus = new HashSet<>();                  // types dont la requête a réussi

        try {
            for (Map.Entry<String, List<String>> requete : REQUETES.entrySet()) {
                String type = requete.getKey();
                JsonNode elements;
                try {
                    elements = overpass(requete.getValue()).path("elements");
                } catch (IOException e) {
                    log.warn("OpenStreetMap : {} non importés ({})", type, e.getMessage());
                    continue;   // on garde les lieux déjà importés de ce type
                }
                typesLus.add(type);
                int avant = lus.size();
                for (JsonNode element : elements) {
                    String osmId = element.path("type").asString() + "/" + element.path("id").asString();
                    JsonNode tags = element.path("tags");
                    String nom = tags.path("name").asString("").trim();
                    // Un nœud a lat/lon ; un bâtiment ou une zone a son centre (« out center »)
                    JsonNode position = element.has("lat") ? element : element.path("center");
                    if (nom.isEmpty() || !position.has("lat") || lus.containsKey(osmId) || retires.contains(osmId)) continue;
                    double lat = position.path("lat").asDouble();
                    double lon = position.path("lon").asDouble();
                    if (!dejaVus.add(simplifier(nom) + "|" + Math.round(lat * 100) + "|" + Math.round(lon * 100))) continue;
                    if (existeDansOrivy(orivy, nom, lat, lon)) continue;

                    PointInteret point = existants.getOrDefault(osmId, new PointInteret());
                    point.setOsmId(osmId);
                    point.setNom(couper(nom, 255));
                    point.setType(type);
                    point.setLatitude(lat);
                    point.setLongitude(lon);
                    point.setAdresse(adresse(tags));
                    point.setDescription(couper(tags.path("description").asString(null), 255));
                    // Pas de photo dans OSM : on garde celle d'avant (Wikidata) ; l'admin a toujours le dernier mot
                    String photo = photo(tags);
                    if (photo != null && !point.isPhotoChoisie()) {
                        point.setImageUrl(photo);
                        point.setImageSource("Wikimedia Commons");
                        point.setImageLicence("Licence indiquée sur la fiche Wikimedia Commons");
                    }
                    if (tags.has("wikidata")) wikidata.put(osmId, tags.path("wikidata").asString());
                    lus.put(osmId, point);
                }
                log.info("OpenStreetMap : {} {}", lus.size() - avant, type);
                Thread.sleep(5000);   // Overpass est un service gratuit : on souffle entre deux requêtes
            }

            ajouterPhotosWikidata(lus, wikidata);
            repository.saveAll(lus.values());

            // Disparus d'OpenStreetMap (ou devenus doublons) : seulement pour les types bien relus
            List<PointInteret> disparus = existants.values().stream()
                    .filter((p) -> !lus.containsKey(p.getOsmId()) && typesLus.contains(p.getType()))
                    .toList();
            repository.deleteAll(disparus);
            log.info("OpenStreetMap : {} lieux importés ou mis à jour, {} retirés", lus.size(), disparus.size());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("OpenStreetMap : import interrompu", e);
        }
    }

    /* Une requête Overpass sur la France ; « out center » donne le centre des bâtiments et des zones */
    private JsonNode overpass(List<String> filtres) throws IOException, InterruptedException {
        StringBuilder requete = new StringBuilder("[out:json][timeout:300];area[\"ISO3166-1\"=\"FR\"][admin_level=2]->.fr;(");
        filtres.forEach((f) -> requete.append(f).append("(area.fr);"));
        requete.append(");out center tags;");
        String corps = "data=" + URLEncoder.encode(requete.toString(), StandardCharsets.UTF_8);

        // Serveur occupé : on réessaie sur l'autre, en attendant un peu plus à chaque fois (20 s, 40 s, 60 s…)
        IOException derniere = null;
        for (int essai = 0; essai < ESSAIS; essai++) {
            try {
                return envoyer(HttpRequest.newBuilder(URI.create(OVERPASS.get(essai % OVERPASS.size())))
                        .timeout(Duration.ofMinutes(6))
                        .header("User-Agent", AGENT)
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(corps))
                        .build());
            } catch (IOException e) {
                derniere = e;
                log.info("OpenStreetMap : {}, nouvel essai", e.getMessage());
                Thread.sleep(20_000L * (essai + 1));
            }
        }
        throw derniere;
    }

    private JsonNode envoyer(HttpRequest requete) throws IOException, InterruptedException {
        HttpResponse<InputStream> reponse = http.send(requete, HttpResponse.BodyHandlers.ofInputStream());
        try (InputStream corps = reponse.body()) {
            if (reponse.statusCode() != 200) throw new IOException(requete.uri().getHost() + " répond " + reponse.statusCode());
            return json.readTree(corps);
        }
    }

    /* Photo Wikidata (propriété P18) des lieux qui n'en ont pas, par paquets de 300 */
    private void ajouterPhotosWikidata(Map<String, PointInteret> lus, Map<String, String> wikidata) throws InterruptedException {
        Map<String, List<PointInteret>> parQ = new HashMap<>();
        wikidata.forEach((osmId, q) -> {
            PointInteret point = lus.get(osmId);
            if (point != null && point.getImageUrl() == null && !point.isPhotoChoisie() && q.matches("Q\\d+")) {
                parQ.computeIfAbsent(q, (k) -> new ArrayList<>()).add(point);
            }
        });
        List<String> identifiants = new ArrayList<>(parQ.keySet());
        int trouvees = 0;
        for (int i = 0; i < identifiants.size(); i += 300) {
            String valeurs = String.join(" ", identifiants.subList(i, Math.min(i + 300, identifiants.size()))
                    .stream().map((q) -> "wd:" + q).toList());
            String sparql = "SELECT ?item ?image WHERE { VALUES ?item { " + valeurs + " } ?item wdt:P18 ?image . }";
            try {
                JsonNode lignes = envoyer(HttpRequest.newBuilder(URI.create(WIKIDATA))
                        .timeout(Duration.ofMinutes(1))
                        .header("User-Agent", AGENT)
                        .header("Accept", "application/sparql-results+json")
                        .header("Content-Type", "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString("query=" + URLEncoder.encode(sparql, StandardCharsets.UTF_8)))
                        .build()).path("results").path("bindings");
                for (JsonNode ligne : lignes) {
                    String uri = ligne.path("item").path("value").asString();
                    String q = uri.substring(uri.lastIndexOf('/') + 1);
                    // width=800 : Wikimedia envoie une image réduite, pas l'original de plusieurs Mo
                    String image = ligne.path("image").path("value").asString().replace("http://", "https://") + "?width=800";
                    for (PointInteret point : parQ.getOrDefault(q, List.of())) {
                        if (point.getImageUrl() == null) {
                            point.setImageUrl(image);
                            point.setImageSource("Wikimedia Commons");
                            point.setImageLicence("Licence indiquée sur la fiche Wikimedia Commons");
                            trouvees++;
                        }
                    }
                }
            } catch (IOException e) {
                log.warn("OpenStreetMap : photos Wikidata indisponibles ({})", e.getMessage());
                return;
            }
            Thread.sleep(1000);
        }
        log.info("OpenStreetMap : {} photos trouvées sur Wikidata", trouvees);
    }

    /* La photo du lieu lui-même, d'après ses balises OSM ; sinon null (→ « Photo en attente ») */
    private static String photo(JsonNode tags) {
        String commons = tags.path("wikimedia_commons").asString("");
        if (commons.startsWith("File:")) return fichierCommons(commons.substring(5));
        String image = tags.path("image").asString("");
        int fichier = image.indexOf("/wiki/File:");
        if (image.startsWith("https://commons.wikimedia.org") && fichier >= 0) return fichierCommons(image.substring(fichier + 11));
        if (image.startsWith("https://upload.wikimedia.org/")) return image;
        return null;
    }

    private static String fichierCommons(String nom) {
        String encode = URLEncoder.encode(nom.trim().replace(' ', '_'), StandardCharsets.UTF_8).replace("+", "%20");
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + encode + "?width=800";
    }

    /* « 12 rue de la Paix, 75002 Paris » avec ce que le lieu renseigne */
    private static String adresse(JsonNode tags) {
        String rue = String.join(" ", List.of(tags.path("addr:housenumber").asString(""), tags.path("addr:street").asString(""))).trim();
        String ville = String.join(" ", List.of(tags.path("addr:postcode").asString(""), tags.path("addr:city").asString(""))).trim();
        String adresse = String.join(", ", List.of(rue, ville).stream().filter((s) -> !s.isEmpty()).toList());
        return adresse.isEmpty() ? null : couper(adresse, 255);
    }

    /* Même nom (sans accents ni majuscules) à moins d'1 km d'un lieu d'ORIVY : c'est le même lieu */
    private static boolean existeDansOrivy(List<PointInteret> orivy, String nom, double lat, double lon) {
        String simple = simplifier(nom);
        for (PointInteret p : orivy) {
            if (Math.abs(p.getLatitude() - lat) < 0.01 && Math.abs(p.getLongitude() - lon) < 0.015
                    && simplifier(p.getNom()).equals(simple)) return true;
        }
        return false;
    }

    private static String simplifier(String texte) {
        return Normalizer.normalize(texte, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private static String couper(String texte, int max) {
        if (texte == null || texte.isBlank()) return null;
        return texte.length() <= max ? texte : texte.substring(0, max - 1) + "…";
    }
}
