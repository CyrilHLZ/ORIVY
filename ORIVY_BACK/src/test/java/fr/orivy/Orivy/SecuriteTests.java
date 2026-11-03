package fr.orivy.Orivy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/* Inscription, connexion et protection des routes (P1 : sécurité) */
class SecuriteTests extends TestApi {

    @Test
    void unMembreInscritPeutSeConnecterEtVoirSonProfil() throws Exception {
        Membre alice = nouveauMembre("Alice");
        mockMvc.perform(en(alice, get("/api/utilisateurs/" + alice.id())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.prenom").value("Alice"));
    }

    @Test
    void unMauvaisMotDePasseEstRefuse() throws Exception {
        nouveauMembre("Bob");
        mockMvc.perform(post("/api/utilisateurs/connexion").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"personne@test.fr\",\"motDePasse\":\"Faux123!\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unMotDePasseTropFaibleEstRefuseALInscription() throws Exception {
        mockMvc.perform(post("/api/utilisateurs/inscription").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prenom\":\"Zoe\",\"nom\":\"Test\",\"email\":\"zoe@test.fr\",\"motDePasse\":\"abc\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void sansJetonLesRoutesPriveesSontFermees() throws Exception {
        mockMvc.perform(get("/api/messages")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/favoris")).andExpect(status().isUnauthorized());
    }

    @Test
    void unFauxJetonEstRefuse() throws Exception {
        mockMvc.perform(get("/api/messages").header("Authorization", "Bearer pas.un.vrai.jeton"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void laCarteEtLesSortiesSontPubliques() throws Exception {
        mockMvc.perform(get("/api/carte")).andExpect(status().isOk());
        mockMvc.perform(get("/api/sorties")).andExpect(status().isOk());
    }

    @Test
    void unMembreNePeutPasLireLesSignalements() throws Exception {
        Membre claire = nouveauMembre("Claire");
        mockMvc.perform(en(claire, get("/api/signalements"))).andExpect(status().isForbidden());
    }
}
