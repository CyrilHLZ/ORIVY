package fr.orivy.Orivy.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
public class PointInteret {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;
    private String description;
    @NotBlank
    private String type;
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
    private String adresse;
    @Column(columnDefinition = "TEXT")
    private String imageUrl;
    private String couleur;
    @Column(columnDefinition = "TEXT")
    private String imageSource;
    @Column(columnDefinition = "TEXT")
    private String imageLicence;

    public PointInteret() {
    }

    public Long getId() { return id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }
    public String getImageSource() { return imageSource; }
    public void setImageSource(String imageSource) { this.imageSource = imageSource; }
    public String getImageLicence() { return imageLicence; }
    public void setImageLicence(String imageLicence) { this.imageLicence = imageLicence; }
}