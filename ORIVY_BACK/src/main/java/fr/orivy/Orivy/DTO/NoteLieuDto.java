package fr.orivy.Orivy.DTO;

// Moyenne des avis d'un lieu : { "cibleType": "point", "cibleId": 12, "moyenne": 4.3, "nombre": 7 }
public record NoteLieuDto(String cibleType, Long cibleId, Double moyenne, Long nombre) {
}

