-- V3 : lieux importés des offices de tourisme (DATAtourisme)
-- source NULL = lieu saisi dans ORIVY ; 'datatourisme' = lieu importé, mis à jour chaque nuit
ALTER TABLE point_interet ADD COLUMN source      VARCHAR(30);
ALTER TABLE point_interet ADD COLUMN id_externe  VARCHAR(255);   -- identifiant chez la source
ALTER TABLE point_interet ADD COLUMN maj_externe VARCHAR(40);    -- date de mise à jour chez la source
ALTER TABLE point_interet ADD COLUMN date_fin    DATE;           -- événements : dernier jour

CREATE UNIQUE INDEX uk_point_source_id ON point_interet (source, id_externe);
-- La carte charge les lieux de la zone affichée : recherche par coordonnées
CREATE INDEX idx_point_coordonnees ON point_interet (latitude, longitude);
