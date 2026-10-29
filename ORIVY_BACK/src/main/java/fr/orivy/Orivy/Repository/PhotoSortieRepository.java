package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import fr.orivy.Orivy.Model.PhotoSortie;

@Repository 
public interface PhotoSortieRepository extends JpaRepository<PhotoSortie, Long> {
    List<PhotoSortie> findBySortieIdOrderByDateAjoutDesc(Long sortieId);
}

