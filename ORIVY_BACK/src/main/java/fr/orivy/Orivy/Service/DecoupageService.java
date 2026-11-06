package fr.orivy.Orivy.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

/*
 * Découpage de la France en régions et départements, pour la carte.
 * Contours : IGN Admin Express (Licence Ouverte), via france-geojson, simplifiés à ~100 m
 * (fichier resources/geo/departements.geojson ; le front a sa propre copie, plus légère, dans public/geo).
 * Chaque lieu reçoit le code de son département : la carte ne charge ensuite que le département choisi.
 */
@Service
public class DecoupageService {

    private static final Logger log = LoggerFactory.getLogger(DecoupageService.class);

    // Code INSEE de région → nom (13 régions de métropole + 5 d'outre-mer)
    public static final Map<String, String> REGIONS = new LinkedHashMap<>();
    static {
        REGIONS.put("84", "Auvergne-Rhône-Alpes");
        REGIONS.put("27", "Bourgogne-Franche-Comté");
        REGIONS.put("53", "Bretagne");
        REGIONS.put("24", "Centre-Val de Loire");
        REGIONS.put("94", "Corse");
        REGIONS.put("44", "Grand Est");
        REGIONS.put("32", "Hauts-de-France");
        REGIONS.put("11", "Île-de-France");
        REGIONS.put("28", "Normandie");
        REGIONS.put("75", "Nouvelle-Aquitaine");
        REGIONS.put("76", "Occitanie");
        REGIONS.put("52", "Pays de la Loire");
        REGIONS.put("93", "Provence-Alpes-Côte d'Azur");
        REGIONS.put("01", "Guadeloupe");
        REGIONS.put("02", "Martinique");
        REGIONS.put("03", "Guyane");
        REGIONS.put("04", "La Réunion");
        REGIONS.put("06", "Mayotte");
    }

    /* Un département : ses contours (anneaux [lon, lat]) et le rectangle qui l'entoure */
    public record Departement(String code, String nom, String region,
            List<List<double[][]>> polygones, double[] cadre) {
    }

    private final JdbcTemplate jdbc;
    private final List<Departement> departements = new ArrayList<>();

    public DecoupageService(JdbcTemplate jdbc) throws IOException {
        this.jdbc = jdbc;
        try (InputStream entree = new ClassPathResource("geo/departements.geojson").getInputStream()) {
            JsonNode geo = new ObjectMapper().readTree(entree);
            for (JsonNode f : geo.path("features")) {
                List<List<double[][]>> polygones = new ArrayList<>();
                double[] cadre = { 90, 180, -90, -180 };   // sud, ouest, nord, est
                for (JsonNode polygone : f.path("geometry").path("coordinates")) {
                    List<double[][]> anneaux = new ArrayList<>();
                    for (JsonNode anneau : polygone) {
                        double[][] points = new double[anneau.size()][];
                        for (int i = 0; i < anneau.size(); i++) {
                            double lon = anneau.get(i).get(0).asDouble(), lat = anneau.get(i).get(1).asDouble();
                            points[i] = new double[] { lon, lat };
                            cadre[0] = Math.min(cadre[0], lat); cadre[1] = Math.min(cadre[1], lon);
                            cadre[2] = Math.max(cadre[2], lat); cadre[3] = Math.max(cadre[3], lon);
                        }
                        anneaux.add(points);
                    }
                    polygones.add(anneaux);
                }
                JsonNode p = f.path("properties");
                departements.add(new Departement(p.path("code").asString(), p.path("nom").asString(),
                        p.path("region").asString(), polygones, cadre));
            }
        }
    }

    public List<Departement> departements() { return departements; }

    /* Code du département qui contient ce point ; à défaut (plage, îlot, contour simplifié), le plus proche
       à moins de ~30 km ; null si le point est loin de tout (hors de France) */
    public String departementDe(double lat, double lon) {
        for (Departement d : departements) {
            if (dansCadre(d.cadre(), lat, lon, 0) && contient(d, lat, lon)) return d.code();
        }
        String proche = null;
        double meilleure = 0.3;   // en degrés
        for (Departement d : departements) {
            if (!dansCadre(d.cadre(), lat, lon, meilleure)) continue;
            for (List<double[][]> polygone : d.polygones()) {
                double distance = distanceAuBord(polygone.get(0), lon, lat);
                if (distance < meilleure) { meilleure = distance; proche = d.code(); }
            }
        }
        return proche;
    }

    /* Au démarrage : les lieux sans département (saisis avant V19, ou par l'admin) en reçoivent un */
    @EventListener(ApplicationReadyEvent.class)
    public void rattacherLesLieux() {
        List<Object[]> modifs = new ArrayList<>();
        jdbc.query("SELECT id, latitude, longitude FROM point_interet WHERE departement IS NULL AND latitude IS NOT NULL",
                (ligne) -> {
                    String code = departementDe(ligne.getDouble("latitude"), ligne.getDouble("longitude"));
                    if (code != null) modifs.add(new Object[] { code, ligne.getLong("id") });
                });
        if (modifs.isEmpty()) return;
        jdbc.batchUpdate("UPDATE point_interet SET departement = ? WHERE id = ?", modifs);
        log.info("Carte : {} lieux rattachés à leur département", modifs.size());
    }

    private static boolean dansCadre(double[] cadre, double lat, double lon, double marge) {
        return lat >= cadre[0] - marge && lat <= cadre[2] + marge && lon >= cadre[1] - marge && lon <= cadre[3] + marge;
    }

    // Dans le contour extérieur d'un des morceaux, et pas dans un de ses trous
    private static boolean contient(Departement d, double lat, double lon) {
        for (List<double[][]> polygone : d.polygones()) {
            if (!dansAnneau(polygone.get(0), lon, lat)) continue;
            boolean dansUnTrou = false;
            for (int i = 1; i < polygone.size() && !dansUnTrou; i++) dansUnTrou = dansAnneau(polygone.get(i), lon, lat);
            if (!dansUnTrou) return true;
        }
        return false;
    }

    // Lancer de rayon : on compte les bords traversés par une demi-droite partant du point
    private static boolean dansAnneau(double[][] anneau, double x, double y) {
        boolean dedans = false;
        for (int i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
            double xi = anneau[i][0], yi = anneau[i][1], xj = anneau[j][0], yj = anneau[j][1];
            if ((yi > y) != (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) dedans = !dedans;
        }
        return dedans;
    }

    private static double distanceAuBord(double[][] anneau, double x, double y) {
        double min = Double.MAX_VALUE;
        for (int i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
            double x1 = anneau[j][0], y1 = anneau[j][1], dx = anneau[i][0] - x1, dy = anneau[i][1] - y1;
            double longueur = dx * dx + dy * dy;
            double t = longueur == 0 ? 0 : Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / longueur));
            min = Math.min(min, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
        }
        return min;
    }
}
