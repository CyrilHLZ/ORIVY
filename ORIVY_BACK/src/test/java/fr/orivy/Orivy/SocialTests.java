package fr.orivy.Orivy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/* Messages, abonnements, blocage, avis des lieux (blocs B et C) */
class SocialTests extends TestApi {

    private static final String MESSAGE = "{\"message\":\"Salut !\"}";

    @Test
    void deuxMembresSEcriventEtSAbonnent() throws Exception {
        Membre alice = nouveauMembre("Alice");
        Membre bob = nouveauMembre("Bob");

        mockMvc.perform(en(alice, post("/api/messages/" + bob.id())).contentType(MediaType.APPLICATION_JSON).content(MESSAGE))
                .andExpect(status().isCreated());
        mockMvc.perform(en(alice, post("/api/utilisateurs/" + bob.id() + "/abonnement"))).andExpect(status().isNoContent());
        mockMvc.perform(en(alice, get("/api/utilisateurs/" + bob.id() + "/abonnes")))
                .andExpect(jsonPath("$[0].id").value(alice.id()));
    }

    @Test
    void unMembreBloqueNePeutPlusEcrireNiSAbonner() throws Exception {
        Membre alice = nouveauMembre("Alice");
        Membre bob = nouveauMembre("Bob");
        mockMvc.perform(en(bob, post("/api/utilisateurs/" + alice.id() + "/abonnement"))).andExpect(status().isNoContent());

        mockMvc.perform(en(alice, post("/api/utilisateurs/" + bob.id() + "/blocage"))).andExpect(status().isNoContent());

        mockMvc.perform(en(bob, post("/api/messages/" + alice.id())).contentType(MediaType.APPLICATION_JSON).content(MESSAGE))
                .andExpect(status().isForbidden());
        mockMvc.perform(en(bob, post("/api/utilisateurs/" + alice.id() + "/abonnement"))).andExpect(status().isForbidden());
        // Le blocage a aussi supprimé l'abonnement de Bob
        mockMvc.perform(en(alice, get("/api/utilisateurs/" + alice.id() + "/abonnes"))).andExpect(jsonPath("$.length()").value(0));

        // Après déblocage, Bob peut de nouveau écrire
        mockMvc.perform(en(alice, delete("/api/utilisateurs/" + bob.id() + "/blocage"))).andExpect(status().isNoContent());
        mockMvc.perform(en(bob, post("/api/messages/" + alice.id())).contentType(MediaType.APPLICATION_JSON).content(MESSAGE))
                .andExpect(status().isCreated());
    }

    @Test
    void unAvisSurUnLieuDemandeUneNoteDe1A5EtRemplaceLAncien() throws Exception {
        Membre alice = nouveauMembre("Alice");
        String avis = "{\"contenu\":\"Super\",\"cibleType\":\"point\",\"cibleId\":424242,\"note\":%s}";

        mockMvc.perform(en(alice, post("/api/commentaires")).contentType(MediaType.APPLICATION_JSON).content(avis.formatted("6")))
                .andExpect(status().isBadRequest());
        mockMvc.perform(en(alice, post("/api/commentaires")).contentType(MediaType.APPLICATION_JSON).content(avis.formatted("4")))
                .andExpect(status().isCreated());
        mockMvc.perform(en(alice, post("/api/commentaires")).contentType(MediaType.APPLICATION_JSON).content(avis.formatted("2")))
                .andExpect(status().isCreated());

        // Un seul avis par membre : le 2e a remplacé le 1er
        mockMvc.perform(get("/api/point/424242/commentaires"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].note").value(2));
    }
}
