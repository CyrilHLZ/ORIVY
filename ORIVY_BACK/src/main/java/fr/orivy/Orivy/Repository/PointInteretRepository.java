package fr.orivy.Orivy.Repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import fr.orivy.Orivy.Model.PointInteret;

public interface PointInteretRepository extends JpaRepository<PointInteret, Long> {
    // Lieux saisis dans ORIVY (source null) : les importés sont chargés par zone, voir plus bas
    List<PointInteret> findBySourceIsNull();
    long countBySourceIsNull();
    // Sans photo, et pas retirée volontairement par l'admin (photoChoisie)
    List<PointInteret> findByImageUrlIsNullAndSourceIsNullAndPhotoChoisieFalse();

    // Lieux importés dans la zone affichée sur la carte, toutes catégories ou seulement certaines
    // (sauf ceux que l'admin a supprimés : masque)
    List<PointInteret> findBySourceIsNotNullAndMasqueFalseAndLatitudeBetweenAndLongitudeBetween(
            double sud, double nord, double ouest, double est, Pageable limite);
    List<PointInteret> findBySourceIsNotNullAndMasqueFalseAndTypeInAndLatitudeBetweenAndLongitudeBetween(
            Collection<String> types, double sud, double nord, double ouest, double est, Pageable limite);

    List<PointInteret> findBySource(String source);

    // Lieux importés autour d'un point, du plus proche au plus loin. cos = cos(latitude) :
    // un degré de longitude est plus court qu'un degré de latitude (distance approchée, suffisante pour trier)
    @Query("""
            select p from PointInteret p
            where p.source is not null and p.masque = false and (:type is null or p.type = :type)
              and p.latitude between :sud and :nord and p.longitude between :ouest and :est
            order by (p.latitude - :lat) * (p.latitude - :lat) + (p.longitude - :lng) * (p.longitude - :lng) * :cos * :cos
            """)
    List<PointInteret> autour(double lat, double lng, double cos, double sud, double nord, double ouest, double est,
            String type, Pageable limite);

    // Lieux importés dont le nom contient le texte tapé (choix du lieu d'une sortie)
    List<PointInteret> findTop8BySourceIsNotNullAndMasqueFalseAndNomContainingIgnoreCase(String texte);

    long countBySource(String source);
}
