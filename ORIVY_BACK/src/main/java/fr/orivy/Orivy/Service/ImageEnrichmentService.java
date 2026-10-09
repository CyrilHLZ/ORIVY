package fr.orivy.Orivy.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import fr.orivy.Orivy.DTO.ImageResult;
import fr.orivy.Orivy.Model.PointInteret;
import tools.jackson.databind.JsonNode;

@Service
public class ImageEnrichmentService {

    private static final Logger log = LoggerFactory.getLogger(ImageEnrichmentService.class);

    private final WebClient commonsClient = WebClient.builder()
            .baseUrl("https://commons.wikimedia.org/w/api.php")
            .defaultHeader(HttpHeaders.USER_AGENT, "Orivy/1.0 (contact: vous@votredomaine.fr)")
            .build();

    private final WebClient wikipediaClient = WebClient.builder()
            .baseUrl("https://fr.wikipedia.org/w/api.php")
            .defaultHeader(HttpHeaders.USER_AGENT, "Orivy/1.0 (contact: vous@votredomaine.fr)")
            .build();

    private final WebClient openverseClient = WebClient.builder()
            .baseUrl("https://api.openverse.org/v1")
            .defaultHeader(HttpHeaders.USER_AGENT, "Orivy/1.0 (contact: vous@votredomaine.fr)")
            .build();

    private String cleanName(String name) {
        return name
                .replaceAll("(?i)\\s*[-–(]\\s*(vue|entrée|extérieur|intérieur|façade|panorama).*$", "")
                .replaceAll("\\s{2,}", " ")
                .trim();
    }

    private String stripHtml(String input) {
        if (input == null) return null;
        return input.replaceAll("<[^>]*>", "").trim();
    }

    private List<String> buildNameVariants(String rawName) {
        String cleaned = cleanName(rawName);
        List<String> variants = new ArrayList<>();
        variants.add(cleaned);

        String[] words = cleaned.split("\\s+");
        if (words.length > 3) {
            variants.add(String.join(" ", Arrays.copyOfRange(words, 0, 3)));
        }
        if (words.length > 2) {
            variants.add(String.join(" ", Arrays.copyOfRange(words, 0, 2)));
        }

        return variants.stream().distinct().toList();
    }

    public Optional<ImageResult> findImage(PointInteret point) {
        List<String> nameVariants = buildNameVariants(point.getNom());

        for (String candidate : nameVariants) {
            Optional<ImageResult> result = searchCommonsByName(candidate);
            if (result.isPresent()) return result;
        }

        Optional<ImageResult> geoResult = searchByGeolocation(point.getLatitude(), point.getLongitude(), point.getNom());
        if (geoResult.isPresent()) return geoResult;

        for (String candidate : nameVariants) {
            Optional<ImageResult> result = searchOpenverse(candidate);
            if (result.isPresent()) return result;
        }

        return Optional.empty();
    }

    private Optional<ImageResult> searchCommonsByName(String name) {
        try {
            JsonNode root = commonsClient.get()
                    .uri(uri -> uri.queryParam("action", "query")
                            .queryParam("list", "search")
                            .queryParam("srnamespace", "6")
                            .queryParam("srsearch", name)
                            .queryParam("srlimit", "1")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            JsonNode hits = root.path("query").path("search");
            if (!hits.isArray() || hits.isEmpty()) return Optional.empty();

            String fileTitle = hits.get(0).path("title").asText();
            return fetchImageInfo(fileTitle, commonsClient);
        } catch (Exception e) {
            log.warn("Recherche Commons échouée pour '{}': {}", name, e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<ImageResult> searchByGeolocation(double lat, double lon, String pointName) {
        try {
            JsonNode root = wikipediaClient.get()
                    .uri(uri -> uri.queryParam("action", "query")
                            .queryParam("list", "geosearch")
                            .queryParam("gscoord", lat + "|" + lon)
                            .queryParam("gsradius", "1000")
                            .queryParam("gslimit", "1")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            JsonNode hits = root.path("query").path("geosearch");
            if (!hits.isArray() || hits.isEmpty()) return Optional.empty();

            String pageTitle = hits.get(0).path("title").asText();

            JsonNode imgRoot = wikipediaClient.get()
                    .uri(uri -> uri.queryParam("action", "query")
                            .queryParam("titles", pageTitle)
                            .queryParam("prop", "pageimages")
                            .queryParam("piprop", "name")
                            .queryParam("format", "json")   
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            JsonNode pages = imgRoot.path("query").path("pages");
            String fileName = pages.values().iterator().next().path("pageimage").asText(null);
            if (fileName == null) return Optional.empty();

            return fetchImageInfo("File:" + fileName, commonsClient);
        } catch (Exception e) {
            log.warn("Geosearch échouée pour '{}': {}", pointName, e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<ImageResult> fetchImageInfo(String fileTitle, WebClient client) {
        try {
            JsonNode root = client.get()
                    .uri(uri -> uri.queryParam("action", "query")
                            .queryParam("titles", fileTitle)
                            .queryParam("prop", "imageinfo")
                            .queryParam("iiprop", "url|extmetadata")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            JsonNode pages = root.path("query").path("pages");
            JsonNode page = pages.values().iterator().next();
            JsonNode info = page.path("imageinfo").get(0);
            if (info == null) return Optional.empty();

            String url = info.path("url").asText();
            JsonNode meta = info.path("extmetadata");
            String license = stripHtml(meta.path("LicenseShortName").path("value").asText("Licence non spécifiée"));
            String artist = stripHtml(meta.path("Artist").path("value").asText("Auteur non spécifié"));

            return Optional.of(new ImageResult(url, license, artist, fileTitle));
        } catch (Exception e) {
            log.warn("Récupération imageinfo échouée pour '{}': {}", fileTitle, e.getMessage());
            return Optional.empty();
        }
    }

    private Optional<ImageResult> searchOpenverse(String name) {
        try {
            JsonNode root = openverseClient.get()
                    .uri(uri -> uri.path("/images/")
                            .queryParam("q", name)
                            .queryParam("license_type", "commercial,modification")
                            .queryParam("page_size", "1")
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            JsonNode results = root.path("results");
            if (!results.isArray() || results.isEmpty()) return Optional.empty();

            JsonNode first = results.get(0);
            String url = first.path("url").asText(null);
            if (url == null) return Optional.empty();

            String license = first.path("license").asText("").toUpperCase()
                    + " " + first.path("license_version").asText("");
            String creator = first.path("creator").asText("Auteur non spécifié");
            String source = first.path("foreign_landing_url").asText(url);

            return Optional.of(new ImageResult(url, license.trim(), creator, source));
        } catch (Exception e) {
            log.warn("Recherche Openverse échouée pour '{}': {}", name, e.getMessage());
            return Optional.empty();
        }
    }
}