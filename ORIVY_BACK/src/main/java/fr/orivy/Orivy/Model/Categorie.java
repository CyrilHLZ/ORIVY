package fr.orivy.Orivy.Model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Categorie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String cle;       // « parc », « monument »… : référencé par les lieux et les sorties
    private String nom;
    private String pluriel;
    private String emoji;
    private String couleur;   // #RRGGBB
    private Integer ordre;

    public Long getId() { return id; }
    public String getCle() { return cle; }
    public void setCle(String cle) { this.cle = cle; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getPluriel() { return pluriel; }
    public void setPluriel(String pluriel) { this.pluriel = pluriel; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }
    public Integer getOrdre() { return ordre; }
    public void setOrdre(Integer ordre) { this.ordre = ordre; }
}
