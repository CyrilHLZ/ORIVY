package fr.orivy.Orivy.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import fr.orivy.Orivy.DTO.CategorieDto;
import fr.orivy.Orivy.Model.Categorie;
import fr.orivy.Orivy.Repository.CategorieRepository;

@Service
public class CategorieService {

    private final CategorieRepository categorieRepository;

    public CategorieService(CategorieRepository categorieRepository) {
        this.categorieRepository = categorieRepository;
    }

    public List<Categorie> toutes() {
        return categorieRepository.findAllByOrderByOrdreAsc();
    }

    public Categorie creer(CategorieDto demande) {
        String cle = slug(demande.nom());
        if (cle.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Donne un nom à la catégorie.");
        if (categorieRepository.existsByCle(cle)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une catégorie porte déjà ce nom.");
        }
        Categorie c = new Categorie();
        c.setCle(cle);
        appliquer(c, demande);
        c.setOrdre(demande.ordre() != null ? demande.ordre() : 999);   // par défaut, à la fin
        return categorieRepository.save(c);
    }

    public Categorie modifier(Long id, CategorieDto demande) {
        Categorie c = trouver(id);
        appliquer(c, demande);             // on ne change PAS la clé : les lieux/sorties y font référence
        if (demande.ordre() != null) c.setOrdre(demande.ordre());
        return categorieRepository.save(c);
    }

    public void supprimer(Long id) {
        Categorie c = trouver(id);
        if ("autre".equals(c.getCle())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La catégorie « Autre » est le repli par défaut : on ne peut pas la supprimer.");
        }
        categorieRepository.delete(c);      // les lieux qui la portaient s'afficheront en « Autre » (repli du front)
    }

    private void appliquer(Categorie c, CategorieDto d) {
        if (d.nom() != null) c.setNom(d.nom().trim());
        if (d.pluriel() != null) c.setPluriel(d.pluriel().trim());
        c.setEmoji(d.emoji());
        c.setCouleur(d.couleur());
    }

    private Categorie trouver(Long id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Catégorie introuvable."));
    }

    // « Marché de Noël » → « marche-de-noel » : une clé stable, sans accent ni espace
    private static String slug(String texte) {
        if (texte == null) return "";
        String sansAccent = java.text.Normalizer.normalize(texte, java.text.Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return sansAccent.toLowerCase().trim().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
