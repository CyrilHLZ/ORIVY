-- V12 : nouvelles catégories. B = importées d'OpenStreetMap (© OpenStreetMap, ODbL) via OpenStreetMapService ;
-- C = Parcs nationaux / Grands Sites de France (Wikidata, CC0) insérés par V13.
INSERT INTO categorie (cle, nom, pluriel, emoji, couleur, ordre) VALUES
('camping',       'Camping',          'Campings',           '⛺',  '#33691e', 27),
('phare',         'Phare',            'Phares',             '🗼',  '#0277bd', 28),
('grotte',        'Grotte',           'Grottes',            '🕳️',  '#4e342e', 29),
('jardin',        'Jardin botanique', 'Jardins botaniques', '🌷',  '#ec407a', 30),
('vignoble',      'Vignoble',         'Vignobles',          '🍇',  '#6a1b9a', 31),
('thermes',       'Thermes',          'Thermes & spas',     '♨️',  '#d84315', 32),
('grand_site',    'Grand Site',       'Grands Sites',       '🏞️',  '#00838f', 33),
('parc_national', 'Parc national',    'Parcs nationaux',    '🌲',  '#2e7d32', 34);
