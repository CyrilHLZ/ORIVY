package fr.orivy.Orivy.Securite;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/*
 * Fabrique le cookie qui transporte le jeton de connexion.
 * HttpOnly : invisible pour le JavaScript (une XSS ne peut pas le voler).
 * SameSite=Strict : jamais envoyé depuis un autre site (protège du CSRF).
 * Secure : envoyé seulement en HTTPS (vrai en prod, faux en dev http → orivy.cookie-secure).
 */
@Component
public class CookieJeton {

    public static final String NOM = "orivy_jeton";

    private final boolean secure;
    private final long dureeSecondes;

    public CookieJeton(@Value("${orivy.cookie-secure:false}") boolean secure,
                       @Value("${orivy.jwt.duree-heures}") long dureeHeures) {
        this.secure = secure;
        this.dureeSecondes = dureeHeures * 3600;
    }

    public ResponseCookie creer(String jeton) {
        return base(jeton).maxAge(dureeSecondes).build();
    }

    public ResponseCookie effacer() {
        return base("").maxAge(0).build();   // maxAge=0 : le navigateur supprime le cookie
    }

    private ResponseCookie.ResponseCookieBuilder base(String valeur) {
        return ResponseCookie.from(NOM, valeur)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path("/");
    }
}
