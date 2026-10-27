package fr.orivy.Orivy.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import fr.orivy.Orivy.DTO.CommentaireDto;
import fr.orivy.Orivy.Model.Commentaire;
import fr.orivy.Orivy.Service.CommentaireService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class CommentaireController {

    private final CommentaireService commentaireService;

    public CommentaireController(CommentaireService commentaireService) {
        this.commentaireService = commentaireService;
    }

    @GetMapping("/{cibleType}/{cibleId}/commentaires")
    public List<CommentaireDto> commentaires(@PathVariable String cibleType, @PathVariable Long cibleId) {
        return commentaireService.getCommentaires(cibleType, cibleId).stream().map(CommentaireDto::depuis).toList();
    }

    @PostMapping("/commentaires")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentaireDto creerCommentaire(@Valid @RequestBody Commentaire commentaire, @AuthenticationPrincipal Jwt jwt) {
        return CommentaireDto.depuis(commentaireService.creerCommentaire(commentaire, Long.valueOf(jwt.getSubject())));
    }
}
