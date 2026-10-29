package fr.orivy.Orivy.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"bloqueur_id", "bloque_id"}))
public class Blocage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "bloqueur_id")
    private Utilisateur bloqueur;

    @ManyToOne
    @JoinColumn(name = "bloque_id")
    private Utilisateur bloque;

    private LocalDateTime dateBlocage = LocalDateTime.now();

    protected Blocage() {
    }

    public Blocage(Utilisateur bloqueur, Utilisateur bloque) {
        this.bloqueur = bloqueur;
        this.bloque = bloque;
    }

    public Utilisateur getBloque() { return bloque; }
}
