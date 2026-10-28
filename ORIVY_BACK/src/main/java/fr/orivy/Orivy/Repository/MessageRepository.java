package fr.orivy.Orivy.Repository;

import java.util.List;

import fr.orivy.Orivy.Model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    // Les messages entre deux membres, dans les deux sens, du plus ancien au plus récent
    @Query("""
            SELECT m FROM Message m
            WHERE (m.expediteur.id = :a AND m.destinataire.id = :b)
               OR (m.expediteur.id = :b AND m.destinataire.id = :a)
            ORDER BY m.dateEnvoi
            """)
    List<Message> conversation(@Param("a") Long a, @Param("b") Long b);

    // Tous les messages où le membre est l'un des deux (pour la liste des conversations)
    List<Message> findByExpediteurIdOrDestinataireIdOrderByDateEnvoiDesc(Long expediteurId, Long destinataireId);
}
