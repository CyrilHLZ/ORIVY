package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.Suggestion;

public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    // À traiter, de la plus récente à la plus ancienne
    List<Suggestion> findByTraiteFalseOrderByDateCreationDesc();
}
