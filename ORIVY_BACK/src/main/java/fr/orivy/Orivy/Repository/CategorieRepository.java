package fr.orivy.Orivy.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.Categorie;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {
    List<Categorie> findAllByOrderByOrdreAsc();
    Optional<Categorie> findByCle(String cle);
    boolean existsByCle(String cle);
}
