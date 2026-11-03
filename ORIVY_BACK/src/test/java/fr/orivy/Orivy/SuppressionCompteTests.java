package fr.orivy.Orivy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/* Supprimer son compte (bloc D, RGPD) : tout ce qui pointe vers le membre part avec lui, sans erreur 500 */
class SuppressionCompteTests extends TestApi {

    @Test
    void unMauvaisMotDePasseEmpecheLaSuppression() throws Exception {
        Membre alice = nouveauMembre("Alice");
        mockMvc.perform(en(alice, post("/api/utilisateurs/moi/suppression")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motDePasse\":\"Faux123!\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void unMembreAvecSortiesMessagesEtAbonnementsPeutSupprimerSonCompte() throws Exception {
        Membre alice = nouveauMembre("Alice");
        Membre bob = nouveauMembre("Bob");
        long saSortie = nouvelleSortie(alice, null);
        long sortieDeBob = nouvelleSortie(bob, null);
        mockMvc.perform(en(alice, post("/api/sorties/" + sortieDeBob + "/inscription"))).andExpect(status().isOk());
        mockMvc.perform(en(alice, post("/api/messages/" + bob.id())).contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Coucou\"}")).andExpect(status().isCreated());
        mockMvc.perform(en(bob, post("/api/utilisateurs/" + alice.id() + "/abonnement"))).andExpect(status().isNoContent());

        mockMvc.perform(en(alice, post("/api/utilisateurs/moi/suppression")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"motDePasse\":\"%s\"}".formatted(MOT_DE_PASSE)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/sorties/" + saSortie)).andExpect(status().isNotFound());           // sa sortie est partie
        mockMvc.perform(get("/api/sorties/" + sortieDeBob)).andExpect(jsonPath("$.participants.length()").value(0));
        mockMvc.perform(en(bob, get("/api/messages"))).andExpect(jsonPath("$.length()").value(0));   // plus de conversation
        mockMvc.perform(en(bob, get("/api/utilisateurs/" + alice.id()))).andExpect(status().isNotFound());
    }
}
