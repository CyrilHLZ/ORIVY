package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.Signalement;

public interface SignalementRepository extends JpaRepository<Signalement, Long> {
    // « TraiteFalse » : Spring comprend « WHERE traite = false »
    List<Signalement> findByTraiteFalseOrderByDateCreationDesc();
}
