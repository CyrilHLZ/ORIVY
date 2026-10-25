/* ==========================================================================
   ORIVY — Données fictives des maquettes
   --------------------------------------------------------------------------
   Lieux répartis dans toute la France (coordonnées réelles), sorties,
   utilisateurs. Dans l'application, tout cela viendra de l'API Spring.
   Photos : uniquement les images Unsplash de Constants/categories.js.
   ========================================================================== */
(function () {
  "use strict";

  var photo = function (id, largeur) {
    return "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=" + (largeur || 700) + "&q=75";
  };
  var PHOTOS = {
    monument: "photo-1524492412937-b28074a5d7da",
    culture: "photo-1564399579883-451a5d44ec08",
    parc: "photo-1441974231531-c6227db76b6e",
    promenade: "photo-1551632811-561732d1e306",
    village: "photo-1470770841072-f978cf4d019e",
    observatoire: "photo-1534447677768-be436bb09401",
    sport: "photo-1500534623283-312aade485b7",
    restaurant: "photo-1515003197210-e0cd71810b5f",
    bar: "photo-1515003197210-e0cd71810b5f",
    cinema: "photo-1500534623283-312aade485b7",
    evenement: "photo-1500534623283-312aade485b7",
    autre: "photo-1500534623283-312aade485b7"
  };

  var CATEGORIES = {
    monument: { nom: "Monument", pluriel: "Monuments" },
    culture: { nom: "Musée", pluriel: "Musées" },
    parc: { nom: "Parc", pluriel: "Parcs" },
    promenade: { nom: "Randonnée", pluriel: "Randonnées" },
    village: { nom: "Village", pluriel: "Villages" },
    observatoire: { nom: "Point de vue", pluriel: "Points de vue" },
    sport: { nom: "Sport", pluriel: "Sports" },
    restaurant: { nom: "Restaurant", pluriel: "Restaurants" },
    bar: { nom: "Bar", pluriel: "Bars" },
    cinema: { nom: "Cinéma", pluriel: "Cinémas" },
    evenement: { nom: "Événement", pluriel: "Événements" },
    autre: { nom: "Autre", pluriel: "Autres" }
  };

  /* alt : texte alternatif de la photo (accessibilité) */
  var LIEUX = [
    { id: 1, nom: "Parc de la Tête d'Or", ville: "Lyon 6e", cat: "parc", lat: 45.7772, lng: 4.8550, note: 4.7, sorties: 3, ajout: "2026-09-12", alt: "Allée ombragée sous de grands arbres", description: "117 hectares de verdure en pleine ville : un grand lac, une roseraie, des serres et des pelouses parfaites pour un pique-nique." },
    { id: 2, nom: "Musée des Confluences", ville: "Lyon 2e", cat: "culture", lat: 45.7330, lng: 4.8180, note: 4.6, sorties: 1, ajout: "2026-08-02", alt: "Salle d'exposition lumineuse", description: "Un nuage de verre et d'acier à la pointe de la presqu'île, avec des collections qui racontent l'histoire de l'humanité." },
    { id: 3, nom: "Basilique de Fourvière", ville: "Lyon 5e", cat: "monument", lat: 45.7623, lng: 4.8227, note: 4.8, sorties: 2, ajout: "2026-07-21", alt: "Monument illuminé au crépuscule", description: "La « colline qui prie » domine Lyon : monte à pied par les jardins du Rosaire pour une vue imprenable." },
    { id: 4, nom: "Puy de Dôme", ville: "Orcines", cat: "promenade", lat: 45.7722, lng: 2.9640, note: 4.8, sorties: 4, ajout: "2026-10-01", alt: "Randonneurs sur un sentier de montagne", description: "Le chemin des Muletiers grimpe jusqu'au sommet du volcan : 1 h de montée et un panorama sur toute la chaîne des Puys." },
    { id: 5, nom: "Château de Chambord", ville: "Chambord", cat: "monument", lat: 47.6162, lng: 1.5170, note: 4.8, sorties: 1, ajout: "2026-06-30", alt: "Château aux nombreuses tours", description: "Le plus grand des châteaux de la Loire et son escalier à double révolution, au cœur d'un immense domaine boisé." },
    { id: 6, nom: "Musée du Louvre", ville: "Paris 1er", cat: "culture", lat: 48.8606, lng: 2.3376, note: 4.7, sorties: 5, ajout: "2026-05-14", alt: "Galerie de musée", description: "Des antiquités égyptiennes à la Joconde : prévois de bonnes chaussures et choisis une aile par visite." },
    { id: 7, nom: "Le Grand Rex", ville: "Paris 2e", cat: "cinema", lat: 48.8708, lng: 2.3477, note: 4.5, sorties: 2, ajout: "2026-09-28", alt: "", description: "La plus grande salle de cinéma d'Europe, son plafond étoilé et sa façade Art déco." },
    { id: 8, nom: "Jardin du Luxembourg", ville: "Paris 6e", cat: "parc", lat: 48.8462, lng: 2.3372, note: 4.7, sorties: 2, ajout: "2026-04-03", alt: "Sous-bois lumineux", description: "Chaises vertes, bassin aux voiliers et allées de marronniers : le jardin préféré des Parisiens." },
    { id: 9, nom: "Falaises d'Étretat", ville: "Étretat", cat: "observatoire", lat: 49.7076, lng: 0.1937, note: 4.9, sorties: 3, ajout: "2026-08-19", alt: "Ciel étoilé au-dessus de la mer", description: "Les arches de craie et l'Aiguille, à admirer depuis la falaise d'Amont au coucher du soleil." },
    { id: 10, nom: "Dune du Pilat", ville: "La Teste-de-Buch", cat: "observatoire", lat: 44.5890, lng: -1.2130, note: 4.8, sorties: 1, ajout: "2026-07-07", alt: "Ciel étoilé au-dessus d'un paysage", description: "110 mètres de sable entre la forêt des Landes et le bassin d'Arcachon." },
    { id: 11, nom: "Belvédères du Verdon", ville: "La Palud-sur-Verdon", cat: "observatoire", lat: 43.7760, lng: 6.3410, note: 4.9, sorties: 1, ajout: "2026-06-11", alt: "Ciel étoilé au-dessus d'un canyon", description: "La route des Crêtes enchaîne les belvédères au-dessus du plus grand canyon d'Europe." },
    { id: 12, nom: "Calanque de Sormiou", ville: "Marseille 9e", cat: "promenade", lat: 43.2100, lng: 5.4190, note: 4.8, sorties: 2, ajout: "2026-09-02", alt: "Randonneurs sur un sentier rocheux", description: "Une crique turquoise au bout d'un sentier dans le parc national des Calanques." },
    { id: 13, nom: "Eguisheim", ville: "Eguisheim", cat: "village", lat: 48.0430, lng: 7.3060, note: 4.8, sorties: 1, ajout: "2026-05-27", alt: "Maison au bord d'un lac", description: "Un village alsacien construit en cercles, maisons à colombages et géraniums aux fenêtres." },
    { id: 14, nom: "Rocamadour", ville: "Rocamadour", cat: "village", lat: 44.7990, lng: 1.6180, note: 4.7, sorties: 0, ajout: "2026-04-18", alt: "Village accroché à une falaise", description: "Une cité médiévale accrochée à la falaise, au-dessus du canyon de l'Alzou." },
    { id: 15, nom: "Vieille ville d'Annecy", ville: "Annecy", cat: "village", lat: 45.8992, lng: 6.1290, note: 4.8, sorties: 2, ajout: "2026-10-05", alt: "Chalet au bord d'un lac de montagne", description: "Canaux, ponts fleuris et le Palais de l'Isle, à deux pas du lac le plus pur d'Europe." },
    { id: 16, nom: "Guinguette Chez Gégène", ville: "Joinville-le-Pont", cat: "bar", lat: 48.8170, lng: 2.4800, note: 4.4, sorties: 1, ajout: "2026-06-21", alt: "Terrasse animée le soir", description: "Bal musette au bord de la Marne, friture et accordéon depuis 1918." },
    { id: 17, nom: "Guinguette Chez Alriq", ville: "Bordeaux", cat: "bar", lat: 44.8550, lng: -0.5520, note: 4.5, sorties: 2, ajout: "2026-08-25", alt: "Terrasse animée le soir", description: "Concerts, transats et lampions sur la rive droite de la Garonne." },
    { id: 18, nom: "Crêperie du Sillon", ville: "Saint-Malo", cat: "restaurant", lat: 48.6493, lng: -2.0257, note: 4.6, sorties: 1, ajout: "2026-07-30", alt: "Table dressée en terrasse", description: "Galettes de sarrasin et cidre fermier face à la plage du Sillon." },
    { id: 19, nom: "Bouchon Le Garet", ville: "Lyon 1er", cat: "restaurant", lat: 45.7676, lng: 4.8358, note: 4.5, sorties: 1, ajout: "2026-10-10", alt: "Table dressée en terrasse", description: "Nappes à carreaux, quenelles et tablier de sapeur : un vrai bouchon lyonnais." },
    { id: 20, nom: "Marché de Noël de Strasbourg", ville: "Strasbourg", cat: "evenement", lat: 48.5819, lng: 7.7509, note: 4.7, sorties: 2, ajout: "2026-10-15", alt: "", description: "Le plus ancien marché de Noël de France, du 27 novembre au 24 décembre." },
    { id: 21, nom: "Fête des Lumières", ville: "Lyon", cat: "evenement", lat: 45.7640, lng: 4.8357, note: 4.8, sorties: 3, ajout: "2026-10-18", alt: "", description: "Quatre soirs de décembre où toute la ville s'illumine." },
    { id: 22, nom: "Base nautique de l'Erdre", ville: "Nantes", cat: "sport", lat: 47.2400, lng: -1.5530, note: 4.4, sorties: 1, ajout: "2026-06-04", alt: "", description: "Kayak et paddle sur « la plus belle rivière de France »." },
    { id: 23, nom: "Pont du Gard", ville: "Vers-Pont-du-Gard", cat: "monument", lat: 43.9475, lng: 4.5350, note: 4.8, sorties: 1, ajout: "2026-05-09", alt: "Pont de pierre antique", description: "Un aqueduc romain de 2 000 ans, et une baignade dans le Gardon juste en dessous." },
    { id: 24, nom: "Cité de Carcassonne", ville: "Carcassonne", cat: "monument", lat: 43.2060, lng: 2.3640, note: 4.7, sorties: 0, ajout: "2026-03-22", alt: "Remparts médiévaux", description: "Trois kilomètres de remparts et 52 tours : une ville médiévale intacte." },
    { id: 25, nom: "Cinéma Comœdia", ville: "Lyon 7e", cat: "cinema", lat: 45.7470, lng: 4.8410, note: 4.6, sorties: 1, ajout: "2026-09-09", alt: "", description: "Cinéma indépendant, films en VO et avant-premières avec les équipes." },
    { id: 26, nom: "Parc de la Citadelle", ville: "Lille", cat: "parc", lat: 50.6400, lng: 3.0440, note: 4.5, sorties: 1, ajout: "2026-04-28", alt: "Sous-bois lumineux", description: "Bois, canal et remparts de Vauban, à cinq minutes du centre." }
  ];

  var UTILISATEURS = {
    moi:    { initiales: "CL", nom: "Camille Laurent", ville: "Lyon", couleur: "a", admin: true },
    ines:   { initiales: "IN", nom: "Inès Nakamura", ville: "Lyon", couleur: "c" },
    theo:   { initiales: "TM", nom: "Théo Martin", ville: "Bordeaux", couleur: "d" },
    yanis:  { initiales: "YB", nom: "Yanis Benali", ville: "Lyon", couleur: "b" },
    lea:    { initiales: "LB", nom: "Léa Bernard", ville: "Paris", couleur: "b" },
    sarah:  { initiales: "SD", nom: "Sarah Dubois", ville: "Marseille", couleur: "c" },
    mathis: { initiales: "MR", nom: "Mathis Roux", ville: "Lyon", couleur: "e" },
    arthur: { initiales: "AK", nom: "Arthur Kerjean", ville: "Annecy", couleur: "a" },
    nina:   { initiales: "NG", nom: "Nina Garnier", ville: "Bordeaux", couleur: "d" },
    sami:   { initiales: "SE", nom: "Sami El Amrani", ville: "Lille", couleur: "e" },
    jeanne: { initiales: "JP", nom: "Jeanne Péron", ville: "Nantes", couleur: "b" }
  };

  var SORTIES = [
    { id: 1, titre: "Lever de soleil au puy de Dôme", lieu: 4, date: "2026-10-25T07:00", orga: "ines", inscrits: ["ines", "theo", "yanis", "lea", "sarah", "mathis", "arthur", "nina"], max: 12 },
    { id: 2, titre: "Pique-nique d'automne à la Tête d'Or", lieu: 1, date: "2026-11-01T12:30", orga: "mathis", inscrits: ["mathis", "arthur", "jeanne", "sami", "ines"], max: 10 },
    { id: 3, titre: "Nuit des films d'horreur au Grand Rex", lieu: 7, date: "2026-10-31T20:30", orga: "lea", inscrits: ["lea", "sarah", "nina", "sami", "jeanne", "theo", "yanis", "arthur", "mathis", "ines", "moi"], max: 20 },
    { id: 4, titre: "Coucher de soleil sur les falaises d'Étretat", lieu: 9, date: "2026-11-01T16:45", orga: "theo", inscrits: ["theo", "nina", "sami", "jeanne", "lea", "yanis"], max: 8 },
    { id: 5, titre: "Rando matinale dans les calanques", lieu: 12, date: "2026-11-08T09:00", orga: "sarah", inscrits: ["sarah", "theo", "nina", "lea", "arthur", "sami", "ines", "jeanne", "yanis"], max: 15 },
    { id: 6, titre: "Brunch lyonnais au bouchon", lieu: 19, date: "2026-11-07T11:30", orga: "yanis", inscrits: ["yanis", "moi", "ines", "mathis"], max: 6 },
    { id: 7, titre: "Apéro concert à la guinguette", lieu: 17, date: "2026-10-24T18:30", orga: "nina", inscrits: ["nina", "theo", "sarah", "lea", "jeanne", "sami", "arthur", "mathis", "ines", "yanis", "moi"], max: 25 },
    { id: 8, titre: "Balade dans le vieil Annecy", lieu: 15, date: "2026-11-08T14:00", orga: "arthur", inscrits: ["arthur", "jeanne", "mathis"], max: 10 }
  ];

  /* Grandes villes, pour le champ « Tape ta ville » quand la position est refusée */
  var VILLES = {
    "paris": [48.8566, 2.3522], "lyon": [45.7640, 4.8357], "marseille": [43.2965, 5.3698],
    "bordeaux": [44.8378, -0.5792], "lille": [50.6292, 3.0573], "nantes": [47.2184, -1.5536],
    "toulouse": [43.6047, 1.4442], "strasbourg": [48.5734, 7.7521], "nice": [43.7102, 7.2620],
    "rennes": [48.1173, -1.6778], "montpellier": [43.6108, 3.8767], "clermont-ferrand": [45.7772, 3.0870],
    "annecy": [45.8992, 6.1294], "saint-malo": [48.6493, -2.0257], "grenoble": [45.1885, 5.7245]
  };

  window.ORIVY_DONNEES = {
    photo: function (cat, largeur) { return photo(PHOTOS[cat] || PHOTOS.autre, largeur); },
    CATEGORIES: CATEGORIES,
    LIEUX: LIEUX,
    UTILISATEURS: UTILISATEURS,
    SORTIES: SORTIES,
    VILLES: VILLES,
    lieu: function (id) { return LIEUX.filter(function (l) { return l.id === id; })[0]; }
  };
})();
