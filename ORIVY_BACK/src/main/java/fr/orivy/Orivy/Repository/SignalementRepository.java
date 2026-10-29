package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.orivy.Orivy.Model.Signalement;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    // « TraiteFalse » : Spring comprend « WHERE traite = false »
    List<Signalement> findByTraiteFalseOrderByDateCreationDesc();

    // Suppression de compte : tout ce qui concerne ce membre
    @Modifying
    @Query("DELETE FROM Signalement s WHERE s.auteur.id = :id")
    void supprimerDuMembre(@Param("id") Long id);
}
