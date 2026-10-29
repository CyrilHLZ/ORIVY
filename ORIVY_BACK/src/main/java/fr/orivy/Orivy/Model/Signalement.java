package fr.orivy.Orivy.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;

    private String cibleType;
    private Long cibleId;

    @Column(length = 500)
    private String motif;

    private boolean traite = false;
    private LocalDateTime dateCreation = LocalDateTime.now();

    protected Signalement() {
    }

    public Signalement(Utilisateur auteur, String cibleType, Long cibleId, String motif) {
        this.auteur = auteur;
        this.cibleType = cibleType;
        this.cibleId = cibleId;
        this.motif = motif;
    }

    public Long getId() { return id; }
    public Utilisateur getAuteur() { return auteur; }
    public String getCibleType() { return cibleType; }
    public Long getCibleId() { return cibleId; }
    public String getMotif() { return motif; }
    public boolean isTraite() { return traite; }
    public void setTraite(boolean traite) { this.traite = traite; }
    public LocalDateTime getDateCreation() { return dateCreation; }
}
