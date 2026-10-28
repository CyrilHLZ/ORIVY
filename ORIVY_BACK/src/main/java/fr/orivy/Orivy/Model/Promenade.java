package fr.orivy.Orivy.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;

@Entity
public class Promenade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;
    private String description;
    private Double distanceKm;
    private Integer dureeMinutes;
    private String difficulte;
    // Itinéraire : tableau JSON de points [[lat, lng], …] — un vrai tracé dépasse vite 255 caractères
    @Column(length = 10000)
    private String parcoursJson;

    public Promenade() {
    }

    public Long getId() { return id; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Integer getDureeMinutes() { return dureeMinutes; }
    public void setDureeMinutes(Integer dureeMinutes) { this.dureeMinutes = dureeMinutes; }
    public String getDifficulte() { return difficulte; }
    public void setDifficulte(String difficulte) { this.difficulte = difficulte; }
    public String getParcoursJson() { return parcoursJson; }
    public void setParcoursJson(String parcoursJson) { this.parcoursJson = parcoursJson; }
}