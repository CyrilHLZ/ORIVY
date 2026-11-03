package fr.orivy.Orivy.Securite;

import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

/*
 * Où Spring trouve le jeton : dans le cookie HttpOnly « orivy_jeton »,
 * au lieu de l'en-tête « Authorization: Bearer … » (que le front n'envoie plus).
 */
public class CookieBearerTokenResolver implements BearerTokenResolver {

    @Override
    public String resolve(HttpServletRequest requete) {
        if (requete.getCookies() == null) return null;
        for (Cookie cookie : requete.getCookies()) {
            if (CookieJeton.NOM.equals(cookie.getName()) && !cookie.getValue().isBlank()) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
