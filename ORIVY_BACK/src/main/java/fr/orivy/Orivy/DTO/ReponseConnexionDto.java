package fr.orivy.Orivy.DTO;

// Ce que renvoie /connexion : le jeton à garder côté front, et l'utilisateur connecté
public record ReponseConnexionDto(String token, UtilisateurPriveeDto utilisateur) {
}
