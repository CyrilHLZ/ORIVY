package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.Commentaire;

public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    List<Commentaire> findByCibleTypeAndCibleId(String cibleType, Long cibleId);
}