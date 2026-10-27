package fr.orivy.Orivy.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Commentaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Posé par le back à partir du jeton : pas de @NotBlank, le front ne l'envoie pas
    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;
    @NotBlank
    private String contenu;
    private Integer note;
    @NotBlank
    private String cibleType;
    private Long cibleId;
    private LocalDateTime dateCreation = LocalDateTime.now();

    protected Commentaire() {
    }

    public Long getId() { return id; }
    public Utilisateur getAuteur() { return auteur; }
    public void setAuteur(Utilisateur auteur) { this.auteur = auteur; }
    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }
    public Integer getNote() { return note; }
    public void setNote(Integer note) { this.note = note; }
    public String getCibleType() { return cibleType; }
    public void setCibleType(String cibleType) { this.cibleType = cibleType; }
    public Long getCibleId() { return cibleId; }
    public void setCibleId(Long cibleId) { this.cibleId = cibleId; }
    public LocalDateTime getDateCreation() { return dateCreation; }
}
