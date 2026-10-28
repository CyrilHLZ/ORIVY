package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.ConversationDto;
import fr.orivy.Orivy.DTO.MessageDto;
import fr.orivy.Orivy.DTO.NouveauMessageDto;
import fr.orivy.Orivy.Service.MessageService;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public List<ConversationDto> conversations(@AuthenticationPrincipal Jwt jwt) {
        return messageService.conversations(idDe(jwt));
    }

    @GetMapping("/{membreId}")
    public List<MessageDto> conversation(@PathVariable Long membreId, @AuthenticationPrincipal Jwt jwt) {
        return messageService.conversation(idDe(jwt), membreId).stream().map(MessageDto::depuis).toList();
    }

    @PostMapping("/{membreId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageDto envoyer(@PathVariable Long membreId, @RequestBody NouveauMessageDto demande, @AuthenticationPrincipal Jwt jwt) {
        return MessageDto.depuis(messageService.envoyer(idDe(jwt), membreId, demande.message()));
    }

    @DeleteMapping("/{membreId}/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void supprimer(@PathVariable Long messageId, @AuthenticationPrincipal Jwt jwt) {
        messageService.supprimer(idDe(jwt), messageId);
    }

    private Long idDe(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}

