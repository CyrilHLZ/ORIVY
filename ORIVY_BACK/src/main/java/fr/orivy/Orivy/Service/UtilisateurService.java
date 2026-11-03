package fr.orivy.Orivy.Service;

import java.io.IOException;
import java.util.List;

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

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final FichierService fichierService;
    private final LimiteurConnexion limiteur;

    public UtilisateurService(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder,
                              FichierService fichierService, LimiteurConnexion limiteur) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.fichierService = fichierService;
        this.limiteur = limiteur;
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
        String cle = email == null ? "" : email.trim().toLowerCase();
        limiteur.verifier(cle);   // 429 si cet e-mail a trop échoué récemment

        // Même message si l'e-mail n'existe pas ou si le mot de passe est faux : on ne révèle rien
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email).orElse(null);
        if (utilisateur == null || motDePasse == null || !passwordEncoder.matches(motDePasse, utilisateur.getMotDePasse())) {
            limiteur.echec(cle);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou mot de passe incorrect.");
        }
        limiteur.succes(cle);
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

    public Utilisateur changerPhoto(Long id, MultipartFile fichier) throws IOException {
        Utilisateur utilisateur = trouverUtilisateur(id);
        utilisateur.setPhotoUrl(fichierService.enregistrerImage(fichier, "avatars", "avatar-" + id));
        return utilisateurRepository.save(utilisateur);
    }
}
