package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.PublicationDto;
import fr.orivy.Orivy.Service.FilService;

@RestController
@RequestMapping("/api/fil")
public class FilController {

    private final FilService filService;

    public FilController(FilService filService) {
        this.filService = filService;
    }

    // GET /api/fil?onglet=abonnements&page=0  (onglet par défaut : pour-toi)
    @GetMapping
    public List<PublicationDto> fil(@RequestParam(defaultValue = "pour-toi") String onglet,
                                    @RequestParam(defaultValue = "0") int page,
                                    @AuthenticationPrincipal Jwt jwt) {
        var publications = "abonnements".equals(onglet)
                ? filService.abonnements(Long.valueOf(jwt.getSubject()), page)
                : filService.pourToi(page);
        return publications.stream().map(PublicationDto::depuis).toList();
    }
}
