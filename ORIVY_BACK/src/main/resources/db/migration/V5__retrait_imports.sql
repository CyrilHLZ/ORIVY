-- V5 : retrait des imports (Monuments historiques, Musées de France)
-- On efface les lieux importés et ce qui pointait vers eux (favoris, avis), puis les colonnes de l'import.
-- On garde photo_choisie (photo changée ou retirée par l'admin) et l'index sur les coordonnées.
DELETE FROM favori      WHERE cible_type = 'point' AND cible_id IN (SELECT id FROM point_interet WHERE source IS NOT NULL);
DELETE FROM commentaire WHERE cible_type = 'point' AND cible_id IN (SELECT id FROM point_interet WHERE source IS NOT NULL);
DELETE FROM point_interet WHERE source IS NOT NULL;

DROP INDEX uk_point_source_id;
ALTER TABLE point_interet DROP COLUMN source;
ALTER TABLE point_interet DROP COLUMN id_externe;
ALTER TABLE point_interet DROP COLUMN maj_externe;
ALTER TABLE point_interet DROP COLUMN date_fin;
ALTER TABLE point_interet DROP COLUMN masque;
