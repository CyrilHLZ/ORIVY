package fr.orivy.Orivy.Model;

public class Activite {
    
    public String nom;
    public String description;
    public String date;
    public String heure;
    public String lieu;
    public String prix;
    public String capacite;
    public String categorie;
    public String image;
    private String organisateur;
    private String statut;
    
    public Activite(String nom, String description, String date, String heure, String lieu, String prix, String capacite, String categorie, String image, String organisateur, String statut) {
        this.nom = nom;
        this.description = description;
        this.date = date;
        this.heure = heure;
        this.lieu = lieu;
        this.prix = prix;
        this.capacite = capacite;
        this.categorie = categorie;
        this.image = image;
        this.organisateur = organisateur;
        this.statut = statut;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getHeure() {
        return heure;
    }

    public void setHeure(String heure) {
        this.heure = heure;
    }

    public String getLieu() {
        return lieu;
    }

    public void setLieu(String lieu) {
        this.lieu = lieu;
    }

    public String getPrix() {
        return prix;
    }

    public void setPrix(String prix) {
        this.prix = prix;
    }

    public String getCapacite() {
        return capacite;
    }

    public void setCapacite(String capacite) {
        this.capacite = capacite;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getOrganisateur() {
        return organisateur;
    }

    public void setOrganisateur(String organisateur) {
        this.organisateur = organisateur;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    
}
