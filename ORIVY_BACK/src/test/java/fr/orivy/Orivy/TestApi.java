package fr.orivy.Orivy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.jayway.jsonpath.JsonPath;

import fr.orivy.Orivy.Securite.CookieJeton;
import jakarta.servlet.http.Cookie;
import org.springframework.mock.web.MockHttpServletResponse;

/*
 * Base des tests de l'API : démarre ORIVY en entier (profil "test", base H2 en mémoire)
 * et offre des raccourcis pour créer des membres et des sorties.
 * MockMvc envoie de vraies requêtes HTTP à l'application, sans ouvrir de port réseau.
 * Chaque membre a un e-mail unique : les tests ne se gênent pas entre eux.
 */
@SpringBootTest(classes = OrivyApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class TestApi {

    protected static final String MOT_DE_PASSE = "MotDePasse123!";

    @Autowired
    protected MockMvc mockMvc;

    /* Un membre inscrit et connecté : son id et son jeton (le back le pose dans le cookie orivy_jeton) */
    protected record Membre(long id, String jeton) {
        Cookie cookie() { return new Cookie(CookieJeton.NOM, jeton); }
    }

    protected Membre nouveauMembre(String prenom) throws Exception {
        String email = prenom.toLowerCase() + "-" + UUID.randomUUID() + "@test.fr";
        String json = """
                {"prenom":"%s","nom":"Test","email":"%s","motDePasse":"%s"}""".formatted(prenom, email, MOT_DE_PASSE);
        mockMvc.perform(post("/api/utilisateurs/inscription").contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated());
        MockHttpServletResponse reponse = mockMvc.perform(post("/api/utilisateurs/connexion").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"%s\",\"motDePasse\":\"%s\"}".formatted(email, MOT_DE_PASSE)))
                .andExpect(status().isOk())
                .andReturn().getResponse();
        // Depuis le cookie HttpOnly : le corps contient le profil (sans jeton), le jeton est dans le cookie
        long id = ((Number) JsonPath.read(reponse.getContentAsString(), "$.id")).longValue();
        return new Membre(id, reponse.getCookie(CookieJeton.NOM).getValue());
    }

    /* Une sortie dans une semaine, organisée par « organisateur ». nombreMax = null : places illimitées */
    protected long nouvelleSortie(Membre organisateur, Integer nombreMax) throws Exception {
        String json = """
                {"nom":"Pique-nique","lieu":"Lyon","dateDebut":"%s"%s}"""
                .formatted(LocalDateTime.now().plusDays(7).withNano(0), nombreMax == null ? "" : ",\"nombreMax\":" + nombreMax);
        String reponse = mockMvc.perform(en(organisateur, post("/api/sorties"))
                        .contentType(MediaType.APPLICATION_JSON).content(json))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(reponse, "$.id")).longValue();
    }

    /* Ajoute le jeton du membre à une requête */
    protected MockHttpServletRequestBuilder en(Membre membre, MockHttpServletRequestBuilder requete) {
        return requete.cookie(membre.cookie());
    }
}
