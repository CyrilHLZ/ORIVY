package fr.orivy.Orivy.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import fr.orivy.Orivy.Model.PointInteret;

public interface PointInteretRepository extends JpaRepository<PointInteret, Long> {
    // Sans photo, et pas retirée volontairement par l'admin (photoChoisie)
    List<PointInteret> findByImageUrlIsNullAndPhotoChoisieFalse();

    // Lieux importés d'OpenStreetMap, et ceux saisis dans ORIVY (osmId null)
    long countByOsmIdIsNotNull();
    long countByTypeAndOsmIdIsNotNull(String type);
    List<PointInteret> findByOsmIdIsNotNull();
    List<PointInteret> findByOsmIdIsNull();
}
