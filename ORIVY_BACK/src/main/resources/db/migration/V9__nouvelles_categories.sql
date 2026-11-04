-- V9 : nouvelles catégories de lieux (importées d'OpenStreetMap — voir OpenStreetMapService).
-- cinema, zoo, aquarium existent déjà (V2). On ajoute les autres.
INSERT INTO categorie (cle, nom, pluriel, emoji, couleur, ordre) VALUES
('unesco',         'Site UNESCO',     'Sites UNESCO',      '🌍', '#8e24aa', 17),
('parc_loisir',    'Parc de loisirs', 'Parcs de loisirs',  '🎢', '#ef6c00', 18),
('parc_aquatique', 'Parc aquatique',  'Parcs aquatiques',  '🌊', '#00acc1', 19),
('piscine',        'Piscine',         'Piscines',          '🏊', '#0097a7', 20),
('montagne',       'Montagne',        'Montagnes',         '⛰️', '#6d4c41', 21),
('cascade',        'Cascade',         'Cascades',          '💧', '#26a69a', 22),
('circuit',        'Circuit',         'Circuits',          '🏁', '#455a64', 23),
('bowling',        'Bowling',         'Bowlings',          '🎳', '#3f51b5', 24),
('karting',        'Karting',         'Kartings',          '🏎️', '#c62828', 25),
('paintball',      'Paintball',       'Paintballs',        '🔫', '#558b2f', 26);
