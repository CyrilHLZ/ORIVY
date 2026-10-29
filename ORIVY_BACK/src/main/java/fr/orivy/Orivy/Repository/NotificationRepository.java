package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import fr.orivy.Orivy.Model.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinataireIdOrderByDateCreationDesc(Long destinataireId);
    long countByDestinataireIdAndLueFalse(Long destinataireId);

    // Suppression de compte : tout ce qui concerne ce membre
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.destinataire.id = :id")
    void supprimerDuMembre(@Param("id") Long id);
}
