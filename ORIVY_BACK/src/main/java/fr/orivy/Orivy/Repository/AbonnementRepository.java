package fr.orivy.Orivy.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.Abonnement;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    Optional<Abonnement> findByAbonneIdAndSuiviId(Long abonneId, Long suiviId);
    List<Abonnement> findBySuiviId(Long suiviId);     // ses abonnés
    List<Abonnement> findByAbonneId(Long abonneId);   // ceux qu'il suit
}
