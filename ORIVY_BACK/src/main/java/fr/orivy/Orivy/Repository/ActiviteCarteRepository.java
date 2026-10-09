package fr.orivy.Orivy.Repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.ActiviteCarte;

public interface ActiviteCarteRepository extends JpaRepository<ActiviteCarte, Long> {

	List<ActiviteCarte> findByNomContainingIgnoreCase(String motCle);

	List<ActiviteCarte> findByCategorieIgnoreCase(String categorie);

	List<ActiviteCarte> findByLieuContainingIgnoreCase(String lieu);

	List<ActiviteCarte> findByDateDebutBetween(LocalDateTime debut, LocalDateTime fin);
}