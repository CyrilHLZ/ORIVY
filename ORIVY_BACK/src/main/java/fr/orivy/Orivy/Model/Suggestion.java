package fr.orivy.Orivy.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

/* Suggestion d'un membre : un lieu à ajouter sur la carte (type « lieu ») ou une idée (type « idee ») */
@Entity
public class Suggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;

    private String type;
    private String nomLieu;
    private String categorie;
    private String adresse;
    private Double latitude;
    private Double longitude;
    @Column(length = 1000)
    private String message;

    private boolean traite = false;
    private LocalDateTime dateCreation = LocalDateTime.now();

    protected Suggestion() {
    }

    public Suggestion(Utilisateur auteur, String type, String nomLieu, String categorie, String adresse,
            Double latitude, Double longitude, String message) {
        this.auteur = auteur;
        this.type = type;
        this.nomLieu = nomLieu;
        this.categorie = categorie;
        this.adresse = adresse;
        this.latitude = latitude;
        this.longitude = longitude;
        this.message = message;
    }

    public Long getId() { return id; }
    public Utilisateur getAuteur() { return auteur; }
    public String getType() { return type; }
    public String getNomLieu() { return nomLieu; }
    public String getCategorie() { return categorie; }
    public String getAdresse() { return adresse; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getMessage() { return message; }
    public boolean isTraite() { return traite; }
    public void setTraite(boolean traite) { this.traite = traite; }
    public LocalDateTime getDateCreation() { return dateCreation; }
}
