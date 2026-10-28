package fr.orivy.Orivy.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ChangementEmail(
        String motDePasse,
        @NotBlank(message = "L'email est obligatoire.")
        @Email(message = "L'email n'est pas valide.")
        String nouvelEmail) {
}


