package fr.orivy.Orivy.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // À qui elle est destinée
    @ManyToOne
    @JoinColumn(name = "destinataire_id")
    private Utilisateur destinataire;

    private String type;    // "inscription", "commentaire", "sortie-modifiee"…
    private String texte;   // « Alice a rejoint ta sortie « Pique-nique » »
    private String lien;    // où aller au clic : "/sorties/3"
    private boolean lue = false;
    private LocalDateTime dateCreation = LocalDateTime.now();

    public Notification() {
    }

    public Notification(Utilisateur destinataire, String type, String texte, String lien) {
        this.destinataire = destinataire;
        this.type = type;
        this.texte = texte;
        this.lien = lien;
    }

    public Long getId() { return id; }
    public Utilisateur getDestinataire() { return destinataire; }
    public String getType() { return type; }
    public String getTexte() { return texte; }
    public String getLien() { return lien; }
    public boolean isLue() { return lue; }
    public void setLue(boolean lue) { this.lue = lue; }
    public LocalDateTime getDateCreation() { return dateCreation; }
}
