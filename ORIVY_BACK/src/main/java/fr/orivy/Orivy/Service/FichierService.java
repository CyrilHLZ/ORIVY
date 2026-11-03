package fr.orivy.Orivy.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class FichierService {

    private static final List<String> TYPES_IMAGES = List.of("image/jpeg", "image/png", "image/webp");
    private static final List<String> TYPES_VIDEOS = List.of("video/mp4", "video/webm", "video/quicktime");
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", "jpg", "image/png", "png", "image/webp", "webp",
            "video/mp4", "mp4", "video/webm", "webm", "video/quicktime", "mov");
    private static final long MAX_IMAGE = 2L * 1024 * 1024;    // 2 Mo
    private static final long MAX_VIDEO = 50L * 1024 * 1024;   // 50 Mo : environ 1 minute en 720p

    @Value("${orivy.dossier-uploads}")
    private String dossierUploads;

    // Photo seulement (ex. photo de profil)
    public String enregistrerImage(MultipartFile fichier, String sousDossier, String prefixe) throws IOException {
        return enregistrer(fichier, sousDossier, prefixe, false);
    }

    // Photo OU petite vidéo (ex. sortie, publication du fil)
    public String enregistrerMedia(MultipartFile fichier, String sousDossier, String prefixe) throws IOException {
        return enregistrer(fichier, sousDossier, prefixe, true);
    }

    private String enregistrer(MultipartFile fichier, String sousDossier, String prefixe, boolean videoAutorisee) throws IOException {
        String type = fichier.getContentType();
        boolean image = TYPES_IMAGES.contains(type);
        boolean video = videoAutorisee && TYPES_VIDEOS.contains(type);

        if (fichier.isEmpty() || (!image && !video)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, videoAutorisee
                    ? "Choisis une photo (JPEG, PNG, WebP) ou une vidéo (MP4, WebM, MOV)."
                    : "Choisis une image JPEG, PNG ou WebP.");
        }
        if (image && fichier.getSize() > MAX_IMAGE) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "La photo ne doit pas dépasser 2 Mo.");
        }
        if (video && fichier.getSize() > MAX_VIDEO) {
            throw new ResponseStatusException(HttpStatus.CONTENT_TOO_LARGE, "La vidéo ne doit pas dépasser 50 Mo (1 minute en 720p).");
        }
        if (!signatureValide(fichier, type)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ce fichier n'est pas une vraie image ou vidéo.");
        }

        // Nom inventé par le back : on n'utilise JAMAIS le nom envoyé par le navigateur
        String nom = prefixe + "-" + UUID.randomUUID() + "." + EXTENSIONS.get(type);
        Path cible = Path.of(dossierUploads, sousDossier).toAbsolutePath();
        Files.createDirectories(cible);
        fichier.transferTo(cible.resolve(nom));
        return "/api/fichiers/" + sousDossier + "/" + nom;
    }

    private static boolean signatureValide(MultipartFile fichier, String type) throws IOException {
        byte[] tete = new byte[16];
        try (InputStream in = fichier.getInputStream()) {
            tete = Arrays.copyOf(tete, in.readNBytes(tete, 0, tete.length));
        }
        return switch (type) {
            case "image/jpeg"     -> octets(tete, 0, 0xFF, 0xD8, 0xFF);                                   // JPEG
            case "image/png"      -> octets(tete, 0, 0x89, 0x50, 0x4E, 0x47);                             // .PNG
            case "image/webp"     -> octets(tete, 0, 0x52, 0x49, 0x46, 0x46) && octets(tete, 8, 0x57, 0x45, 0x42, 0x50); // RIFF…WEBP
            case "video/mp4",
                 "video/quicktime" -> octets(tete, 4, 0x66, 0x74, 0x79, 0x70);                            // ….ftyp (MP4 et MOV)
            case "video/webm"     -> octets(tete, 0, 0x1A, 0x45, 0xDF, 0xA3);                             // EBML (Matroska/WebM)
            default               -> false;
        };
    }

    private static boolean octets(byte[] tete, int debut, int... attendus) {
        if (tete.length < debut + attendus.length) return false;
        for (int i = 0; i < attendus.length; i++) {
            if ((tete[debut + i] & 0xFF) != attendus[i]) return false;
        }
        return true;
    }

}

