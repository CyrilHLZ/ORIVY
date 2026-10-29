package fr.orivy.Orivy.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.orivy.Orivy.Model.Sortie;

import java.time.LocalDateTime;
import java.util.List;

public interface SortieRepository extends JpaRepository<Sortie, Long> {

    List<Sortie> findByOrganisateurId(Long id);
    List<Sortie> findByParticipantsId(Long id);
    List<Sortie> findByAttenteId(Long id);
    List<Sortie> findByDateDebutBetween(LocalDateTime debut, LocalDateTime fin);

    @Query("""
        SELECT s FROM Sortie s
        WHERE s.dateDebut >= CURRENT_TIMESTAMP
          AND (LOWER(s.nom) LIKE LOWER(CONCAT('%', :mot, '%'))
            OR LOWER(s.lieu) LIKE LOWER(CONCAT('%', :mot, '%'))
            OR LOWER(s.description) LIKE LOWER(CONCAT('%', :mot, '%')))
        ORDER BY s.dateDebut
        """)
        List<Sortie> rechercher(@Param("mot") String mot);  

}
