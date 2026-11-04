-- V16 : reclassement des lieux curés d'après leur nom (tri par catégorie).
-- Par NOM (reproductible), uniquement osm_id IS NULL, sans toucher parc_national/grand_site/zoo/aquarium/unesco.

UPDATE point_interet SET type='bowling', couleur='#3f51b5'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'bowling' AND nom IN (
  'Aquatic & Bowling Center',
  'Balade sur la Scarpe, possibilité d''aller au cinéma, à la piscine, au bowling, et plein d''autres..',
  'Bowling La Sphère',
  'Bowling Stadium Niort',
  'Bowling de Chauray',
  'Bowling de La Rochelle',
  'Bowling de Saintes');

UPDATE point_interet SET type='cascade', couleur='#26a69a'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'cascade' AND nom IN (
  'Cascade',
  'Cascade d''Ars',
  'Cascade d''Autoire',
  'Cascade de Bialet',
  'Cascade de La comté',
  'Cascade de Pommiers',
  'Cascade de pont christ',
  'Cascade des Tufs');

UPDATE point_interet SET type='chateau', couleur='#9c6644'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'chateau' AND nom IN (
  'Château de Kergournadeac''h',
  'Château de Kergroadez',
  'Château de Kerouzéré',
  'Château de Keruzoret',
  'Château de Penhoat',
  'Château du Taureau',
  'Château-Chalon');

UPDATE point_interet SET type='circuit', couleur='#455a64'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'circuit' AND nom IN (
  'Bernugat - Circuit des Pins',
  'Circuit Val de Vienne',
  'Circuit de Bourges Allogny',
  'Circuit de Croix-en-Ternois',
  'Circuit de l''Indre',
  'Circuit de l''Orb à l''Escandorgue',
  'Circuit des 24 Heures du Mans',
  'Circuit d’Orléans Sougy',
  'Motorsport Academy - Circuit de Fontenay le Comte');

UPDATE point_interet SET type='culture', couleur='#b5527a'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'culture' AND nom IN (
  'Cité de Carcassonne',
  'Cité de l''espace',
  'Familia Théâtre',
  'La Chartreuse de Neuville',
  'La Chartreuse du Liget',
  'La Cité de la Mer',
  'Lille Grand Palais',
  'Maison de la magie Robert-Houdin',
  'Opéra de Lille',
  'Palais Ducal de Nevers',
  'Palais Idéal du Facteur Cheval',
  'Palais Jacques Cœur',
  'Palais du Capitole',
  'Palais du Littoral',
  'Théâtre Sebastopol',
  'Théâtre de Béthune',
  'Théâtre de l''Aventure',
  'Théâtre de verdure',
  'Théâtre gallo-romain des Bouchauds');

UPDATE point_interet SET type='grotte', couleur='#4e342e'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'grotte' AND nom IN (
  'Gouffre de Padirac',
  'Gouffre de Poudrey',
  'Grotte de Choranche',
  'Grotte de Lascaux',
  'Grotte de Villars',
  'Grotte de Vouvant (1958)',
  'Grotte de la Cathédrale',
  'La Grotte de Dargilan');

UPDATE point_interet SET type='karting', couleur='#c62828'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'karting' AND nom IN (
  'City Kart - Karting Outdoor à Nantes',
  'Family Fun Kart',
  'Karting Club Gravelinois',
  'Opale Karting',
  'Racing Kart 79 , Karting Chauray',
  'Speed Fun Karting, Karting Niortais');

UPDATE point_interet SET type='lac', couleur='#039be5'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'lac' AND nom IN (
  'Baignade du Lac de Maine',
  'Base nautique et de pleine nature Lac de Saint Pardoux',
  'Etang du mesqueau',
  'Lac Mayeux',
  'Lac beugin',
  'Lac d''Ardres',
  'Lac d''Oô',
  'Lac de Bairon',
  'Lac de Châteauneuf-la-Forêt',
  'Lac de Finfarine',
  'Lac de Grand-Lieu - Canal du Grand Port',
  'Lac de Grand-Lieu - Pierres Aiguës',
  'Lac de Haute-Charente',
  'Lac de Kerveguen',
  'Lac de Léry-Poses',
  'Lac de Sainte-Hélène',
  'Lac de St Pardoux',
  'Lac de Taure',
  'Lac de Téteghem',
  'Lac de Verruyes',
  'Lac de la Sourderie',
  'Lac des Trois Provinces',
  'Lac des oiseaux',
  'Lac du Château',
  'Lac du Montagnon',
  'Lac du Salagou',
  'Le Lac Bleu',
  'Les Étangs - Grange',
  'Les étangs d''Annezin',
  'Observatoire du lac de la Gourde',
  'Plan d''eau',
  'Plan d''eau Les Galiotes',
  'Plan d''eau de Sainte-Foy',
  'Plan d''eau des trois fontaines',
  'Plan d''eau du Val Jégu',
  'Plateforme d’observation ornithologique du lac de Maine',
  'Port miniature lac de Frace',
  'Promenade du Lac de la Bergeonnerie',
  'Randonnée au lac de la Gourde',
  'lac baignable',
  'Étang Wagnier',
  'Étang de la Minière',
  'Étang de pêche de saint Firmin',
  'Étang des 4 fils aymon',
  'Étang des Châteliers',
  'Étang du Trou d''Argile',
  'Étang vert');

UPDATE point_interet SET type='memoire', couleur='#546e7a'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'memoire' AND nom IN (
  'Australian Mémorial Park',
  'Base sous-marine de Saint-Nazaire',
  'Batterie Oldenburg',
  'Batterie Osteck',
  'Batterie Waldam',
  'Blockhaus',
  'Blockhaus V1 Siracourt',
  'Bunker allemand',
  'Bunker tombé',
  'Carrière Wellington, Mémorial de la Bataille d''Arras',
  'La batterie de Gonvel',
  'La batterie de l’Aber-Ildut',
  'Le Blockhaus d''Eperlecques',
  'Le Bunker de La Rochelle (Musée)',
  'Le Grand Blockhaus',
  'Mur de fortification',
  'Musée du Blockhaus Hôpital',
  'Musée du Mur de l''Atlantique - Batterie Todt',
  'Mémorial Indien de Neuve-Chapelle',
  'Mémorial Indochine et Corée',
  'Mémorial National du Canada à Vimy',
  'Mémorial de l''Armistice',
  'Mémorial de la bataille d''Azincourt',
  'Mémorial des Finistériens-Fort Montbarey',
  'Tranchées préservées - Mémorial national du Canada à Vimy',
  'WN 165 Frundsberg (blockhaus de la pointe du Riden)',
  'blockhaus fort de l''Ève');

UPDATE point_interet SET type='monument', couleur='#ef6f61'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'monument' AND nom IN (
  'Arc de Germanicus',
  'Arc de Triomphe',
  'Barrage de Moulin Papon',
  'La Promenade des Remparts',
  'Le Vieux-Moulin de Vernon',
  'Le moulin',
  'Les remparts',
  'Moulin de Gazeau',
  'Moulin de Recques sur Course',
  'Porte de Paris',
  'Promenade Charles Dickens - Les remparts',
  'Remparts de Provins');

UPDATE point_interet SET type='observatoire', couleur='#5468c9'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'observatoire' AND nom IN (
  'Descente pointe Barbette',
  'La Pointe De Congrigoux',
  'La Pointe aux Oies',
  'La pointe du Payré',
  'Pointe De La Pierre Plate Criques',
  'Pointe de Penvins',
  'Pointe du Mignot',
  'Table d''orientation Nieul-sur-Mer');

UPDATE point_interet SET type='parc_loisir', couleur='#ef6c00'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'parc_loisir' AND nom IN (
  'Futuroscope',
  'Labyrinthe Gastes - Labyrinthe de maïs - Corn maze',
  'Labyrinthe Géant des Monts de Guéret - ENTREPRISE FRÉRY',
  'Labyrinthe de Beaugency (45)');

UPDATE point_interet SET type='plage', couleur='#d9a21b'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'plage' AND nom IN (
  'La Plage du Koréjou',
  'Plage Boutrouilles',
  'Plage Fanal neizvran',
  'Plage Karreck Hir',
  'Plage Nodeven Ruduloc',
  'Plage Roc''h ar gonc',
  'Plage d''Erleac''h',
  'Plage de Bassinic',
  'Plage de Créac''h an Avel',
  'Plage de Guévroc',
  'Plage de Ker Emma',
  'Plage de Keradraon',
  'Plage de Kerbrat',
  'Plage de Kerfiat',
  'Plage de Kerfissien',
  'Plage de Kerlouan',
  'Plage de Menfig',
  'Plage de Ménez Ham',
  'Plage de Porspol',
  'Plage de Porzafouennec',
  'Plage de Redan',
  'Plage de Sainte-Anne',
  'Plage de Toul an Ouch',
  'Plage de Vilin Izella',
  'Plage des galets d’Armorique',
  'Plage du Drennec',
  'Plage du Guillec',
  'Plage du Trez Hir',
  'Plage du Vag Du',
  'Plage du Zorn',
  'Plage publique du Drennec');

UPDATE point_interet SET type='promenade', couleur='#3c5960'
WHERE osm_id IS NULL AND type NOT IN ('parc_national','grand_site','zoo','aquarium','unesco')
  AND type <> 'promenade' AND nom IN (
  'Ancienne ligne de chemin de fer La Châtre, BRIANTE',
  'Balade en bateau sur la Loire Endremage',
  'Chemin de Fer de la Baie de Somme - Gare de Saint-Valery-Ville',
  'Chemin de Fer de la Baie de Somme - Gare du Crotoy',
  'Chemin de la Montagne',
  'La balade des autruches',
  'Promenade des Moulins du Loiret',
  'Promenade du bord de l''Indre - Entrée Nord',
  'Quais et chemin de halage de Coulon');
