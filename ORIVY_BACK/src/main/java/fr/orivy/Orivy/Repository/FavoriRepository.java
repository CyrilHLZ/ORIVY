package fr.orivy.Orivy.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fr.orivy.Orivy.Model.Favori;

@Repository 
public interface FavoriRepository extends JpaRepository<Favori, Long> {
    List<Favori> findByUtilisateurIdOrderByDateAjoutDesc(Long utilisateurId);
    Optional<Favori> findByUtilisateurIdAndCibleTypeAndCibleId(Long utilisateurId, String cibleType, Long cibleId);
}
