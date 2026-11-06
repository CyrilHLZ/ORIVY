package fr.orivy.Orivy;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

/* Bouton « Suggérer » de la carte : un membre propose un lieu ou une idée ; seul l'admin les lit */
class SuggestionTests extends TestApi {

    @Test
    void unMembreSuggereUnLieuEtNePeutPasLireLesSuggestions() throws Exception {
        Membre alice = nouveauMembre("Alice");
        mockMvc.perform(en(alice, post("/api/suggestions")).contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"type":"lieu","nomLieu":"Le Café des Arts","categorie":"bar","adresse":"Nantes","latitude":47.2,"longitude":-1.55}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nomLieu").value("Le Café des Arts"))
                .andExpect(jsonPath("$.latitude").value(47.2));
        mockMvc.perform(en(alice, get("/api/suggestions"))).andExpect(status().isForbidden());
    }

    @Test
    void unLieuSansAdresseOuUneIdeeVideSontRefuses() throws Exception {
        Membre alice = nouveauMembre("Alice");
        mockMvc.perform(en(alice, post("/api/suggestions")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"lieu\",\"nomLieu\":\"Le Café des Arts\"}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(en(alice, post("/api/suggestions")).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"idee\",\"message\":\"  \"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void unVisiteurNonConnecteNePeutPasSuggerer() throws Exception {
        mockMvc.perform(post("/api/suggestions").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"idee\",\"message\":\"Une idée\"}"))
                .andExpect(status().isUnauthorized());
    }
}
