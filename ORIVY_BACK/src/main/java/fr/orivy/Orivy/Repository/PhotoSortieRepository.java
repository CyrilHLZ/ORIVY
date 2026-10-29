package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.PhotoSortie;

public interface PhotoSortieRepository extends JpaRepository<PhotoSortie, Long> {
    List<PhotoSortie> findBySortieIdOrderByDateAjoutDesc(Long sortieId);

    // Pageable = « donne-moi la page n°X de 10 » (LIMIT / OFFSET en SQL, écrit par Spring)
    List<PhotoSortie> findAllByOrderByDateAjoutDesc(Pageable page);
    List<PhotoSortie> findByAuteurIdInOrderByDateAjoutDesc(List<Long> auteurs, Pageable page);
}

