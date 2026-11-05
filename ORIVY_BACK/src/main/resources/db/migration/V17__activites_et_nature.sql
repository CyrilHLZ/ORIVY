-- V17 : activités en ville et lieux nature importés d'OpenStreetMap (© OpenStreetMap, ODbL)
-- via OpenStreetMapService. culture (musées), parc, promenade (randonnées), cinema, bowling existent déjà.
INSERT INTO categorie (cle, nom, pluriel, emoji, couleur, ordre) VALUES
('theatre',        'Théâtre',        'Théâtres',          '🎭', '#ad1457', 37),
('escape_game',    'Escape game',    'Escape games',      '🔐', '#5e35b1', 38),
('laser_game',     'Laser game',     'Laser games',       '🔦', '#d81b60', 39),
('trampoline',     'Trampoline',     'Parcs trampoline',  '🤸', '#f9a825', 40),
('mini_golf',      'Mini-golf',      'Mini-golfs',        '⛳', '#7cb342', 41),
('patinoire',      'Patinoire',      'Patinoires',        '⛸️', '#4fc3f7', 42),
('accrobranche',   'Accrobranche',   'Accrobranches',     '🪢', '#689f38', 43),
('escalade',       'Escalade',       'Salles d''escalade', '🧗', '#8d6e63', 44),
('foret',          'Forêt',          'Forêts',            '🌲', '#1b5e20', 45),
('espace_naturel', 'Espace naturel', 'Espaces naturels',  '🦋', '#00897b', 46);

-- Les jardins ne sont plus seulement botaniques : jardins remarquables, publics connus…
UPDATE categorie SET nom = 'Jardin', pluriel = 'Jardins' WHERE cle = 'jardin';
