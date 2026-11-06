package fr.orivy.Orivy.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
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
 * Import des lieux d'OpenStreetMap pour toute la France (licence ODbL : citer « © OpenStreetMap »),
 * en plus de la carte curée (V7). Seuls les lieux VÉRIFIÉS entrent (voir verifie()) ; la France est
 * découpée en zones (ZONES) pour que chaque requête reste légère pour les serveurs gratuits.
 * Quand : au démarrage si rien n'est encore importé, puis le 1er de chaque mois à 4 h.
 * Photos : seulement celles du lieu lui-même (balises image / wikimedia_commons, ou photo Wikidata).
 */
@Service
public class OpenStreetMapService {

    private static final Logger log = LoggerFactory.getLogger(OpenStreetMapService.class);
    // Deux serveurs Overpass gratuits, souvent saturés : le principal, puis le secours au dernier essai seulement
    private static final List<String> OVERPASS = List.of(
            "https://overpass-api.de/api/interpreter",
            "https://overpass.private.coffee/api/interpreter");
    private static final int ESSAIS = 4;
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
        // V17 — nature, importée en premier (catégories les plus attendues) : seulement les lieux
        // NOTABLES (fiche Wikidata), les GR et GR de Pays
        REQUETES.put("promenade", List.of(
                "relation[\"route\"=\"hiking\"][\"name\"][\"network\"~\"^(nwn|rwn)$\"]",   // GR et GR de Pays
                "relation[\"route\"=\"hiking\"][\"name\"][\"wikidata\"]"));
        REQUETES.put("parc", List.of("nwr[\"leisure\"=\"park\"][\"name\"][\"wikidata\"]"));
        REQUETES.put("foret", List.of(
                "nwr[\"landuse\"=\"forest\"][\"name\"][\"wikidata\"]",
                "nwr[\"natural\"=\"wood\"][\"name\"][\"wikidata\"]"));
        REQUETES.put("jardin", List.of(
                "nwr[\"leisure\"=\"garden\"][\"name\"][\"garden:type\"=\"botanical\"]",
                "nwr[\"leisure\"=\"garden\"][\"name\"][\"wikidata\"]"));
        REQUETES.put("espace_naturel", List.of("nwr[\"leisure\"=\"nature_reserve\"][\"name\"][\"wikidata\"]"));
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
        REQUETES.put("phare", List.of("nwr[\"man_made\"=\"lighthouse\"][\"name\"]"));
        REQUETES.put("grotte", List.of("nwr[\"natural\"=\"cave_entrance\"][\"name\"][\"tourism\"]"));        // grottes ouvertes au public
        REQUETES.put("vignoble", List.of("nwr[\"craft\"=\"winery\"][\"name\"]"));
        REQUETES.put("thermes", List.of(
                "nwr[\"leisure\"=\"spa\"][\"name\"]",
                "nwr[\"amenity\"=\"public_bath\"][\"name\"]"));
        // V17 — activités en ville (vérifiées par verifie() : site, téléphone, horaires ou Wikidata)
        REQUETES.put("culture", List.of("nwr[\"tourism\"=\"museum\"][\"name\"]"));
        REQUETES.put("theatre", List.of("nwr[\"amenity\"=\"theatre\"][\"name\"]"));
        REQUETES.put("escape_game", List.of("nwr[\"leisure\"=\"escape_game\"][\"name\"]"));
        REQUETES.put("laser_game", List.of("nwr[\"sport\"=\"laser_tag\"][\"name\"]"));
        REQUETES.put("trampoline", List.of("nwr[\"leisure\"=\"trampoline_park\"][\"name\"]"));
        REQUETES.put("mini_golf", List.of("nwr[\"leisure\"=\"miniature_golf\"][\"name\"]"));
        REQUETES.put("patinoire", List.of("nwr[\"leisure\"=\"ice_rink\"][\"name\"]"));
        REQUETES.put("accrobranche", List.of("nwr[\"sport\"=\"climbing_adventure\"][\"name\"]"));
        REQUETES.put("escalade", List.of("nwr[\"leisure\"=\"sports_centre\"][\"sport\"~\"climbing\"][\"name\"]"));
        // Restaurants et bars : beaucoup de lieux (~60 000), servis à la carte par zone (/api/carte/zone)
        REQUETES.put("restaurant", List.of("nwr[\"amenity\"=\"restaurant\"][\"name\"]"));
        REQUETES.put("bar", List.of("nwr[\"amenity\"~\"^(bar|pub|biergarten)$\"][\"name\"]"));
    }

    // Commerces / salles : on n'affiche que ceux qui prouvent qu'ils existent (site, téléphone, horaires ou Wikidata)
    private static final Set<String> A_VERIFIER = Set.of("cinema", "bowling", "karting", "paintball", "culture",
            "theatre", "escape_game", "laser_game", "trampoline", "mini_golf", "patinoire", "accrobranche", "escalade",
            "restaurant", "bar");
    private static final List<String> PREUVES = List.of("website", "contact:website", "url", "phone", "contact:phone",
            "opening_hours", "wikidata", "wikipedia");
    // Tronçons de GR sans intérêt pour un promeneur
    private static final java.util.regex.Pattern TRONCON =
            java.util.regex.Pattern.compile("^(acc[eè]s|liaison|variante|bretelle|raccord|jonction)\\b.*", java.util.regex.Pattern.CASE_INSENSITIVE);

    // France découpée en zones : une requête sur toute la France dépasse le temps limite des serveurs gratuits.
    // {sud, ouest, nord, est} — métropole en 4×4 + Corse + outre-mer
    private static final List<double[]> ZONES = new ArrayList<>();
    static {
        double sud = 42.3, ouest = -5.3, nord = 51.2, est = 8.3;
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                ZONES.add(new double[] { sud + (nord - sud) * i / 4, ouest + (est - ouest) * j / 4,
                        sud + (nord - sud) * (i + 1) / 4, ouest + (est - ouest) * (j + 1) / 4 });
            }
        }
        ZONES.add(new double[] { 41.3, 8.5, 43.1, 9.6 });        // Corse
        ZONES.add(new double[] { 14.3, -61.9, 16.6, -60.7 });    // Guadeloupe, Martinique
        ZONES.add(new double[] { 2.0, -54.7, 5.9, -51.5 });      // Guyane
        ZONES.add(new double[] { -21.5, 55.1, -20.8, 55.9 });    // La Réunion
        ZONES.add(new double[] { -13.1, 44.9, -12.5, 45.4 });    // Mayotte
    }

    private final PointInteretRepository repository;
    private final JdbcTemplate jdbc;
    private final DecoupageService decoupage;
    private final ObjectMapper json = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(30)).build();

    // false dans les tests : pas d'appel à Internet
    @Value("${orivy.osm.import-auto:true}")
    private boolean importAuto;

    // Fichier préparé par scripts/osm/preparer.sh (extrait France de Geofabrik, une ligne JSON par lieu).
    // Renseigné : on lit ce fichier au lieu d'interroger Overpass (rapide, sans serveur saturé).
    @Value("${orivy.osm.fichier:}")
    private String fichier;

    public OpenStreetMapService(PointInteretRepository repository, JdbcTemplate jdbc, DecoupageService decoupage) {
        this.decoupage = decoupage;
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
            Map<String, List<JsonNode>> depuisFichier = lireFichier();
            for (Map.Entry<String, List<String>> requete : REQUETES.entrySet()) {
                String type = requete.getKey();
                List<JsonNode> elements = new ArrayList<>();
                boolean complet = true;
                if (depuisFichier != null) elements.addAll(depuisFichier.getOrDefault(type, List.of()));
                else for (double[] zone : ZONES) {
                    try {
                        overpass(requete.getValue(), zone).path("elements").forEach(elements::add);
                    } catch (IOException e) {
                        log.warn("OpenStreetMap : {} non importés dans une zone ({})", type, e.getMessage());
                        complet = false;   // on garde les lieux déjà importés ; on ne retirera rien de ce type
                    }
                    Thread.sleep(2000);   // Overpass est un service gratuit : on souffle entre deux requêtes
                }
                if (complet) typesLus.add(type);
                Map<String, PointInteret> duType = new LinkedHashMap<>();
                for (JsonNode element : elements) {
                    String osmId = element.path("type").asString() + "/" + element.path("id").asString();
                    JsonNode tags = element.path("tags");
                    String nom = tags.path("name").asString("").trim();
                    // Un nœud a lat/lon ; un bâtiment ou une zone a son centre (« out center »)
                    JsonNode position = element.has("lat") ? element : element.path("center");
                    if (nom.isEmpty() || !position.has("lat") || lus.containsKey(osmId) || retires.contains(osmId)) continue;
                    if (!verifie(type, nom, tags)) continue;
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
                    point.setDepartement(decoupage.departementDe(lat, lon));
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
                    duType.put(osmId, point);
                }
                // Enregistré tout de suite : les lieux apparaissent sur la carte catégorie par catégorie,
                // et un arrêt du back en plein import ne fait pas tout perdre
                ajouterPhotosWikidata(duType, wikidata);
                repository.saveAll(duType.values());
                log.info("OpenStreetMap : {} {}", duType.size(), type);
            }

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

    /*
     * Lieu fiable ? Pas privé ni fermé, pas un nom générique (« Parc », « Musée »), pas un tronçon de GR,
     * et pour les commerces / salles : au moins une preuve d'existence (site, téléphone, horaires, Wikidata).
     */
    static boolean verifie(String type, String nom, JsonNode tags) {
        String acces = tags.path("access").asString("");
        if (acces.equals("private") || acces.equals("no")) return false;
        if (tags.has("disused") || tags.has("abandoned") || tags.has("end_date")) return false;
        String simple = simplifier(nom);
        if (simple.length() < 4 || GENERIQUES.contains(simple)) return false;
        if (type.equals("promenade") && TRONCON.matcher(nom.trim()).matches()) return false;
        if (A_VERIFIER.contains(type)) return PREUVES.stream().anyMatch(tags::has);
        return true;
    }

    private static final Set<String> GENERIQUES = Set.of("parc", "parcpublic", "squarepublic", "square", "jardin",
            "jardinpublic", "musee", "cinema", "bowling", "foret", "bois", "theatre", "patinoire", "minigolf",
            "escapegame", "lasergame", "karting", "paintball", "escalade", "accrobranche", "reservenaturelle");

    /* Une requête Overpass sur une zone de la France ; « out center » donne le centre des bâtiments et des zones */
    /* Lit le fichier préparé (une ligne JSON par lieu, même forme qu'une réponse Overpass « out center tags »)
       et range chaque lieu dans les catégories dont il respecte un filtre. null : pas de fichier → Overpass. */
    private Map<String, List<JsonNode>> lireFichier() {
        if (fichier == null || fichier.isBlank()) return null;
        Path chemin = Path.of(fichier);
        if (!Files.isRegularFile(chemin)) {
            log.warn("OpenStreetMap : fichier {} introuvable, on passe par Overpass", fichier);
            return null;
        }
        Map<String, List<JsonNode>> parType = new HashMap<>();
        int lignes = 0;
        try (BufferedReader lecteur = Files.newBufferedReader(chemin, StandardCharsets.UTF_8)) {
            String ligne;
            while ((ligne = lecteur.readLine()) != null) {
                if (ligne.isBlank()) continue;
                lignes++;
                JsonNode element = json.readTree(ligne);
                REQUETES.forEach((type, filtres) -> {
                    if (filtres.stream().anyMatch((f) -> correspond(element, f))) {
                        parType.computeIfAbsent(type, (k) -> new ArrayList<>()).add(element);
                    }
                });
            }
        } catch (IOException e) {
            log.warn("OpenStreetMap : lecture de {} impossible ({}), on passe par Overpass", fichier, e.getMessage());
            return null;
        }
        log.info("OpenStreetMap : {} lieux lus dans {}", lignes, fichier);
        return parType;
    }

    // Une condition d'un filtre Overpass : ["clé"], ["clé"="valeur"] ou ["clé"~"expression"]
    private static final java.util.regex.Pattern CONDITION =
            java.util.regex.Pattern.compile("\\[\"([^\"]+)\"(?:(=|~)\"([^\"]*)\")?\\]");
    private static final Map<String, java.util.regex.Pattern> EXPRESSIONS = new java.util.concurrent.ConcurrentHashMap<>();

    /* Le lieu respecte-t-il ce filtre Overpass (ex. nwr["leisure"="park"]["name"]["wikidata"]) ? */
    static boolean correspond(JsonNode element, String filtre) {
        String genre = filtre.substring(0, filtre.indexOf('['));
        if (!genre.equals("nwr") && !genre.equals(element.path("type").asString())) return false;
        JsonNode tags = element.path("tags");
        java.util.regex.Matcher condition = CONDITION.matcher(filtre);
        while (condition.find()) {
            JsonNode valeur = tags.path(condition.group(1));
            if (valeur.isMissingNode() || valeur.isNull()) return false;
            String attendu = condition.group(3);
            if ("=".equals(condition.group(2)) && !valeur.asString().equals(attendu)) return false;
            if ("~".equals(condition.group(2))
                    && !EXPRESSIONS.computeIfAbsent(attendu, java.util.regex.Pattern::compile).matcher(valeur.asString()).find()) {
                return false;
            }
        }
        return true;
    }

    private JsonNode overpass(List<String> filtres, double[] zone) throws IOException, InterruptedException {
        String cadre = String.format(Locale.ROOT, "[bbox:%.2f,%.2f,%.2f,%.2f]", zone[0], zone[1], zone[2], zone[3]);
        StringBuilder requete = new StringBuilder("[out:json][timeout:180]" + cadre
                + ";area[\"ISO3166-1\"=\"FR\"][admin_level=2]->.fr;(");
        filtres.forEach((f) -> requete.append(f).append("(area.fr);"));
        requete.append(");out center tags;");
        String corps = "data=" + URLEncoder.encode(requete.toString(), StandardCharsets.UTF_8);

        // Serveur occupé : on réessaie sur l'autre, en attendant un peu plus à chaque fois (20 s, 40 s, 60 s…)
        IOException derniere = null;
        for (int essai = 0; essai < ESSAIS; essai++) {
            try {
                return envoyer(HttpRequest.newBuilder(URI.create(OVERPASS.get(essai < ESSAIS - 1 ? 0 : 1)))
                        .timeout(Duration.ofMinutes(4))
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
