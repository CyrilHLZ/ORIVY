package fr.orivy.Orivy.DataInitializer;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.Locale;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.xml.parsers.DocumentBuilderFactory;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import fr.orivy.Orivy.Model.PointInteret;
import fr.orivy.Orivy.Repository.PointInteretRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private final PointInteretRepository pointRepository;

    public DataInitializer(PointInteretRepository pointRepository) {
        this.pointRepository = pointRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (pointRepository.count() > 700) {
            pointRepository.findAll().forEach(point -> {
                if (point.getCouleur() == null) point.setCouleur(colorFor(point.getType()));
                if (point.getImageUrl() == null || point.getImageUrl().contains("Chateau_de_Chambord_2015")
                    || point.getImageUrl().contains("Palace_of_Versailles_2015")
                    || point.getImageUrl().contains("Louvre-Lens_-_B%C3%A2timent")
                    || point.getImageUrl().contains("Louvre-Lens.jpg")
                    || point.getImageUrl().contains("Gorges_du_Verdon_3")
                    || point.getImageUrl().contains("Gorges_du_Verdon_depuis")
                    || point.getImageUrl().contains("Vulcania_au_pied_du_Puy_de_Dome")
                    || point.getImageUrl().contains("Vulcania%2C_vue_du_parc")) {
                    String image = imageFor(point.getNom());
                    point.setImageUrl(image);
                    if (image != null) {
                        point.setImageSource("Wikimedia Commons");
                        point.setImageLicence("Licence indiquee sur la fiche Wikimedia Commons");
                    }
                }
            });
            pointRepository.flush();
            return;
        }
        pointRepository.deleteAllInBatch();
        importKmz(pointRepository);
    }

    private static void importKmz(PointInteretRepository pointRepository) throws Exception {
        try (InputStream resource = DataInitializer.class.getResourceAsStream("/loisirs-parcs-musees.kmz")) {
            if (resource == null) throw new IOException("Ressource KMZ introuvable");
            try (ZipInputStream zip = new ZipInputStream(resource)) {
                ZipEntry entry;
                while ((entry = zip.getNextEntry()) != null) {
                    if ("doc.kml".equals(entry.getName())) {
                        importKml(zip, pointRepository);
                        return;
                    }
                }
            }
        }
        throw new IOException("doc.kml introuvable dans le KMZ");
    }

    private static void importKml(InputStream kml, PointInteretRepository pointRepository) throws Exception {
        var factory = DocumentBuilderFactory.newInstance();
        factory.setNamespaceAware(true);
        var document = factory.newDocumentBuilder().parse(kml);
        NodeList placemarks = document.getElementsByTagNameNS("*", "Placemark");
        for (int index = 0; index < placemarks.getLength(); index++) {
            Element placemark = (Element) placemarks.item(index);
            String name = text(placemark, "name").trim();
            String[] coordinates = text(placemark, "coordinates").trim().split(",");
            if (name.isBlank() || coordinates.length < 2) continue;
            PointInteret point = new PointInteret();
            point.setNom(name);
            point.setType(categoryFor(name));
            point.setDescription("Repère importé depuis la carte personnelle ORIVY.");
            point.setCouleur(colorFor(categoryFor(name)));
            String image = imageFor(name);
            point.setImageUrl(image);
            if (image != null) {
                point.setImageSource("Wikimedia Commons");
                point.setImageLicence("Licence indiquee sur la fiche Wikimedia Commons");
            }
            point.setLongitude(Double.parseDouble(coordinates[0].trim()));
            point.setLatitude(Double.parseDouble(coordinates[1].trim()));
            pointRepository.save(point);
        }
    }

    private static String text(Element parent, String localName) {
        NodeList nodes = parent.getElementsByTagNameNS("*", localName);
        return nodes.getLength() == 0 ? "" : nodes.item(0).getTextContent();
    }

    private static String categoryFor(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        if (normalized.matches(".*(musee|museum|cinema|theatre|opera|concert|festival).*")) return "culture";
        if (normalized.matches(".*(restaurant|brasserie|bistro|bar|cafe|marche|hall).*")) return "restaurant";
        if (normalized.matches(".*(parc|jardin|foret|bois|lac|plage|cascade|grotte|nature).*")) return "parc";
        if (normalized.matches(".*(observatoire|belvedere|point de vue|panorama).*")) return "observatoire";
        if (normalized.matches(".*(village|bourg|cite).*")) return "village";
        if (normalized.matches(".*(randonnee|sentier|promenade|balade|circuit|voie verte).*")) return "promenade";
        if (normalized.matches(".*(chateau|eglise|abbaye|fort|monument|patrimoine).*")) return "monument";
        return "autre";
    }

    private static String colorFor(String category) {
        return switch (category) {
            case "parc", "village" -> "#7FAF8A";
            case "culture", "monument" -> "#D98E73";
            case "promenade", "observatoire" -> "#5D8F9A";
            case "restaurant" -> "#D9A441";
            default -> "#6B7280";
        };
    }

    private static String imageFor(String name) {
        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(Locale.ROOT);
        if (normalized.contains("tour eiffel")) return commons("Eiffel_Tower_Paris.jpg");
        if (normalized.contains("chateau de chambord")) return commons("Chambord_Castle_Northwest_facade.jpg");
        if (normalized.contains("chateau de versailles") || normalized.contains("parc de versailles")) return commons("Versailles_Palace.jpg");
        if (normalized.contains("cite de carcassonne")) return commons("Carcassonne_03.jpg");
        if (normalized.contains("louvre-lens") || normalized.contains("louvre lens")) return commons("Parc_du_Louvre-Lens_%28bassin%29.jpg");
        if (normalized.contains("calanques")) return commons("Calanque_d%27En-Vau.jpg");
        if (normalized.contains("gorges du verdon")) return commons("Gorges_du_Verdon_depuis_le_belv%C3%A9d%C3%A8re_du_Tilleul.jpg");
        if (normalized.contains("vulcania")) return commons("Vulcania_Fissure_2002.jpg");
        return null;
    }

    private static String commons(String fileName) {
        return "https://commons.wikimedia.org/wiki/Special:FilePath/" + fileName;
    }
}
