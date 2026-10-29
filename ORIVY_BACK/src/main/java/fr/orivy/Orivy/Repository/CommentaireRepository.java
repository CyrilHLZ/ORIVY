package fr.orivy.Orivy.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import fr.orivy.Orivy.DTO.NoteLieuDto;
import fr.orivy.Orivy.Model.Commentaire;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    List<Commentaire> findByCibleTypeAndCibleId(String cibleType, Long cibleId);

    Optional<Commentaire> findByAuteurIdAndCibleTypeAndCibleId(Long auteurId, String cibleType, Long cibleId);

    // Une ligne par lieu noté. « new … » : JPQL fabrique directement le DTO.
    @Query("SELECT new fr.orivy.Orivy.DTO.NoteLieuDto(c.cibleType, c.cibleId, AVG(c.note), COUNT(c)) "
         + "FROM Commentaire c WHERE c.note IS NOT NULL AND c.cibleType IN ('point', 'activite') "
         + "GROUP BY c.cibleType, c.cibleId")
    List<NoteLieuDto> notesDesLieux();

    // Suppression de compte : tout ce qui concerne ce membre
    @Modifying
    @Query("DELETE FROM Commentaire c WHERE c.auteur.id = :id")
    void supprimerDuMembre(@Param("id") Long id);
}
