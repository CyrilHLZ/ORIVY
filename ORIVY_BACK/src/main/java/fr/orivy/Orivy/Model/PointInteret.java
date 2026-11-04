package fr.orivy.Orivy.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
    // Photo changée ou retirée par l'admin : on ne la remplace plus automatiquement
    @JsonIgnore
    private boolean photoChoisie;
    // Lieu importé d'OpenStreetMap (« node/123 », « way/456 ») ; null pour les lieux saisis dans ORIVY
    private String osmId;

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
    public boolean isPhotoChoisie() { return photoChoisie; }
    public void setPhotoChoisie(boolean photoChoisie) { this.photoChoisie = photoChoisie; }
    public String getOsmId() { return osmId; }
    public void setOsmId(String osmId) { this.osmId = osmId; }
}
