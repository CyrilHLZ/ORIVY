-- V19 : la carte se parcourt par région puis par département (au lieu de charger tous les lieux d'un coup).
-- Chaque lieu connaît son département (rempli par DecoupageService d'après les contours IGN Admin Express).
ALTER TABLE point_interet ADD COLUMN departement VARCHAR(3);
CREATE INDEX idx_point_interet_departement ON point_interet (departement, type);
