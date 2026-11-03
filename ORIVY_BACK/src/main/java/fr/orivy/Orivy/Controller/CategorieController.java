package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.CategorieDto;
import fr.orivy.Orivy.Service.CategorieService;

@RestController
@RequestMapping("/api/categories")
public class CategorieController {

    private final CategorieService categorieService;

    public CategorieController(CategorieService categorieService) {
        this.categorieService = categorieService;
    }

    @GetMapping   // public : tout le monde a besoin des catégories pour afficher la carte, les filtres…
    public List<CategorieDto> toutes() {
        return categorieService.toutes().stream().map(CategorieDto::depuis).toList();
    }

    @PostMapping   // admin (règle dans SecurityConfig)
    @ResponseStatus(HttpStatus.CREATED)
    public CategorieDto creer(@RequestBody CategorieDto demande) {
        return CategorieDto.depuis(categorieService.creer(demande));
    }

    @PutMapping("/{id}")
    public CategorieDto modifier(@PathVariable Long id, @RequestBody CategorieDto demande) {
        return CategorieDto.depuis(categorieService.modifier(id, demande));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimer(@PathVariable Long id) {
        categorieService.supprimer(id);
    }
}
