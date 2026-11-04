-- V13 : Parcs nationaux de France et Grands Sites de France (Wikidata, CC0 — domaine public).
-- Ajout dé-doublonné par nom (ne réinsère pas un lieu déjà présent).
INSERT INTO point_interet (nom, type, latitude, longitude, couleur, photo_choisie)
SELECT v.nom, v.type, v.lat, v.lon, v.couleur, false
FROM (VALUES
  ('Parc national de Port-Cros','parc_national',43.0041667,6.3952778,'#1b5e20'),
  ('Parc national des Écrins','parc_national',44.8558333,6.2636111,'#1b5e20'),
  ('Parc national de la Vanoise','parc_national',45.3333000,6.8333300,'#1b5e20'),
  ('Parc national de La Réunion','parc_national',-21.1500000,55.5000000,'#1b5e20'),
  ('Parc amazonien de Guyane','parc_national',2.8383333,-53.7722222,'#1b5e20'),
  ('Parc national des Pyrénées','parc_national',42.8275000,-0.1758333,'#1b5e20'),
  ('Parc national de la Guadeloupe','parc_national',16.0833333,-61.6833333,'#1b5e20'),
  ('Parc national des Cévennes','parc_national',44.2000000,3.4000000,'#1b5e20'),
  ('Parc national du Mercantour','parc_national',44.1666667,7.0833333,'#1b5e20'),
  ('Parc national des Calanques','parc_national',43.2094444,5.4491667,'#1b5e20'),
  ('Oppidum de Castel-Coz','grand_site',48.0897200,-4.5206200,'#00838f'),
  ('Montagne Sainte-Victoire','grand_site',43.5391667,5.6452778,'#00838f'),
  ('Puy Mary','grand_site',45.1093000,2.6762528,'#00838f'),
  ('Marais poitevin','grand_site',46.3333333,-0.6666667,'#00838f'),
  ('Aven d''Orgnac','grand_site',44.3225000,4.4119444,'#00838f'),
  ('Puy de Dôme','grand_site',45.7720000,2.9624000,'#00838f'),
  ('Massif du Canigou','grand_site',42.5189019,2.4565596,'#00838f'),
  ('Pointe de la Courte Dune (Audinghen)','grand_site',50.8702230,1.6001053,'#00838f'),
  ('Arsenal de Rochefort','grand_site',45.9351000,-0.9579000,'#00838f'),
  ('Baie de Somme','grand_site',50.2013889,1.6269444,'#00838f'),
  ('Bibracte','grand_site',46.9244000,4.0350000,'#00838f'),
  ('Roche de Solutré','grand_site',46.2991667,4.7191667,'#00838f'),
  ('Pointe du Raz','grand_site',48.0402780,-4.7411110,'#00838f'),
  ('Petite Camargue','grand_site',43.5666667,4.2833333,'#00838f'),
  ('Gorges de l''Hérault','grand_site',43.7080000,3.5570700,'#00838f'),
  ('Grand Site des Dunes de Flandre','grand_site',51.0688889,2.4855556,'#00838f'),
  ('Saint-Guilhem-le-Désert','grand_site',43.7338889,3.5497222,'#00838f'),
  ('Roche de Vergisson','grand_site',46.3142720,4.7160960,'#00838f'),
  ('Grand Site des Deux Caps','grand_site',50.8691000,1.5867500,'#00838f'),
  ('Pont du Gard','grand_site',43.9473000,4.5355000,'#00838f')
) AS v(nom, type, lat, lon, couleur)
WHERE NOT EXISTS (
    SELECT 1 FROM point_interet p WHERE lower(p.nom) = lower(v.nom)
);
