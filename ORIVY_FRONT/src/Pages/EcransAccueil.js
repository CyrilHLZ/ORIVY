/*
 * Contenu des écrans de catégorie de l'accueil (maquette design/maquettes/accueil.html).
 * Une entrée par écran : c'est ici qu'on change un texte, pas dans le JSX.
 * cle : catégorie (badge, couleur, lien vers la carte filtrée).
 * fond : photo plein écran (facultatif) ; sinon, l'illustration au trait (illu) dans un cadre.
 * cadrage : point de la photo à garder visible (object-position).
 * carte   : où poser la carte de texte sur ordinateur, pour ne cacher ni les gens ni le sujet
 * ambiance : animation posée sur la photo : "lumiere" (défaut), "grains", "feuilles", "oiseaux" ou "aucune".
 * ratio   : largeur / hauteur de la photo.
 * effets  : animations posées sur des points précis de la photo, en % DE L'IMAGE
 *           (voir PhotoAnimee.jsx). Les numéros renvoient à la liste des 100 propositions.
 *           ("bas-gauche" par défaut, "bas-droite", "haut-gauche", "haut-droite").
 * variantes : autres photos selon le moment (voir ecranDuMoment, en bas du fichier).
 * etoiles       : les étoiles scintillent sur cette photo (réservé aux photos DE NUIT ; les autres n'en ont pas).
 * etoilesSeules : comme etoiles, et rien d'autre de la couche de saison (pas de flocons, pétales, feuilles…).
 * floconsSeuls  : seulement les flocons de neige (l'icône flocon.svg) qui tombent sur la photo.
 * Une variante sans « theme » vaut à toute heure (ex. la neige en hiver) : on met la nuit AVANT elle.
 *           { theme: 'nuit', saisons: ['hiver', 'noel'], fond, ratio, effets, alt } : la 1re qui correspond gagne.
 * Les illustrations sont importées : Vite leur donne une adresse unique au build.
 */
import musee from '../Style/illustrations/musee.svg';
import parc from '../Style/illustrations/parc.svg';
import randonnee from '../Style/illustrations/randonnee.svg';
import village from '../Style/illustrations/village.svg';
import pointDeVue from '../Style/illustrations/point-de-vue.svg';
import restaurant from '../Style/illustrations/restaurant.svg';
import bar from '../Style/illustrations/bar.svg';
import cinema from '../Style/illustrations/cinema.svg';
import evenement from '../Style/illustrations/evenement.svg';
import monument from '../Style/illustrations/monument.svg';
// Fonds photo plein écran (fournis par l'utilisateur ; « MUSÉE » gravé sur la façade)
import fondMusee from '../Style/fonds/musee.jpg';
import fondRestaurant from '../Style/fonds/restaurant.jpg';
import fondMonument from '../Style/fonds/monument.jpg';
import fondParc from '../Style/fonds/parc.jpg';
import fondPromenade from '../Style/fonds/promenade.jpg';
import fondVillage from '../Style/fonds/village.jpg';
import fondPointDeVue from '../Style/fonds/point-de-vue.jpg';
import fondBar from '../Style/fonds/bar.jpg';
import fondCinema from '../Style/fonds/cinema.jpg';
import fondEvenement from '../Style/fonds/evenement.jpg';
// Versions de nuit (fournies par l'utilisateur le 2026-10-29) : en hiver, sous la neige
import fondMonumentNuit from '../Style/fonds/monument-nuit.jpg';
import fondMonumentNuitHiver from '../Style/fonds/monument-nuit-hiver.jpg';
import fondParcNuit from '../Style/fonds/parc-nuit.jpg';
import fondParcNuitHiver from '../Style/fonds/parc-nuit-hiver.jpg';
import fondPromenadeNuit from '../Style/fonds/promenade-nuit.jpg';
import fondPromenadeHiver from '../Style/fonds/promenade-hiver.jpg';
// Fonds des pages connexion / inscription (fournis par l'utilisateur le 2026-10-25 : tout le monde de dos)
import fondConnexion from '../Style/fonds/connexion.jpg';
import fondInscription from '../Style/fonds/inscription.jpg';

/* Effets communs aux deux nuits du château (même cadrage en été et en hiver) */
const EFFETS_MONUMENT_NUIT = [
    // Pas de scintillements sur l'étang ni de lucioles : retirés le 2026-10-29 (points lumineux)
    { type: 'ondes', points: [{ x: 23.7, y: 88.4 }, { x: 30.2, y: 91.5 }] },        // autour des barques
    { type: 'flamme', x: 23.6, y: 87.4 },                                           // les lanternes des barques
    { type: 'flamme', x: 30.6, y: 90.4 },
    { type: 'lampes', points: [{ x: 97, y: 48.6, t: 6 }, { x: 74, y: 69.4, t: 2.5 }, { x: 79.4, y: 72.8, t: 2.5 }, { x: 88.6, y: 67.4, t: 2.5 }] },
    // Pas de halos sur les fenêtres : la photo de nuit les montre déjà allumées
];

export const ECRANS = [
    { cle: 'culture', illu: musee, fond: fondMusee, ratio: 1672 / 941,
      effets: [
        { type: 'soleil', x: 39.2, y: 58, t: 12 },                                    // au fond de l'allée, entre la fontaine et le couple
        { type: 'lampes', points: [{ x: 69.7, y: 52, t: 4 }, { x: 89.2, y: 15, t: 7 }] }, // (8) aucun halo sur les bords gauche et droit
        { type: 'petales', x: 0, y: 76, l: 24, h: 20 },                               // (9) hortensias
        // (51) fenêtres retirées le 2026-10-29 : les halos tombaient à côté des fenêtres
      ], cadrage: '72% 60%', ambiance: 'feuilles', alt: 'Place parisienne au coucher du soleil, fontaine et façade haussmannienne marquée Musée', badge: 'Musées & culture', titre: 'Laisse-toi surprendre',
      texte: "Des grands musées parisiens aux petites collections de province, il y a toujours une salle qui t'attend.", bouton: 'Vois les musées sur la carte' },
    { cle: 'parc', illu: parc, fond: fondParc, ratio: 1672 / 941,
      effets: [
        // Effets lumineux retirés le 2026-10-27 (soleil, réverbères, statues, fenêtres, bassin doré, pollen, halo)
        { type: 'nuages', x: 5, y: 2, l: 75, h: 26 },                                 // (28)
        { type: 'papillons', x: 12, y: 68, l: 16, h: 14 },                            // (27) au-dessus de la lavande
        { type: 'papillons', x: 74, y: 68, l: 14, h: 14 },
      ], cadrage: '50% 60%', carte: 'haut-droite', ambiance: 'aucune',
      // La nuit : aucune animation, seulement les étoiles qui scintillent (etoilesSeules, choix du 2026-10-29)
      variantes: [
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondParcNuitHiver, ratio: 1670 / 941, effets: [], etoilesSeules: true,
          alt: "Couple main dans la main dans l'allée enneigée d'un jardin à la française, sous la pleine lune, château illuminé" },
        { theme: 'nuit', fond: fondParcNuit, ratio: 1670 / 941, effets: [], etoilesSeules: true,
          alt: "Couple main dans la main dans l'allée fleurie d'un jardin à la française, sous la pleine lune, château illuminé" },
      ],
      alt: "Couple main dans la main dans l'allée d'un jardin à la française, bassin, statues et château au coucher du soleil", badge: 'Parcs & jardins', titre: 'Respire au vert',
      texte: 'Une pelouse, un grand arbre, un pique-nique entre amis : le bonheur tient parfois à peu de chose.', bouton: 'Vois les parcs sur la carte' },
    { cle: 'promenade', illu: randonnee, fond: fondPromenade, ratio: 1376 / 768,
      effets: [
        { type: 'nuages', x: 0, y: 18, l: 100, h: 18 },                               // (28)
        { type: 'herbes', x: 0, y: 84, l: 36, h: 16 },                                // (25)
        { type: 'herbes', x: 60, y: 84, l: 40, h: 16 },                               // (25)
        { type: 'fleurs', points: [{ x: 12, y: 92 }, { x: 30, y: 96 }, { x: 64, y: 84 }, { x: 70, y: 94 }, { x: 88, y: 97 }] }, // (26)
        { type: 'papillons', x: 2, y: 80, l: 16, h: 14 },                             // (27) à gauche, en bas
        { type: 'papillons', x: 82, y: 80, l: 16, h: 14 },                            // (27) à droite, en bas
      ], cadrage: '50% 55%', carte: 'haut-droite', ambiance: 'feuilles',
      variantes: [
        // La nuit (toute l'année) : la pleine lune brille et les étoiles scintillent
        { theme: 'nuit', fond: fondPromenadeNuit, ratio: 1376 / 768, ambiance: 'aucune', etoilesSeules: true,
          effets: [{ type: 'lune', x: 42.9, y: 21.9, t: 12 }],
          alt: 'Deux randonneurs sur un sentier vers le puy de Dôme, panneau GR4 Auvergne, sous la pleine lune et les étoiles' },
        // L'hiver, le reste du temps : le puy sous la neige, et des flocons qui tombent
        { saisons: ['hiver', 'noel'], fond: fondPromenadeHiver, ratio: 1376 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [{ type: 'nuages', x: 30, y: 15, l: 70, h: 18 }],
          alt: 'Deux randonneurs en raquettes sur un sentier enneigé vers le puy de Dôme, panneau GR4 Auvergne, ciel bleu' },
      ],
      alt: 'Deux randonneurs sur un sentier vers le puy de Dôme, panneau GR4 Auvergne, au coucher du soleil', badge: 'Randonnées', titre: 'Prends de la hauteur',
      texte: 'Sentiers de crête, chemins côtiers, balades en forêt : enfile tes chaussures, la France est à toi.', bouton: 'Vois les randonnées sur la carte' },
    { cle: 'village', illu: village, fond: fondVillage, ratio: 1672 / 941,
      effets: [
        { type: 'nuages', x: 36, y: 8, l: 46, h: 18 },                                // (28)
        { type: 'soleil', x: 71.5, y: 28.5, t: 11 },
        { type: 'lampes', points: [{ x: 30.8, y: 21.8, t: 6 }, { x: 44, y: 47, t: 3 }] }, // lanternes de la ruelle
        { type: 'petales', x: 4, y: 15, l: 22, h: 25, couleur: '#C2185B' },           // (23) bougainvillier
        { type: 'papillons', x: 13, y: 54, l: 14, h: 14 },                            // (27) autour de la lavande
        { type: 'ondes', points: [{ x: 90.6, y: 83 }] },                               // là où le filet d'eau touche le bassin
        { type: 'fenetres', points: [{ x: 31.7, y: 50 }, { x: 22.5, y: 18 }] },       // (51)
      ], cadrage: '50% 55%', carte: 'haut-droite', alt: "Couple main dans la main dans une ruelle pavée de village provençal, bougainvilliers et clocher au coucher du soleil", badge: 'Villages', titre: 'Flâne dans les ruelles',
      texte: "Pierres dorées, volets colorés et marchés du dimanche : les plus beaux villages n'attendent que toi.", bouton: 'Vois les villages sur la carte' },
    { cle: 'observatoire', illu: pointDeVue, fond: fondPointDeVue, ratio: 1671 / 941,
      effets: [
        { type: 'nuages', x: 0, y: 0, l: 100, h: 22 },                                // (28)
        { type: 'rougeoie', x: 0, y: 0, l: 100, h: 29 },                              // (2) le ciel rougit
        { type: 'soleil', x: 82.2, y: 25.8, t: 12, descend: true },                   // (2) le halo glisse vers l'horizon
        { type: 'voilier', x: 62, y: 24.5, l: 38, h: 4 },                             // (1) un voilier passe au loin
        { type: 'phare', x: 61.8, y: 28.6 },                                          // (3) la nuit, au bout de la falaise
        { type: 'fleurs', points: [{ x: 4.8, y: 64 }, { x: 19.4, y: 86 }, { x: 65.8, y: 89 }, { x: 89.4, y: 90 }] }, // (4)
        { type: 'hirondelles', x: 73, y: 38, echelle: 0.55 },                         // (5) mouettes autour de l'Aiguille
        { type: 'hirondelles', x: 62, y: 20 },                                        // mouettes au loin
        // (51) fenêtres du village retirées le 2026-10-29
      ], cadrage: '60% 50%', carte: 'haut-gauche', alt: "Couple assis dans l'herbe en haut des falaises d'Étretat, face à l'Aiguille et au soleil couchant", badge: 'Points de vue', titre: 'Admire le panorama',
      texte: 'Falaises d\'Étretat, dune du Pilat, belvédères du Verdon : vis les couchers de soleil en grand.', bouton: 'Vois les points de vue sur la carte' },
    { cle: 'restaurant', illu: restaurant, fond: fondRestaurant, ratio: 1376 / 768,
      effets: [
        { type: 'flamme', x: 50.3, y: 79 },                                           // (11) bougie
        { type: 'vapeur', x: 52.2, y: 82 },                                           // (12) au-dessus de l'assiette (pas de tasse sur la photo)
        { type: 'neon', x: 75, y: 3, l: 24.5, h: 20 },                                // (14) enseigne ORIVY
        { type: 'lampes', points: [{ x: 12, y: 30.6, t: 6 }] },
        { type: 'fenetres', points: [{ x: 2, y: 21 }, { x: 11.6, y: 21 }, { x: 2.5, y: 43 }, { x: 11.6, y: 43 }, { x: 62, y: 33 }] }, // (51)
      ], cadrage: '62% 60%', ambiance: 'feuilles', alt: 'Couple en terrasse du bistrot Chez Orivy, place parisienne au coucher du soleil', badge: 'Restaurants', titre: 'Mets les pieds sous la table',
      texte: 'Bistrots de quartier, tables de chef et crêperies : partage un bon repas à plusieurs.', bouton: 'Vois les restaurants sur la carte' },
    { cle: 'bar', illu: bar, fond: fondBar, ratio: 1672 / 941,
      effets: [
        { type: 'soleil', x: 62.1, y: 43.8, t: 10 },
        { type: 'guirlande', points: [{ x: 40, y: 8.3 }, { x: 31, y: 15.6 }, { x: 25.4, y: 19.3 }, { x: 18.4, y: 22.8 }, { x: 15.7, y: 11.7 }, { x: 9.3, y: 15.6 }, { x: 5.4, y: 24.7 }] },
        { type: 'lampes', points: [{ x: 9.4, y: 27.8, t: 5 }, { x: 13.3, y: 36.7, t: 4 }, { x: 96, y: 13.8, t: 7 }] },
        { type: 'lampes', points: [{ x: 39.2, y: 52.6, t: 2.5 }, { x: 47, y: 53, t: 2.5 }, { x: 54.4, y: 53.7, t: 2.5 }, { x: 62.5, y: 54.2, t: 2.5 }] }, // le pont s'éclaire
        { type: 'flamme', x: 7.3, y: 77.9 },                                          // (11) bougies
        { type: 'flamme', x: 50.1, y: 85 },
        // (51) fenêtres retirées le 2026-10-29 : les halos tombaient à côté des fenêtres
      ], cadrage: '55% 55%', carte: 'bas-droite', ambiance: 'feuilles', alt: "Couple attablé à la terrasse d'une guinguette au bord du fleuve, pont et cathédrale au coucher du soleil", badge: 'Bars', titre: 'Trinque en terrasse',
      texte: 'Guinguettes au bord de l\'eau, bars à vin, toits-terrasses : profite de la soirée avec ta bande.', bouton: 'Vois les bars sur la carte' },
    { cle: 'cinema', illu: cinema, fond: fondCinema, ratio: 1365 / 768,
      effets: [
        { type: 'neon', x: 49.5, y: 18, l: 4.5, h: 31 },                              // (14) les lettres « CINÉMA »
        { type: 'chenillard', points: [
            { x: 41, y: 61 }, { x: 45.4, y: 60 }, { x: 49.8, y: 58.6 }, { x: 54.2, y: 57.3 }, { x: 58.6, y: 56.2 }, { x: 63, y: 55.3 },
            { x: 43.2, y: 58 }, { x: 47.6, y: 56.9 }, { x: 52, y: 55.7 }, { x: 56.4, y: 54.7 }, { x: 60.8, y: 53.9 }, { x: 65, y: 53.2 },
        ] },                                                                           // la marquise
        { type: 'reflet', x: 76.5, y: 64, l: 8.5, h: 20 },                            // (13) la lumière glisse sur l'affiche
        { type: 'lampes', points: [{ x: 87, y: 10.2, t: 9 }, { x: 12.1, y: 51.4, t: 4 }, { x: 18.7, y: 67.7, t: 2.5 }, { x: 5.9, y: 68.4, t: 2.5 }, { x: 22.3, y: 69.7, t: 2 }] },
        // (51) fenêtres de la façade retirées le 2026-10-29 : les halos tombaient à côté des arcades
      ], cadrage: '50% 50%', carte: 'haut-gauche', ambiance: 'feuilles', alt: "Couple devant la façade illuminée d'un grand cinéma parisien, pavés mouillés et ciel orangé", badge: 'Cinémas', titre: 'Fais-toi une toile',
      texte: 'Salles Art déco, cinémas de quartier, séances en plein air : le grand écran, c\'est mieux ensemble.', bouton: 'Vois les cinémas sur la carte' },
    { cle: 'evenement', illu: evenement, fond: fondEvenement, ratio: 1672 / 941,
      effets: [
        { type: 'lampes', points: [
            { x: 2.9, y: 10.6, t: 8 }, { x: 25.1, y: 18, t: 6 }, { x: 18.5, y: 23.6, t: 5 }, { x: 41.3, y: 17.5, t: 6 }, { x: 54.1, y: 12.8, t: 6 },
            { x: 13.5, y: 25.5, t: 4 }, { x: 21.1, y: 32.4, t: 3.5 }, { x: 26.9, y: 32.4, t: 3.5 }, { x: 43.4, y: 37.2, t: 3 }, { x: 48, y: 40.4, t: 3 }, { x: 51.4, y: 42.3, t: 3 },
        ] },                                                                           // les lampions
        { type: 'guirlande', points: [
            { x: 59.2, y: 3.4 }, { x: 19.3, y: 8.5 }, { x: 29.3, y: 12.5 }, { x: 33.3, y: 17.9 }, { x: 2.4, y: 22.8 }, { x: 34, y: 28.7 },
            { x: 18.5, y: 30.3 }, { x: 23.9, y: 37.2 }, { x: 83.6, y: 33.8 }, { x: 87.6, y: 46.5 }, { x: 68.2, y: 46.8 }, { x: 82.4, y: 46.8 },
        ] },
        { type: 'notes', x: 34, y: 38, l: 20, h: 14 },                                // la fanfare joue
        { type: 'confettis', x: 30, y: 0, l: 45, h: 75, n: 18 },
        { type: 'flamme', x: 91.2, y: 89.3 },                                          // bougies sur les tables
        { type: 'flamme', x: 78.3, y: 73.3 },
      ], cadrage: '50% 50%', carte: 'bas-droite', alt: "Fête de village sur une place au crépuscule : lampions, fanions, fanfare sur scène et danseurs", badge: 'Événements', titre: "Vis l'instant",
      texte: 'Fêtes de village, festivals, marchés de Noël : ne rate plus rien de ce qui se passe près de toi.', bouton: 'Vois les événements sur la carte' },
    { cle: 'monument', illu: monument, fond: fondMonument, ratio: 1376 / 768,
      effets: [
        { type: 'ondes', points: [{ x: 24, y: 90 }, { x: 30.5, y: 93 }] },            // (16, 17)
        { type: 'lampes', points: [{ x: 96.5, y: 49, t: 6 }] },                       // (19)
        { type: 'hirondelles', x: 52, y: 20 },                                        // (20)
      ], cadrage: '50% 45%',
      variantes: [
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondMonumentNuitHiver, ratio: 1679 / 937, etoiles: true,
          effets: [{ type: 'lune', x: 17.4, y: 11.3, t: 8 }, ...EFFETS_MONUMENT_NUIT],
          alt: "Château fort enneigé et illuminé au bord d'un étang, sous la pleine lune" },
        { theme: 'nuit', fond: fondMonumentNuit, ratio: 1679 / 937, etoiles: true,
          effets: [{ type: 'lune', x: 16.9, y: 10.8, t: 8 }, ...EFFETS_MONUMENT_NUIT],
          alt: "Château fort illuminé au bord d'un étang, sous la pleine lune" },
      ],
      alt: "Château fort aux tours coiffées d'ardoise au bord d'un étang, au coucher du soleil", badge: 'Monuments', titre: 'Remonte le temps',
      texte: "Châteaux de la Loire, ponts romains, abbayes perchées : l'histoire de France se visite en vrai.", bouton: 'Vois les monuments sur la carte' },
];

/* L'arbre du parc suit la saison : parc.svg#printemps, #automne, #hiver (été = sans fragment) */
/* Premier écran : la photo du lac (1 à 5) */
export const EFFETS_LAC = [
    { type: 'brume', x: 34, y: 34, l: 16, h: 14 },                                   // (2) pied de la cascade
    { type: 'nuages', x: 30, y: 2, l: 70, h: 20 },                                   // (3)
    { type: 'flamme', x: 43, y: 80.5 },                                              // (5) lanterne
];

export const FRAGMENT_ARBRE = { printemps: '#printemps', ete: '', automne: '#automne', halloween: '#automne', hiver: '#hiver', noel: '#hiver' };

/*
 * Fonds des pages connexion et inscription (CadreAuth.jsx). Même principe que ECRANS :
 * effets en % DE L'IMAGE. La droite des deux photos est calme : c'est là que se pose la carte.
 */
export const FONDS_AUTH = {
    // Connexion : la bande retrouve ses amis à la guinguette du bord de mer
    '/connexion': { fond: fondConnexion, ratio: 1672 / 941, cadrage: '30% 60%',
      effets: [
        { type: 'nuages', x: 30, y: 3, l: 70, h: 25 },
        { type: 'soleil', x: 77.9, y: 43.8, t: 10 },
        { type: 'miroir', x: 74, y: 47, l: 8, h: 22 },                               // le chemin du soleil sur la mer
        { type: 'guirlande', points: [
            { x: 21, y: 24.5 }, { x: 25, y: 27 }, { x: 29, y: 28.5 }, { x: 33, y: 30 }, { x: 37, y: 31 },
            { x: 41, y: 32 }, { x: 44.5, y: 32.5 }, { x: 47.5, y: 33.5 }, { x: 50, y: 35 },
        ] },
        { type: 'lampes', points: [{ x: 9.5, y: 22, t: 2.5 }, { x: 14, y: 29.5, t: 3.5 }, { x: 18, y: 29.2, t: 2.5 }, { x: 23, y: 33, t: 3.5 }, { x: 26.5, y: 34, t: 2.5 }, { x: 31.5, y: 34.5, t: 3 }] }, // les lampions
        { type: 'flamme', x: 39.8, y: 70.5 },                                         // les lanternes posées au sol…
        { type: 'flamme', x: 8.5, y: 64.5 },
        { type: 'flamme', x: 51, y: 47 },                                             // … et une bougie sur une table
        { type: 'voilier', x: 58, y: 44.5, l: 42, h: 3.5 },
        { type: 'phare', x: 57, y: 39 },                                              // la nuit, au bout de la pointe
        { type: 'hirondelles', x: 86, y: 20, echelle: 0.6 },                          // des mouettes
        { type: 'herbes', x: 50, y: 82, l: 50, h: 18 },
      ] },
    // Inscription : un ami court pour rejoindre la bande, sur le chemin au-dessus de la rivière
    '/inscription': { fond: fondInscription, ratio: 1672 / 941, cadrage: '30% 60%',
      effets: [
        { type: 'nuages', x: 30, y: 2, l: 70, h: 22 },
        { type: 'soleil', x: 85.2, y: 37.2, t: 11 },
        { type: 'miroir', x: 81, y: 52, l: 7, h: 6 },                                 // le soleil dans la rivière
        { type: 'lampes', points: [{ x: 4.4, y: 17.5, t: 6 }] },                      // la lanterne de la guinguette
        { type: 'guirlande', points: [{ x: 10, y: 40.5 }, { x: 13, y: 41 }, { x: 16, y: 41.5 }, { x: 19, y: 41.5 }, { x: 22, y: 42 }, { x: 25, y: 42.5 }] },
        { type: 'pollen', x: 10, y: 72, l: 30, h: 26, n: 12 },                        // grains dorés sur le chemin
        { type: 'pollen', x: 18, y: 60, l: 16, h: 12, n: 6 },
        { type: 'herbes', x: 55, y: 82, l: 45, h: 18 },
        { type: 'fleurs', points: [{ x: 82, y: 96 }, { x: 88, y: 92 }, { x: 94, y: 95 }] }, // la lavande
        { type: 'papillons', x: 60, y: 60, l: 18, h: 14 },
        { type: 'hirondelles', x: 37, y: 22, echelle: 0.6 },                          // autour du château
        { type: 'fenetres', points: [{ x: 30, y: 33 }, { x: 33.5, y: 32 }, { x: 37, y: 31 }] },
      ] },
};

/*
 * L'écran tel qu'il doit s'afficher MAINTENANT : la première variante dont le thème (heure)
 * et la saison correspondent remplace la photo, ses effets et sa description.
 * Sans variante qui correspond : l'écran de base (le coucher de soleil).
 *   ecranDuMoment(ecran, 'nuit', 'hiver') → la photo enneigée sous la lune
 */
export const ecranDuMoment = (ecran, theme, saison) => {
    const variante = ecran.variantes?.find((v) => (!v.theme || v.theme === theme) && (!v.saisons || v.saisons.includes(saison)));
    return variante ? { ...ecran, ...variante } : ecran;
};
