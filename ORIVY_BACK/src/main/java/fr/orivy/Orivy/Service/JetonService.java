package fr.orivy.Orivy.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import fr.orivy.Orivy.Model.Utilisateur;

@Service
public class JetonService {

    private final JwtEncoder jwtEncoder;
    private final long dureeHeures;

    public JetonService(JwtEncoder jwtEncoder,
                        @Value("${orivy.jwt.duree-heures}") long dureeHeures) {
        this.jwtEncoder = jwtEncoder;
        this.dureeHeures = dureeHeures;
    }

    public String generateToken(Utilisateur utilisateur) {
        Instant maintenant = Instant.now();

        // Le contenu du jeton : lisible par tous, donc ni email ni téléphone
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("orivy")
                .issuedAt(maintenant)
                .expiresAt(maintenant.plus(dureeHeures, ChronoUnit.HOURS))
                .subject(utilisateur.getId().toString())
                .claim("role", utilisateur.getRole())
                .build();

        JwsHeader entete = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder.encode(JwtEncoderParameters.from(entete, claims)).getTokenValue();
    }
}

