package fr.orivy.Orivy.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LimiteurConnexion {

    private static final int MAX = 10;                               // échecs tolérés
    private static final Duration FENETRE = Duration.ofMinutes(15);  // au-delà, on oublie les vieux échecs
    private static final Duration BLOCAGE = Duration.ofMinutes(15);  // durée du blocage une fois MAX atteint

    private record Tentatives(int nombre, Instant dernier) {
    }

    private final Map<String, Tentatives> parEmail = new ConcurrentHashMap<>();

    // Avant de vérifier le mot de passe : refuse tout de suite si l'e-mail est bloqué
    public void verifier(String email) {
        Tentatives t = parEmail.get(email);
        if (t != null && t.nombre() >= MAX && Duration.between(t.dernier(), Instant.now()).compareTo(BLOCAGE) < 0) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Trop de tentatives. Réessaie dans quelques minutes.");
        }
    }

    // Mot de passe faux : on incrémente (en repartant de 1 si le dernier échec est trop ancien)
    public void echec(String email) {
        Instant maintenant = Instant.now();
        parEmail.merge(email, new Tentatives(1, maintenant), (ancien, neuf) -> {
            boolean tropVieux = Duration.between(ancien.dernier(), maintenant).compareTo(FENETRE) > 0;
            return new Tentatives(tropVieux ? 1 : ancien.nombre() + 1, maintenant);
        });
    }

    // Connexion réussie : on oublie les échecs de cet e-mail
    public void succes(String email) {
        parEmail.remove(email);
    }
}
