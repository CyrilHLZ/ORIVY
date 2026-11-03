package fr.orivy.Orivy.Service;

import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVRecord;

import fr.orivy.Orivy.Model.PointInteret;

/*
 * Outils partagés par les imports de lieux du ministère de la Culture
 * (MonumentsHistoriquesService, MuseesDeFranceService) : mêmes fichiers CSV, mêmes photos Wikidata.
 */
final class OutilsImport {

    // Les CSV du ministère : séparés par des « | », 1re ligne = noms des colonnes
    static final CSVFormat CSV_MINISTERE = CSVFormat.DEFAULT.builder()
            .setDelimiter('|').setHeader().setSkipHeaderRecord(true).get();

    private OutilsImport() {
    }

    /* Télécharge un fichier dans un fichier temporaire (à supprimer après usage) */
    static Path telecharger(String url) throws IOException, InterruptedException {
        Path fichier = Files.createTempFile("orivy-import", ".csv");
        HttpResponse<Path> reponse = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create(url)).build(), HttpResponse.BodyHandlers.ofFile(fichier));
        if (reponse.statusCode() != 200) {
            fichier.toFile().delete();
            throw new IOException(url + " répond " + reponse.statusCode());
        }
        return fichier;
    }

    /*
     * Photos de Wikimedia Commons, par identifiant du ministère :
     * propriete = la propriété Wikidata qui porte cet identifiant (P380 Mérimée, P539 Muséofile).
     *   « PA00079071 » → « https://commons.wikimedia.org/wiki/Special:FilePath/Croix.jpg?width=800 »
     */
    static Map<String, String> photosWikidata(String propriete) throws IOException, InterruptedException {
        // Chaque élément qui a cet identifiant ET une photo (propriété P18)
        String requete = "SELECT ?id ?image WHERE { ?item wdt:" + propriete + " ?id ; wdt:P18 ?image . }";
        HttpResponse<String> reponse = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder(URI.create("https://query.wikidata.org/sparql?query="
                                + URLEncoder.encode(requete, StandardCharsets.UTF_8)))
                        .header("Accept", "text/csv")
                        .header("User-Agent", "Orivy/1.0 (import des lieux du ministère de la Culture)")   // Wikidata refuse les requêtes anonymes
                        .build(),
                HttpResponse.BodyHandlers.ofString());
        if (reponse.statusCode() != 200) throw new IOException("Wikidata répond " + reponse.statusCode());

        Map<String, String> photos = new HashMap<>();
        CSVFormat format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).get();
        for (CSVRecord ligne : format.parse(new StringReader(reponse.body()))) {
            // width=800 : Wikimedia envoie une image réduite, pas l'original de plusieurs Mo
            photos.putIfAbsent(ligne.get("id"), ligne.get("image").replace("http://", "https://") + "?width=800");
        }
        return photos;
    }

    /* Pose sur chaque lieu la photo trouvée pour son identifiant ; renvoie ceux qui ont changé (à enregistrer) */
    static List<PointInteret> poserPhotos(List<PointInteret> points, Map<String, String> photos) {
        List<PointInteret> modifies = new ArrayList<>();
        for (PointInteret point : points) {
            if (point.isPhotoChoisie()) continue;   // l'admin a choisi (ou retiré) la photo : on n'y touche plus
            String photo = photos.get(point.getIdExterne());
            if (photo == null || photo.equals(point.getImageUrl())) continue;
            point.setImageUrl(photo);
            point.setImageSource("Wikimedia Commons");
            point.setImageLicence("Licence indiquée sur la page du fichier, sur Wikimedia Commons");
            modifies.add(point);
        }
        return modifies;
    }

    /* « 47.7549744748852,5.391298942916 » → { latitude, longitude } */
    static double[] coordonnees(String texte) {
        String[] parties = texte.split(",");
        if (parties.length != 2) return null;
        try {
            return new double[] { Double.parseDouble(parties[0].trim()), Double.parseDouble(parties[1].trim()) };
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static String premierRempli(String... valeurs) {
        for (String v : valeurs) if (v != null && !v.isBlank()) return v.trim();
        return null;
    }

    static String couper(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max - 1) + "…";
    }
}
