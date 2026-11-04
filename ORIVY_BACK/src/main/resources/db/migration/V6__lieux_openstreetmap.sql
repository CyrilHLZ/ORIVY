-- V6 : lieux importés d'OpenStreetMap (musées, châteaux, plages, points de vue, aquariums, zoos)

-- Identifiant OpenStreetMap du lieu (« node/123 », « way/456 ») : NULL pour les lieux saisis dans ORIVY.
-- Il permet de mettre un lieu à jour à l'import suivant au lieu de le recréer.
ALTER TABLE point_interet ADD COLUMN osm_id VARCHAR(30);
CREATE UNIQUE INDEX uk_point_osm_id ON point_interet (osm_id);

-- Lieux OpenStreetMap supprimés par l'admin : l'import suivant ne doit pas les recréer
CREATE TABLE lieu_osm_retire (
    osm_id VARCHAR(30) PRIMARY KEY
);

-- Nouvelles catégories ; « Autre » reste en dernier
INSERT INTO categorie (cle, nom, pluriel, emoji, couleur, ordre) VALUES
('chateau',  'Château',  'Châteaux',  '🏰', '#9c6644', 13),
('plage',    'Plage',    'Plages',    '🏖️', '#d9a21b', 14),
('aquarium', 'Aquarium', 'Aquariums', '🐠', '#1d8fc9', 15),
('zoo',      'Zoo',      'Zoos et parcs animaliers', '🦁', '#7a9a3a', 16);
UPDATE categorie SET ordre = 99 WHERE cle = 'autre';
