package fr.orivy.Orivy.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class PhotoSortie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sortie_id")
    private Sortie sortie;

    @ManyToOne
    @JoinColumn(name = "auteur_id")
    private Utilisateur auteur;

    private String url;   // /api/fichiers/albums/…  (photo ou vidéo)
    private LocalDateTime dateAjout = LocalDateTime.now();

    public PhotoSortie() {
    }

    public PhotoSortie(Sortie sortie, Utilisateur auteur, String url) {
        this.sortie = sortie;
        this.auteur = auteur;
        this.url = url;
    }

    public Long getId() {
         return id; 
    }
    public Sortie getSortie() {
         return sortie;
    }
    public Utilisateur getAuteur() { 
        return auteur; 
    }
    public String getUrl() { 
        return url; 
    }
    public LocalDateTime getDateAjout() {
         return dateAjout; 
    }
}
