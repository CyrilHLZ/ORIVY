package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class UtilisateurService {

    private static final String ROLE_UTILISATEUR = "utilisateur";
    private static final String ROLE_ADMIN = "admin";

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
}
