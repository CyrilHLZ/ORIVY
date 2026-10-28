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

import fr.orivy.Orivy.DTO.NotificationDto;
import fr.orivy.Orivy.Service.NotificationService;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDto> mesNotifications(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.mesNotifications(idDe(jwt)).stream().map(NotificationDto::depuis).toList();
    }

    @GetMapping("/non-lues")
    public long nombreNonLues(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.nombreNonLues(idDe(jwt));
    }

    @PostMapping("/{id}/lire")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void marquerLue(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        notificationService.marquerLue(id, idDe(jwt));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimer(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        notificationService.supprimer(id, idDe(jwt));
    }

    private Long idDe(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
