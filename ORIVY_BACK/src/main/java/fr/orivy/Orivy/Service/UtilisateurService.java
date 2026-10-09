package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

@Service
public class UtilisateurService{

    private final UtilisateurRepository utilisateurRepository;

    public UtilisateurService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }
    

    public String creerUtilisateur(Utilisateur utilisateur) {
        if (utilisateurRepository.getUtilisateur(utilisateur.getEmail()) != null) {
            return "L'utilisateur avec cet email existe déjà.";
        } else if (utilisateur.getMotDePasse().length() < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères.";
        } else if (!utilisateur.getMotDePasse().matches(".*[A-Z].*")) {
            return "Le mot de passe doit contenir au moins une lettre majuscule.";
        } else if (!utilisateur.getMotDePasse().matches(".*[a-z].*")) {
            return "Le mot de passe doit contenir au moins une lettre minuscule.";
        } else if (!utilisateur.getMotDePasse().matches(".*\\d.*")) {
            return "Le mot de passe doit contenir au moins un chiffre.";
        } else if (!utilisateur.getMotDePasse().matches(".*[!@#$%^&*()].*")) {
            return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()).";
        } else {
            return utilisateurRepository.creerUtilisateur(utilisateur);
        }
    }

    public String modifierUtilisateur(Utilisateur utilisateur) {
        if (utilisateurRepository.getUtilisateur(utilisateur.getEmail()) == null) {
            return "L'utilisateur avec cet email n'existe pas.";
        } else if (utilisateur.getMotDePasse().length() < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères.";
        } else if (!utilisateur.getMotDePasse().matches(".*[A-Z].*")) {
            return "Le mot de passe doit contenir au moins une lettre majuscule.";
        } else if (!utilisateur.getMotDePasse().matches(".*[a-z].*")) {
            return "Le mot de passe doit contenir au moins une lettre minuscule.";
        } else if (!utilisateur.getMotDePasse().matches(".*\\d.*")) {
            return "Le mot de passe doit contenir au moins un chiffre.";
        } else if (!utilisateur.getMotDePasse().matches(".*[!@#$%^&*()].*")) {
            return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()).";
        }
        return utilisateurRepository.modifierUtilisateur(utilisateur);
    }

    public String supprimerUtilisateur(String email) {
        if (utilisateurRepository.getUtilisateur(email) == null) {
            return "L'utilisateur avec cet email n'existe pas.";
        } else if (utilisateurRepository.getUtilisateur(email).getRole().equals("admin")) {
            return "Vous ne pouvez pas supprimer un utilisateur avec le rôle admin.";
        }
        return utilisateurRepository.supprimerUtilisateur(email);
    }

    public Utilisateur getUtilisateur(String email) {
        return utilisateurRepository.getUtilisateur(email);
    }

    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.getAllUtilisateurs();
    }

    public String authentifierUtilisateur(String email, String motDePasse) {
        if (utilisateurRepository.getUtilisateur(email) == null) {
            return "L'utilisateur avec cet email n'existe pas.";
        } else if (!utilisateurRepository.getUtilisateur(email).getMotDePasse().equals(motDePasse)) {
            return "Mot de passe incorrect.";
        }
        return utilisateurRepository.authentifierUtilisateur(email, motDePasse);
    }

    public String deconnecterUtilisateur(String email) {
        if (utilisateurRepository.getUtilisateur(email) == null) {
            return "L'utilisateur avec cet email n'existe pas.";
        } else if (!utilisateurRepository.getUtilisateur(email).isConnecte()) {
            return "L'utilisateur n'est pas connecté.";
        }
        return utilisateurRepository.deconnecterUtilisateur(email);
    }

    public String recupererMotDePasse(String email) {
        if (utilisateurRepository.getUtilisateur(email) == null) {
            return "L'utilisateur avec cet email n'existe pas.";
        } else if (!utilisateurRepository.getUtilisateur(email).isConnecte()) {
            return "L'utilisateur n'est pas connecté.";
        } else if (!utilisateurRepository.getUtilisateur(email).getRole().equals("admin")) {
            return "Seul un utilisateur avec le rôle admin peut récupérer le mot de passe.";
        } else if (utilisateurRepository.getUtilisateur(email).getMotDePasse() == null) {
            return "Le mot de passe n'a pas été défini pour cet utilisateur.";
        }
        return utilisateurRepository.recupererMotDePasse(email);
    }

    public String modifierMotDePasse(String email, String nouveauMotDePasse) {
        if (utilisateurRepository.getUtilisateur(email) == null) {
            return "L'utilisateur avec cet email n'existe pas.";
        } else if (nouveauMotDePasse.length() < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères.";
        } else if (!nouveauMotDePasse.matches(".*[A-Z].*")) {
            return "Le mot de passe doit contenir au moins une lettre majuscule.";
        } else if (!nouveauMotDePasse.matches(".*[a-z].*")) {
            return "Le mot de passe doit contenir au moins une lettre minuscule.";
        } else if (!nouveauMotDePasse.matches(".*\\d.*")) {
            return "Le mot de passe doit contenir au moins un chiffre.";
        } else if (!nouveauMotDePasse.matches(".*[!@#$%^&*()].*")) {
            return "Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*()).";
        }
        return utilisateurRepository.modifierMotDePasse(email, nouveauMotDePasse);
    }

    public String modifierRoleUtilisateur(String email, String nouveauRole) {
        if (utilisateurRepository.getUtilisateur(email) == null) {
            return "L'utilisateur avec cet email n'existe pas.";
        } else if (!nouveauRole.equals("admin") && !nouveauRole.equals("utilisateur")) {
            return "Le rôle doit être soit 'admin' soit 'utilisateur'.";
        } else if (utilisateurRepository.getUtilisateur(email).getRole().equals("admin") && nouveauRole.equals("utilisateur")) {
            return "Vous ne pouvez pas modifier le rôle d'un utilisateur avec le rôle admin.";
        } else if (utilisateurRepository.getUtilisateur(email).getRole().equals("utilisateur") && nouveauRole.equals("admin")) {
            return "Vous ne pouvez pas modifier le rôle d'un utilisateur avec le rôle utilisateur.";
        } else if (utilisateurRepository.getUtilisateur(email).getRole().equals(nouveauRole)) {
            return "L'utilisateur a déjà ce rôle.";
        } else if (utilisateurRepository.getUtilisateur(email).getRole().equals("admin") && utilisateurRepository.getAllUtilisateurs().stream().filter(u -> u.getRole().equals("admin")).count() == 1) {
            return "Vous ne pouvez pas modifier le rôle d'un utilisateur avec le rôle admin si c'est le seul admin.";
        }
        return utilisateurRepository.modifierRoleUtilisateur(email, nouveauRole);
    }
    

}
