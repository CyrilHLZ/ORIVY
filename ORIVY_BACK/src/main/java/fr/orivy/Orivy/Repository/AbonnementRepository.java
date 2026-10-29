package fr.orivy.Orivy.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.orivy.Orivy.Model.Abonnement;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    Optional<Abonnement> findByAbonneIdAndSuiviId(Long abonneId, Long suiviId);
    List<Abonnement> findBySuiviId(Long suiviId);     // ses abonnés
    List<Abonnement> findByAbonneId(Long abonneId);   // ceux qu'il suit

    // Suppression de compte : tout ce qui concerne ce membre (ceux qu'il suit ET ceux qui le suivent)
    @Modifying
    @Query("DELETE FROM Abonnement a WHERE a.abonne.id = :id OR a.suivi.id = :id")
    void supprimerDuMembre(@Param("id") Long id);
}
