package fr.orivy.Orivy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/* Sorties : création, inscription, places limitées et liste d'attente (bloc A) */
class SortieTests extends TestApi {

    @Test
    void uneSortieDansLePasseEstRefusee() throws Exception {
        Membre orga = nouveauMembre("Orga");
        mockMvc.perform(en(orga, post("/api/sorties")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nom\":\"Trop tard\",\"lieu\":\"Lyon\",\"dateDebut\":\"%s\"}"
                                .formatted(LocalDateTime.now().minusDays(1).withNano(0))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unMembreSInscritPuisSeDesinscrit() throws Exception {
        Membre orga = nouveauMembre("Orga");
        Membre alice = nouveauMembre("Alice");
        long sortie = nouvelleSortie(orga, null);

        mockMvc.perform(en(alice, post("/api/sorties/" + sortie + "/inscription")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participants.length()").value(1));
        mockMvc.perform(en(alice, delete("/api/sorties/" + sortie + "/inscription")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.participants.length()").value(0));
    }

    @Test
    void uneSortieCompleteRefuseUneInscriptionDePlus() throws Exception {
        Membre orga = nouveauMembre("Orga");
        long sortie = nouvelleSortie(orga, 2);
        mockMvc.perform(en(nouveauMembre("A"), post("/api/sorties/" + sortie + "/inscription"))).andExpect(status().isOk());
        mockMvc.perform(en(nouveauMembre("B"), post("/api/sorties/" + sortie + "/inscription"))).andExpect(status().isOk());

        mockMvc.perform(en(nouveauMembre("C"), post("/api/sorties/" + sortie + "/inscription")))
                .andExpect(status().isConflict());   // 409 : « Cette sortie est complète. »
    }

    @Test
    void quandUnePlaceSeLibereLePremierDeLaListeDAttenteEstInscrit() throws Exception {
        Membre orga = nouveauMembre("Orga");
        Membre a = nouveauMembre("A");
        Membre chloe = nouveauMembre("Chloe");
        long sortie = nouvelleSortie(orga, 2);
        mockMvc.perform(en(a, post("/api/sorties/" + sortie + "/inscription"))).andExpect(status().isOk());
        mockMvc.perform(en(nouveauMembre("B"), post("/api/sorties/" + sortie + "/inscription"))).andExpect(status().isOk());
        mockMvc.perform(en(chloe, post("/api/sorties/" + sortie + "/attente")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attente.length()").value(1));

        // A se désinscrit : Chloé, 1re de la liste d'attente, prend sa place automatiquement
        mockMvc.perform(en(a, delete("/api/sorties/" + sortie + "/inscription"))).andExpect(status().isOk());
        mockMvc.perform(get("/api/sorties/" + sortie))
                .andExpect(jsonPath("$.attente.length()").value(0))
                .andExpect(jsonPath("$.participants[?(@.id == %d)]".formatted(chloe.id())).exists());
    }

    @Test
    void seulLOrganisateurPeutSupprimerSaSortie() throws Exception {
        Membre orga = nouveauMembre("Orga");
        long sortie = nouvelleSortie(orga, null);
        mockMvc.perform(en(nouveauMembre("Intrus"), delete("/api/sorties/" + sortie))).andExpect(status().isForbidden());
        mockMvc.perform(en(orga, delete("/api/sorties/" + sortie))).andExpect(status().is2xxSuccessful());
        mockMvc.perform(get("/api/sorties/" + sortie)).andExpect(status().isNotFound());
    }
}
