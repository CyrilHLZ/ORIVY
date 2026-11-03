package fr.orivy.Orivy.DataInitializer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import fr.orivy.Orivy.Model.Utilisateur;
import fr.orivy.Orivy.Repository.UtilisateurRepository;

/*
 * Au démarrage : crée le compte administrateur s'il n'existe pas encore.
 * Email et mot de passe viennent de ORIVY_BACK/.env (jamais dans le code ni dans git) :
 *     ORIVY_ADMIN_EMAIL=admin@orivy.fr
 *     ORIVY_ADMIN_MOT_DE_PASSE=…
 * Sans ces deux lignes, rien n'est créé. Si le compte existe déjà, on s'assure seulement
 * qu'il est bien admin (son mot de passe n'est jamais écrasé).
 */
@Component
public class CompteAdminInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CompteAdminInitializer.class);

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String motDePasse;

    public CompteAdminInitializer(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder,
                                  @Value("${orivy.admin.email:}") String email,
                                  @Value("${orivy.admin.mot-de-passe:}") String motDePasse) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email.trim();
        this.motDePasse = motDePasse;
    }

    @Override
    public void run(String... args) {
        if (email.isBlank() || motDePasse.isBlank()) {
            log.info("Pas de compte admin à créer (ORIVY_ADMIN_EMAIL / ORIVY_ADMIN_MOT_DE_PASSE absents de .env).");
            return;
        }
        utilisateurRepository.findByEmail(email).ifPresentOrElse(
                (existant) -> {
                    if (!"admin".equalsIgnoreCase(existant.getRole())) {
                        existant.setRole("admin");
                        utilisateurRepository.save(existant);
                        log.info("Un compte existant est promu administrateur.");
                    }
                },
                () -> {
                    Utilisateur admin = new Utilisateur();
                    admin.setPrenom("Admin");
                    admin.setNom("ORIVY");
                    admin.setEmail(email);
                    admin.setMotDePasse(passwordEncoder.encode(motDePasse));
                    admin.setRole("admin");
                    utilisateurRepository.save(admin);
                    log.info("Compte administrateur créé.");
                });
    }
}
