package fr.orivy.Orivy.Model;

public class Utilisateur {
    
    private String nom;
    private String prenom;
    private String dateDeNaissance;
    private String email;
    private String motDePasse;
    private String role;
    private String numeroTelephone;
    private String adresse;
    private String ville;
    private String codePostal;
    private String pays;
    
    public Utilisateur() {
    }

    public Utilisateur(String nom, String prenom, String dateDeNaissance, String email, String motDePasse, String role, String numeroTelephone, String adresse, String ville, String codePostal, String pays) {
        this.nom = nom;
        this.prenom = prenom;
        this.dateDeNaissance = dateDeNaissance;
        this.email = email;
        this.motDePasse = motDePasse;
        this.role = role;
        this.numeroTelephone = numeroTelephone;
        this.adresse = adresse;
        this.ville = ville;
        this.codePostal = codePostal;
        this.pays = pays;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getDateDeNaissance() {
        return dateDeNaissance;
    }

    public void setDateDeNaissance(String dateDeNaissance) {
        this.dateDeNaissance = dateDeNaissance;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getNumeroTelephone() {
        return numeroTelephone;
    }

    public void setNumeroTelephone(String numeroTelephone) {
        this.numeroTelephone = numeroTelephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getCodePostal() {
        return codePostal;
    }

    public void setCodePostal(String codePostal) {
        this.codePostal = codePostal;
    }

    public String getPays() {
        return pays;
    }

    public void setPays(String pays) {
        this.pays = pays;
    }

    

}
