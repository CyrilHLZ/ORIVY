package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.PointInteret;

public interface PointInteretRepository extends JpaRepository<PointInteret, Long> {
    List<PointInteret> findByImageUrlIsNull();
}