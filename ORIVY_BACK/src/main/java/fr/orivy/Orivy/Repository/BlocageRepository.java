package fr.orivy.Orivy.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.Blocage;

public interface BlocageRepository extends JpaRepository<Blocage, Long> {
    Optional<Blocage> findByBloqueurIdAndBloqueId(Long bloqueurId, Long bloqueId);
    boolean existsByBloqueurIdAndBloqueId(Long bloqueurId, Long bloqueId);
    List<Blocage> findByBloqueurId(Long bloqueurId);
}
