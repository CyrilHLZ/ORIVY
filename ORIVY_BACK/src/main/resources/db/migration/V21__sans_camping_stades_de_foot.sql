-- V21 : 1) plus de campings sur ORIVY (catégorie et lieux retirés ; l'import OpenStreetMap ne les reprend plus) ;
--       2) nouvelle catégorie « Stades de foot » : les stades des clubs de Ligue 1 et de Ligue 2, saison 2026-2027.
--          Coordonnées : Wikidata (CC0), Nominatim / OpenStreetMap pour Annecy et Laval.
--          Le département de chaque stade est rempli au démarrage par DecoupageService.

-- 1) Campings : d'abord ce qui les vise (avis, favoris), puis les lieux et la catégorie
DELETE FROM commentaire WHERE cible_type = 'point' AND cible_id IN (SELECT id FROM point_interet WHERE type = 'camping');
DELETE FROM favori      WHERE cible_type = 'point' AND cible_id IN (SELECT id FROM point_interet WHERE type = 'camping');
DELETE FROM point_interet WHERE type = 'camping';
UPDATE suggestion SET categorie = NULL WHERE categorie = 'camping';
DELETE FROM categorie WHERE cle = 'camping';

-- 2) Catégorie « Stades de foot »
INSERT INTO categorie (cle, nom, pluriel, emoji, couleur, ordre) VALUES
('stade', 'Stade de foot', 'Stades de foot', '🏟️', '#388e3c', 47);

-- Lens et Lille étaient déjà sur la carte (catégorie « Sport ») : on les range dans la nouvelle catégorie
UPDATE point_interet SET type = 'stade', couleur = '#388e3c', nom = 'Stade Bollaert-Delelis',
    description = 'Stade du RC Lens · Ligue 1', adresse = COALESCE(adresse, 'Lens')
WHERE osm_id IS NULL AND nom = 'Stade Bollaert-Delelis';
UPDATE point_interet SET type = 'stade', couleur = '#388e3c', nom = 'Decathlon Arena – Stade Pierre-Mauroy',
    description = 'Stade du LOSC Lille · Ligue 1', adresse = COALESCE(adresse, 'Villeneuve-d''Ascq')
WHERE osm_id IS NULL AND nom = 'Stade Pierre Mauroy - Decathlon Arena';

INSERT INTO point_interet (nom, type, description, adresse, latitude, longitude, couleur, photo_choisie)
SELECT s.nom, 'stade', s.description, s.adresse, s.latitude, s.longitude, '#388e3c', FALSE
FROM (VALUES
    -- Ligue 1
    ('Parc des Princes', 'Stade du Paris Saint-Germain · Ligue 1', 'Paris', 48.84145, 2.25305),
    ('Groupama Stadium', 'Stade de l''Olympique lyonnais · Ligue 1', 'Décines-Charpieu', 45.765224, 4.982131),
    ('Stade Vélodrome', 'Stade de l''Olympique de Marseille · Ligue 1', 'Marseille', 43.269241, 5.394907),
    ('Roazhon Park', 'Stade du Stade rennais FC · Ligue 1', 'Rennes', 48.10743, -1.71282),
    ('Stade Louis-II', 'Stade de l''AS Monaco · Ligue 1', 'Monaco', 43.727778, 7.415556),
    ('Stade de la Meinau', 'Stade du RC Strasbourg Alsace · Ligue 1', 'Strasbourg', 48.55942, 7.75738),
    ('Stadium de Toulouse', 'Stade du Toulouse FC · Ligue 1', 'Toulouse', 43.583296, 1.434055),
    ('Stade du Moustoir', 'Stade du FC Lorient · Ligue 1', 'Lorient', 47.74869, -3.36929),
    ('Stade Jean-Bouin', 'Stade du Paris FC · Ligue 1', 'Paris', 48.8432, 2.25293),
    ('Stade Francis-Le Blé', 'Stade du Stade brestois 29 · Ligue 1', 'Brest', 48.40293, -4.46148),
    ('Stade Raymond-Kopa', 'Stade d''Angers SCO · Ligue 1', 'Angers', 47.45905, -0.53163),
    ('Stade Océane', 'Stade du Havre AC · Ligue 1', 'Le Havre', 49.4988, 0.1697),
    ('Stade de l''Abbé-Deschamps', 'Stade de l''AJ Auxerre · Ligue 1', 'Auxerre', 47.78672, 3.58871),
    ('Allianz Riviera', 'Stade de l''OGC Nice · Ligue 1', 'Nice', 43.70513, 7.19262),
    ('Stade de l''Aube', 'Stade de l''ESTAC Troyes · Ligue 1', 'Troyes', 48.30616, 4.0982),
    ('Stade Marie-Marvingt', 'Stade du Mans FC · Ligue 1', 'Le Mans', 47.95958, 0.22129),
    -- Ligue 2
    ('Parc des Sports d''Annecy', 'Stade du FC Annecy · Ligue 2', 'Annecy', 45.916893, 6.119222),
    ('Stade de la Libération', 'Stade de l''US Boulogne · Ligue 2', 'Boulogne-sur-Mer', 50.7244, 1.61907),
    ('Stade Gabriel-Montpied', 'Stade du Clermont Foot 63 · Ligue 2', 'Clermont-Ferrand', 45.81584, 3.12162),
    ('Stade Gaston-Gérard', 'Stade du Dijon FCO · Ligue 2', 'Dijon', 47.3261, 5.06793),
    ('Stade Marcel-Tribut', 'Stade de l''USL Dunkerque · Ligue 2', 'Dunkerque', 51.035556, 2.390278),
    ('Stade des Alpes', 'Stade du Grenoble Foot 38 · Ligue 2', 'Grenoble', 45.187474, 5.740194),
    ('Stade de Roudourou', 'Stade de l''En Avant Guingamp · Ligue 2', 'Guingamp', 48.56516, -3.16552),
    ('Stade Francis-Le Basser', 'Stade du Stade lavallois · Ligue 2', 'Laval', 48.082227, -0.754761),
    ('Stade Saint-Symphorien', 'Stade du FC Metz · Ligue 2', 'Longeville-lès-Metz', 49.109945, 6.159532),
    ('Stade de la Mosson', 'Stade du Montpellier HSC · Ligue 2', 'Montpellier', 43.62061, 3.81279),
    ('Stade Marcel-Picot', 'Stade de l''AS Nancy Lorraine · Ligue 2', 'Tomblaine', 48.696, 6.21222),
    ('Stade de la Beaujoire', 'Stade du FC Nantes · Ligue 2', 'Nantes', 47.2561, -1.52466),
    ('Nouste Camp', 'Stade du Pau FC · Ligue 2', 'Bizanos', 43.307677, -0.325234),
    ('Stade Bauer', 'Stade du Red Star FC · Ligue 2', 'Saint-Ouen-sur-Seine', 48.9061, 2.34105),
    ('Stade Auguste-Delaune', 'Stade du Stade de Reims · Ligue 2', 'Reims', 49.24716, 4.02478),
    ('Stade Paul-Lignon', 'Stade du Rodez AF · Ligue 2', 'Rodez', 44.35161, 2.56376),
    ('Stade Geoffroy-Guichard', 'Stade de l''AS Saint-Étienne · Ligue 2', 'Saint-Étienne', 45.460749, 4.390171),
    ('Stade Auguste-Bonal', 'Stade du FC Sochaux-Montbéliard · Ligue 2', 'Montbéliard', 47.51238, 6.81116)
) AS s (nom, description, adresse, latitude, longitude)
WHERE NOT EXISTS (SELECT 1 FROM point_interet p WHERE p.type = 'stade' AND p.nom = s.nom);
