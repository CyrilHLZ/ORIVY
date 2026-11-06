package fr.orivy.Orivy.Repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import fr.orivy.Orivy.Model.PointInteret;

public interface PointInteretRepository extends JpaRepository<PointInteret, Long> {
    // Sans photo, et pas retirée volontairement par l'admin (photoChoisie)
    List<PointInteret> findByImageUrlIsNullAndPhotoChoisieFalse();

    // Lieux importés d'OpenStreetMap, et ceux saisis dans ORIVY (osmId null)
    long countByOsmIdIsNotNull();
    long countByTypeAndOsmIdIsNotNull(String type);
    List<PointInteret> findByOsmIdIsNotNull();
    List<PointInteret> findByOsmIdIsNull();

    // Carte : tout sauf les catégories servies par zone (restaurants, bars)
    List<PointInteret> findByTypeNotIn(Collection<String> types);

    // Carte : tous les lieux d'un département (« 75 », « 2A », « 974 »)
    List<PointInteret> findByDepartement(String departement);

    // Carte : nombre de lieux par département et par catégorie : [departement, type, nombre]
    @Query("SELECT p.departement, p.type, COUNT(p) FROM PointInteret p WHERE p.departement IS NOT NULL GROUP BY p.departement, p.type")
    List<Object[]> compterParDepartementEtType();

    // Nombre de lieux par catégorie (fenêtre « Catégories » de la carte) : [type, nombre]
    @Query("SELECT p.type, COUNT(p) FROM PointInteret p WHERE p.type IN :types GROUP BY p.type")
    List<Object[]> compterParType(Collection<String> types);
}
