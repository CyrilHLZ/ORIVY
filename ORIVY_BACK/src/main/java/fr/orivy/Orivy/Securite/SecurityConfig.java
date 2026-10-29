package fr.orivy.Orivy.Securite;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain apiSecurity(HttpSecurity http) throws Exception {
        return http
                // Pas de cookie de session : le jeton suffit, donc pas de risque CSRF
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Reprend les règles CORS de WebConfig
                .cors(Customizer.withDefaults())
                // La console H2 s'affiche dans un <iframe>
                .headers(h -> h.frameOptions(f -> f.sameOrigin()))
                .authorizeHttpRequests(auth -> auth
                        // Public
                        .requestMatchers("/error", "/h2-console/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/utilisateurs/inscription", "/api/utilisateurs/connexion").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/carte", "/api/points-interet/**", "/api/activites/**",
                                "/api/promenades/**", "/api/sorties/**", "/api/notes", "/api/*/*/commentaires", "/api/fichiers/**").permitAll()
                        // Admin
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        // Se désabonner : tout membre connecté (AVANT la règle admin, la 1re qui correspond gagne)
                        .requestMatchers(HttpMethod.DELETE, "/api/utilisateurs/*/abonnement").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/utilisateurs/**").hasRole("ADMIN")
                        .requestMatchers("/api/points-interet/**", "/api/activites/**", "/api/promenades/**").hasRole("ADMIN")
                        // Tout le reste : il faut être connecté
                        .anyRequest().authenticated())
                // Lit l'en-tête « Authorization: Bearer … » et vérifie le jeton
                .oauth2ResourceServer(o -> o.jwt(jwt -> jwt.jwtAuthenticationConverter(convertisseurRoles())))
                .build();
    }

    // "role": "admin" dans le jeton  →  droit ROLE_ADMIN pour Spring
    private JwtAuthenticationConverter convertisseurRoles() {
        JwtAuthenticationConverter convertisseur = new JwtAuthenticationConverter();
        convertisseur.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            return role == null
                    ? List.of()
                    : List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
        });
        return convertisseur;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
