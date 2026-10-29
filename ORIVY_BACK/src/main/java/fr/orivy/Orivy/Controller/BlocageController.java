package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.UtilisateurPublicDto;
import fr.orivy.Orivy.Service.BlocageService;

@RestController
@RequestMapping("/api/utilisateurs")
public class BlocageController {

    private final BlocageService blocageService;

    public BlocageController(BlocageService blocageService) {
        this.blocageService = blocageService;
    }

    @PostMapping("/{id}/blocage")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void bloquer(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        blocageService.bloquer(Long.valueOf(jwt.getSubject()), id);
    }

    @DeleteMapping("/{id}/blocage")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void debloquer(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        blocageService.debloquer(Long.valueOf(jwt.getSubject()), id);
    }

    @GetMapping("/moi/blocages")
    public List<UtilisateurPublicDto> mesBlocages(@AuthenticationPrincipal Jwt jwt) {
        return blocageService.mesBlocages(Long.valueOf(jwt.getSubject())).stream().map(UtilisateurPublicDto::depuis).toList();
    }
}
