package fr.orivy.Orivy.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class UtilisateurService {

    private static final String ROLE_UTILISATEUR = "utilisateur";
    private static final String ROLE_ADMIN = "admin";
    private static final List<String> TYPES_IMAGES = List.of("image/jpeg", "image/png", "image/webp");

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Utilisateur creerUtilisateur(Utilisateur utilisateur) {
        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un compte existe déjà avec cet email.");
        }
        validerMotDePasse(utilisateur.getMotDePasse());
        
        utilisateur.setRole(ROLE_UTILISATEUR);
        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));
        return utilisateurRepository.save(utilisateur);
    }

    public Utilisateur authentifierUtilisateur(String email, String motDePasse) {
        // Même message dans les deux cas : on ne révèle pas si l'email existe
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect."));

        if (motDePasse == null || !passwordEncoder.matches(motDePasse, utilisateur.getMotDePasse())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect.");
        }
        return utilisateur;
    }

    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur getUtilisateur(Long id) {
        return trouverUtilisateur(id);
    }

    public Utilisateur modifierUtilisateur(Long id, Utilisateur utilisateur) {
        Utilisateur utilisateurExistant = trouverUtilisateur(id);
        // Email, mot de passe et rôle ne se modifient pas par ce formulaire
        utilisateurExistant.setNom(utilisateur.getNom());
        utilisateurExistant.setPrenom(utilisateur.getPrenom());
        utilisateurExistant.setDateDeNaissance(utilisateur.getDateDeNaissance());
        utilisateurExistant.setNumeroTelephone(utilisateur.getNumeroTelephone());
        utilisateurExistant.setAdresse(utilisateur.getAdresse());
        utilisateurExistant.setVille(utilisateur.getVille());
        utilisateurExistant.setCodePostal(utilisateur.getCodePostal());
        utilisateurExistant.setPays(utilisateur.getPays());
        utilisateurExistant.setBio(utilisateur.getBio());
        return utilisateurRepository.save(utilisateurExistant);
    }

    public void supprimerUtilisateur(Long id) {
        Utilisateur utilisateur = trouverUtilisateur(id);
        if (ROLE_ADMIN.equalsIgnoreCase(utilisateur.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Impossible de supprimer un administrateur.");
        }
        utilisateurRepository.delete(utilisateur);
    }

    private Utilisateur trouverUtilisateur(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable."));
    }

    private void validerMotDePasse(String motDePasse) {
        if (motDePasse == null || motDePasse.length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe doit contenir au moins 8 caractères.");
        } else if (!motDePasse.matches(".*[A-Z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe doit contenir au moins une lettre majuscule.");
        } else if (!motDePasse.matches(".*[a-z].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe doit contenir au moins une lettre minuscule.");
        } else if (!motDePasse.matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe doit contenir au moins un chiffre.");
        } else if (!motDePasse.matches(".*[!@#$%^&*()].*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()).");
        }
    }

    public void changerMotDePasse(Long id, String ancien, String nouveau) {
        Utilisateur utilisateur = trouverUtilisateur(id);
        verifierMotDePasseActuel(utilisateur, ancien);
        validerMotDePasse(nouveau);   // mêmes règles qu'à l'inscription
        utilisateur.setMotDePasse(passwordEncoder.encode(nouveau));
        utilisateurRepository.save(utilisateur);
    }

    public Utilisateur changerEmail(Long id, String motDePasse, String nouvelEmail) {
        Utilisateur utilisateur = trouverUtilisateur(id);
        verifierMotDePasseActuel(utilisateur, motDePasse);
        if (utilisateurRepository.findByEmail(nouvelEmail).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email.");
        }
        utilisateur.setEmail(nouvelEmail);
        return utilisateurRepository.save(utilisateur);
    }

    private void verifierMotDePasseActuel(Utilisateur utilisateur, String motDePasse) {
        if (motDePasse == null || !passwordEncoder.matches(motDePasse, utilisateur.getMotDePasse())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mot de passe actuel incorrect.");
        }
    }

    public Utilisateur changerPhoto(Long id, MultipartFile fichier, String dossier) throws IOException {
        if (fichier.isEmpty() || !TYPES_IMAGES.contains(fichier.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choisis une image JPEG, PNG ou WebP.");
        }
        Utilisateur utilisateur = trouverUtilisateur(id);

        // Nom de fichier inventé par le back : on n'utilise JAMAIS le nom envoyé par le navigateur
        String extension = fichier.getContentType().substring("image/".length()).replace("jpeg", "jpg");
        String nom = "avatar-" + id + "-" + UUID.randomUUID() + "." + extension;

        Path cible = Path.of(dossier, "avatars").toAbsolutePath();
        Files.createDirectories(cible);
        fichier.transferTo(cible.resolve(nom));

        utilisateur.setPhotoUrl("/api/fichiers/avatars/" + nom);
        return utilisateurRepository.save(utilisateur);
    }
}
