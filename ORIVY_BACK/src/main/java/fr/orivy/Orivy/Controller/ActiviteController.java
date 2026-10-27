package fr.orivy.Orivy.Controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.ActiviteCarteDto;
import fr.orivy.Orivy.Service.ActiviteService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ActiviteController {

    private final ActiviteService activiteService;

    public ActiviteController(ActiviteService activiteService) {
        this.activiteService = activiteService;
    }

    @GetMapping("/activites")
    public List<ActiviteCarteDto> activites() {
        return activiteService.getAllActivites();
    }

    @PostMapping("/activites")
    public ActiviteCarteDto creerActivite(@Valid @RequestBody ActiviteCarteDto activite) {
        return activiteService.creerActivite(activite);
    }

    @GetMapping("/activites/{id}")
    public ActiviteCarteDto getActivite(@PathVariable Long id) {
        return activiteService.getActivite(id);
    }

    @PutMapping("/activites/{id}")
        public ActiviteCarteDto modifierActivite(@PathVariable Long id,
            @Valid @RequestBody ActiviteCarteDto activite) {
        return activiteService.modifierActivite(id, activite);
    }

    @DeleteMapping("/activites/{id}")
    public void supprimerActivite(@PathVariable Long id) {
        activiteService.supprimerActivite(id);
    }

    @GetMapping("/activites/recherche")
    public List<ActiviteCarteDto> rechercherActivites(@RequestParam String motCle) {
        return activiteService.rechercherActivites(motCle);
    }

    @GetMapping("/activites/filtre/categorie")
    public List<ActiviteCarteDto> filtrerParCategorie(@RequestParam String categorie) {
        return activiteService.filtrerParCategorie(categorie);
    }

    @GetMapping("/activites/filtre/lieu")
    public List<ActiviteCarteDto> filtrerParLieu(@RequestParam String lieu) {
        return activiteService.filtrerParLieu(lieu);
    }

    @GetMapping("/activites/filtre/date")
    public List<ActiviteCarteDto> filtrerParDate(@RequestParam LocalDateTime debut,
            @RequestParam LocalDateTime fin) {
        return activiteService.filtrerParDate(debut, fin);
    }

}
