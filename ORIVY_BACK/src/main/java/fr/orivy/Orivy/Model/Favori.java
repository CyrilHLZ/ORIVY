package fr.orivy.Orivy.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"utilisateur_id", "cible_type", "cible_id"}))
public class Favori {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id")
    private Utilisateur utilisateur;

    @Column(name = "cible_type")
    private String cibleType;   // "point", "activite" ou "sortie"

    @Column(name = "cible_id")
    private Long cibleId;

    private LocalDateTime dateAjout = LocalDateTime.now();

    public Favori() {
    }

    public Favori(Utilisateur utilisateur, String cibleType, Long cibleId) {
        this.utilisateur = utilisateur;
        this.cibleType = cibleType;
        this.cibleId = cibleId;
    }

    public Long getId() { 
        return id; 
    }
    public String getCibleType() { 
        return cibleType; 
    }
    public Long getCibleId() { 
        return cibleId; 
    }
    public LocalDateTime getDateAjout() { 
        return dateAjout;
    }
}
