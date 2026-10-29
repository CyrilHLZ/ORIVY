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
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"abonne_id", "suivi_id"}))
public class Abonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "abonne_id")
    private Utilisateur abonne;

    @ManyToOne
    @JoinColumn(name = "suivi_id")
    private Utilisateur suivi;

    private LocalDateTime dateAbonnement = LocalDateTime.now();

    protected Abonnement() {
    }

    public Abonnement(Utilisateur abonne, Utilisateur suivi) {
        this.abonne = abonne;
        this.suivi = suivi;
    }

    public Utilisateur getAbonne() { return abonne; }
    public Utilisateur getSuivi() { return suivi; }
}
