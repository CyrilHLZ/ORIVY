package fr.orivy.Orivy.Controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import fr.orivy.Orivy.DTO.PhotoSortieDto;
import fr.orivy.Orivy.DTO.SortieDto;
import fr.orivy.Orivy.DTO.SortiesMembreDto;
import fr.orivy.Orivy.Model.Sortie;
import fr.orivy.Orivy.Service.SortieService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/sorties")
public class SortieController {

    private final SortieService sortieService;

    public SortieController(SortieService sortieService) {
        this.sortieService = sortieService;
    }

    @GetMapping
    public List<SortieDto> getAllSorties() {
        return sortieService.getAllSorties().stream().map(SortieDto::depuis).toList();
    }

    @GetMapping("/{id}")
    public SortieDto getSortie(@PathVariable Long id) {
        return SortieDto.depuis(sortieService.getSortie(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SortieDto creerSortie(@Valid @RequestBody Sortie sortie, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.creerSortie(sortie, idDe(jwt)));
    }

    @PutMapping("/{id}")
    public SortieDto modifierSortie(@PathVariable Long id, @Valid @RequestBody Sortie sortie, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.modifierSortie(id, sortie, idDe(jwt), estAdmin(jwt)));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimerSortie(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        sortieService.supprimerSortie(id, idDe(jwt), estAdmin(jwt));
    }

    // On inscrit toujours l'appelant lui-même : l'id vient du jeton.
    // La sortie mise à jour est renvoyée pour que le front rafraîchisse les participants.
    @PostMapping("/{id}/inscription")
    public SortieDto inscription(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.inscrire(id, idDe(jwt)));
    }

    @DeleteMapping("/{id}/inscription")
    public SortieDto desinscription(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.desinscrire(id, idDe(jwt)));
    }

    // Liste d'attente d'une sortie complète
    @PostMapping("/{id}/attente")
    public SortieDto rejoindreAttente(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.rejoindreAttente(id, idDe(jwt)));
    }

    @DeleteMapping("/{id}/attente")
    public SortieDto quitterAttente(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        return SortieDto.depuis(sortieService.quitterAttente(id, idDe(jwt)));
    }

    private Long idDe(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }

    private boolean estAdmin(Jwt jwt) {
        return "admin".equalsIgnoreCase(jwt.getClaimAsString("role"));
    }

    @GetMapping("/membre/{id}")
    public SortiesMembreDto sortiesDuMembre(@PathVariable Long id) {
        return new SortiesMembreDto(
            sortieService.getSortiesOrganisees(id).stream().map(SortieDto::depuis).toList(),
            sortieService.getSortiesRejointes(id).stream().map(SortieDto::depuis).toList());
    }

    // Photo ou petite vidéo de la sortie (organisateur ou admin)
    @PostMapping("/{id}/photo")
    public SortieDto changerPhoto(@PathVariable Long id, @RequestParam("photo") MultipartFile photo,
                                  @AuthenticationPrincipal Jwt jwt) throws IOException {
        return SortieDto.depuis(sortieService.changerPhoto(id, photo, idDe(jwt), estAdmin(jwt)));
    }

    @GetMapping("/search")
    public List<SortieDto> rechercher(@RequestParam("query") String query) {
        return sortieService.rechercher(query).stream().map(SortieDto::depuis).toList();
    }

    @GetMapping("/{id}/album")
    public List<PhotoSortieDto> album(@PathVariable Long id) {
        return sortieService.album(id).stream().map(PhotoSortieDto::depuis).toList();
    }

    @PostMapping("/{id}/album")
    @ResponseStatus(HttpStatus.CREATED)
    public PhotoSortieDto ajouterAuAlbum(@PathVariable Long id, @RequestParam("photo") MultipartFile photo,
                                        @AuthenticationPrincipal Jwt jwt) throws IOException {
        return PhotoSortieDto.depuis(sortieService.ajouterAuAlbum(id, photo, idDe(jwt)));
    }

    @DeleteMapping("/{id}/album/{photoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void retirerDeLAlbum(@PathVariable Long photoId, @AuthenticationPrincipal Jwt jwt) {
        sortieService.retirerDeLAlbum(photoId, idDe(jwt), estAdmin(jwt));
    }
}
