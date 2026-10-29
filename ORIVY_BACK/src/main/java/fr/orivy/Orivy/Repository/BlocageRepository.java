package fr.orivy.Orivy.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.orivy.Orivy.Model.Blocage;

public interface BlocageRepository extends JpaRepository<Blocage, Long> {
    Optional<Blocage> findByBloqueurIdAndBloqueId(Long bloqueurId, Long bloqueId);
    boolean existsByBloqueurIdAndBloqueId(Long bloqueurId, Long bloqueId);
    List<Blocage> findByBloqueurId(Long bloqueurId);

    // Suppression de compte : tout ce qui concerne ce membre (dans les deux sens)
    @Modifying
    @Query("DELETE FROM Blocage b WHERE b.bloqueur.id = :id OR b.bloque.id = :id")
    void supprimerDuMembre(@Param("id") Long id);
}
