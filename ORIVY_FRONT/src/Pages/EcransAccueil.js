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
 * sansFilante  : pas d'étoile filante sur cet écran (même la nuit), toutes variantes comprises.
 * floconsSeuls  : seulement les flocons de neige (l'icône flocon.svg) qui tombent sur la photo
 *                 (+ les étoiles si « etoiles » est aussi présent : nuit d'hiver).
 * Une variante sans « theme » vaut à toute heure (ex. la neige en hiver) : on met la nuit AVANT elle.
 * Une variante SANS « effets » garde ceux de l'écran de base (même cadrage) ; « effetsEnPlus » s'y ajoute,
 * « retirer » en enlève par type (ex. ['soleil'] : pas de soleil couchant la nuit).
 *           { theme: 'nuit', saisons: ['hiver', 'noel'], fond, ratio, effets, alt } : la 1re qui correspond gagne.
 *           jours : ['MM-JJ', …] pour une photo réservée à certains jours (ex. ['10-31'] : Halloween).
 * Les illustrations sont importées : Vite leur donne une adresse unique au build.
 */
import musee from '../Style/illustrations/musee.svg';
import parc from '../Style/illustrations/parc.svg';
import randonnee from '../Style/illustrations/randonnee.svg';
import village from '../Style/illustrations/village.svg';
import { CIEL } from './Accueil/ciel.js';
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
import fondPromenadeNuitHiver from '../Style/fonds/promenade-nuit-hiver.jpg';
// Nuits du 2026-10-30 : même cadrage que les photos de jour, donc mêmes coordonnées d'effets
import fondCinemaNuit from '../Style/fonds/cinema-nuit.jpg';
import fondCinemaNuitHiver from '../Style/fonds/cinema-nuit-hiver.jpg';
import fondCinemaHiver from '../Style/fonds/cinema-hiver.jpg';
import fondEvenementNuit from '../Style/fonds/evenement-nuit.jpg';
import fondEvenementNuitHiver from '../Style/fonds/evenement-nuit-hiver.jpg';
import fondRestaurantNuit from '../Style/fonds/restaurant-nuit.jpg';
import fondRestaurantNuitHiver from '../Style/fonds/restaurant-nuit-hiver.jpg';
import fondPointDeVueNuit from '../Style/fonds/point-de-vue-nuit.jpg';
import fondPointDeVueNuitHiver from '../Style/fonds/point-de-vue-nuit-hiver.jpg';
import fondPointDeVueHiver from '../Style/fonds/point-de-vue-hiver.jpg';
// Hivers de jour (2026-10-30) : la neige, avec des flocons qui tombent
import fondParcHiver from '../Style/fonds/parc-hiver.jpg';
import fondRestaurantHiver from '../Style/fonds/restaurant-hiver.jpg';
import fondEvenementHiver from '../Style/fonds/evenement-hiver.jpg';
// Halloween (2026-10-31) : la fête du village déguisée, citrouilles et toiles d'araignée
import fondEvenementHalloween from '../Style/fonds/evenement-halloween.jpg';
import fondMonumentHiver from '../Style/fonds/monument-hiver.jpg';
// Le bar (2026-10-31) : même cadrage que la photo de jour
import fondBarNuit from '../Style/fonds/bar-nuit.jpg';
import fondBarHiver from '../Style/fonds/bar-hiver.jpg';
import fondBarNuitHiver from '../Style/fonds/bar-nuit-hiver.jpg';
// Le lac du premier écran (2026-10-31)
import fondAccueil from '../Style/fonds/accueil-lac.jpg';
// Le village (2026-10-31) : autre cadrage que la photo de jour, donc ses propres effets
import fondVillageNuit from '../Style/fonds/village-nuit.jpg';
import fondVillageHiver from '../Style/fonds/village-hiver.jpg';
import fondVillageNuitHiver from '../Style/fonds/village-nuit-hiver.jpg';
import fondAccueilNuit from '../Style/fonds/accueil-lac-nuit.jpg';
import fondAccueilHiver from '../Style/fonds/accueil-lac-hiver.jpg';
import fondAccueilNuitHiver from '../Style/fonds/accueil-lac-nuit-hiver.jpg';
// Le musée (2026-10-31) : même cadrage que la photo de jour
import fondMuseeNuit from '../Style/fonds/musee-nuit.jpg';
import fondMuseeHiver from '../Style/fonds/musee-hiver.jpg';
import fondMuseeNuitHiver from '../Style/fonds/musee-nuit-hiver.jpg';
// Fonds des pages connexion / inscription (fournis par l'utilisateur le 2026-10-25 : tout le monde de dos)
import fondConnexion from '../Style/fonds/connexion.jpg';
import fondInscription from '../Style/fonds/inscription.jpg';

/* Effets communs aux deux nuits du château (même cadrage en été et en hiver) */
const EFFETS_MONUMENT_NUIT = [
    // Pas de scintillements sur l'étang ni de lucioles : retirés le 2026-10-29 (points lumineux)
    { type: 'ondes', points: [{ x: 23.7, y: 88.4 }, { x: 30.2, y: 91.5 }] },        // autour des barques
    { type: 'flamme', x: 23.6, y: 87.4 },                                           // les lanternes des barques
    { type: 'flamme', x: 30.6, y: 90.4 },
    { type: 'lampes', points: [{ x: 97, y: 50.8, t: 6, proche: true }, { x: 74, y: 69.4, t: 2.5 }, { x: 79.4, y: 72.8, t: 2.5 }, { x: 88.6, y: 67.4, t: 2.5 }] },
    // Pas de halos sur les fenêtres : la photo de nuit les montre déjà allumées
];

export const ECRANS = [
    { cle: 'culture', sansFilante: true, illu: musee, fond: fondMusee, ratio: 1672 / 941,
      effets: [
        { type: 'soleil', x: 39.2, y: 58, t: 12 },                                    // au fond de l'allée, entre la fontaine et le couple
        { type: 'lampes', points: [{ x: 69.7, y: 52, t: 4 }, { x: 89.2, y: 15, t: 7, proche: true }] }, // (8) aucun halo sur les bords gauche et droit
        { type: 'petales', x: 0, y: 76, l: 24, h: 20 },                               // (9) hortensias
        // (51) fenêtres retirées le 2026-10-29 : les halos tombaient à côté des fenêtres
      ], cadrage: '72% 60%', ambiance: 'feuilles',
      // Toutes les versions gardent les deux réverbères ; jamais le soleil ; pas de pétales en hiver
      variantes: [
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondMuseeNuitHiver, ratio: 1672 / 941, ciel: CIEL['musee-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true, retirer: ['soleil', 'petales'], effetsEnPlus: [{ type: 'lune', x: 37.9, y: 28.7, t: 8 }],
          alt: 'Couple sur un banc enneigé face à une fontaine illuminée et une façade haussmannienne, sous la pleine lune' },
        { theme: 'nuit', fond: fondMuseeNuit, ratio: 1671 / 941, ciel: CIEL['musee-nuit'], etoiles: true,
          retirer: ['soleil'], effetsEnPlus: [{ type: 'lune', x: 37.6, y: 30.8, t: 8 }],
          alt: 'Couple sur un banc face à une fontaine illuminée et une façade haussmannienne, sous la pleine lune' },
        { saisons: ['hiver', 'noel'], fond: fondMuseeHiver, ratio: 1365 / 768, ambiance: 'aucune', floconsSeuls: true,
          retirer: ['soleil', 'petales', 'lampes'],   // lampadaires éteints en plein jour
          alt: 'Couple sur un banc enneigé face à une fontaine et une façade haussmannienne, sous la neige' },
      ],
      alt: 'Place parisienne au coucher du soleil, fontaine et façade haussmannienne marquée Musée', badge: 'Musées & culture', titre: 'Laisse-toi surprendre',
      texte: "Des grands musées parisiens aux petites collections de province, il y a toujours une salle qui t'attend.", bouton: 'Vois les musées sur la carte' },
    { cle: 'parc', illu: parc, fond: fondParc, ratio: 1672 / 941,
      effets: [
        // Effets lumineux retirés le 2026-10-27 (soleil, réverbères, statues, fenêtres, bassin doré, pollen, halo)
        { type: 'nuages', x: 5, y: 2, l: 75, h: 26 },                                 // (28)
        { type: 'lampes', points: [{ x: 96.9, y: 23.3, t: 6, proche: true }] },        // le lampadaire de droite, déjà allumé
        { type: 'papillons', x: 12, y: 68, l: 16, h: 14 },                            // (27) au-dessus de la lavande
        { type: 'papillons', x: 74, y: 68, l: 14, h: 14 },
      ], cadrage: '50% 60%', carte: 'haut-droite', ambiance: 'aucune',
      // La nuit : les deux lampadaires et les étoiles (+ les flocons en hiver), rien d'autre
      variantes: [
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondParcNuitHiver, ratio: 1670 / 941, ciel: CIEL['parc-nuit-hiver'], effets: [{ type: 'lampes', points: [{ x: 1.5, y: 26.2, t: 7, proche: true }, { x: 97.1, y: 24.9, t: 7, proche: true }] }], etoiles: true, floconsSeuls: true,
          alt: "Couple main dans la main dans l'allée enneigée d'un jardin à la française, sous la pleine lune, château illuminé" },
        { theme: 'nuit', fond: fondParcNuit, ratio: 1670 / 941, ciel: CIEL['parc-nuit'], effets: [{ type: 'lampes', points: [{ x: 1.5, y: 26.2, t: 7, proche: true }, { x: 97.1, y: 24.9, t: 7, proche: true }] }], etoilesSeules: true,
          alt: "Couple main dans la main dans l'allée fleurie d'un jardin à la française, sous la pleine lune, château illuminé" },
        // L'hiver, le jour : le jardin sous la neige ; le jet de la fontaine, des flocons
        { saisons: ['hiver', 'noel'], fond: fondParcHiver, ratio: 1363 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [{ type: 'jet', x: 49.6, y: 45, l: 2, h: 10 },
                   { type: 'lampes', points: [{ x: 1.6, y: 27.3, t: 5, proche: true }, { x: 97.1, y: 22.9, t: 5, proche: true }] }],
          alt: "Couple main dans la main dans l'allée enneigée d'un jardin à la française, château sous le ciel bleu d'hiver" },
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
        // Une nuit d'hiver : le puy sous la neige et la lune ; étoiles ET flocons
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondPromenadeNuitHiver, ratio: 1376 / 768, ciel: CIEL['promenade-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true,
          effets: [{ type: 'lune', x: 26.9, y: 28, t: 11 }],
          alt: 'Deux randonneurs à la frontale sur un sentier enneigé vers le puy de Dôme, sous la lune et la Voie lactée' },
        // Les autres nuits : la pleine lune brille et les étoiles scintillent
        { theme: 'nuit', fond: fondPromenadeNuit, ratio: 1376 / 768, ciel: CIEL['promenade-nuit'], ambiance: 'aucune', etoilesSeules: true,
          effets: [{ type: 'lune', x: 42.9, y: 21.9, t: 12 }],
          alt: 'Deux randonneurs sur un sentier vers le puy de Dôme, panneau GR4 Auvergne, sous la pleine lune et les étoiles' },
        // L'hiver, le reste du temps : le puy sous la neige, et des flocons qui tombent
        { saisons: ['hiver', 'noel'], fond: fondPromenadeHiver, ratio: 1376 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [{ type: 'nuages', x: 30, y: 15, l: 70, h: 18 }],
          alt: 'Deux randonneurs en raquettes sur un sentier enneigé vers le puy de Dôme, panneau GR4 Auvergne, ciel bleu' },
      ],
      alt: 'Deux randonneurs sur un sentier vers le puy de Dôme, panneau GR4 Auvergne, au coucher du soleil', badge: 'Randonnées', titre: 'Prends de la hauteur',
      texte: 'Sentiers de crête, chemins côtiers, balades en forêt : enfile tes chaussures, la France est à toi.', bouton: 'Vois les randonnées sur la carte' },
    { cle: 'village', sansFilante: true, illu: village, fond: fondVillage, ratio: 1672 / 941,
      effets: [
        { type: 'nuages', x: 36, y: 8, l: 46, h: 18 },                                // (28)
        { type: 'soleil', x: 71.5, y: 28.5, t: 11 },
        { type: 'lampes', points: [{ x: 30.8, y: 21.8, t: 6 }, { x: 44, y: 47, t: 3 }] }, // lanternes de la ruelle
        { type: 'petales', x: 4, y: 15, l: 22, h: 25, couleur: '#C2185B' },           // (23) bougainvillier
        { type: 'papillons', x: 13, y: 54, l: 14, h: 14 },                            // (27) autour de la lavande
        { type: 'ondes', points: [{ x: 90.6, y: 83 }] },                               // là où le filet d'eau touche le bassin
        { type: 'fenetres', points: [{ x: 31.7, y: 50 }, { x: 22.5, y: 18 }] },       // (51)
      ], cadrage: '50% 55%', carte: 'haut-droite',
      variantes: [
        // Nuit d'hiver : la ruelle sous la neige ; les lanternes, étoiles et flocons (pas de halo sur la lune)
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondVillageNuitHiver, ratio: 1365 / 768, ciel: CIEL['village-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true,
          effets: [
            { type: 'lampes', points: [{ x: 30.9, y: 21.5, t: 5, proche: true }, { x: 78.5, y: 38.5, t: 4, proche: true }, { x: 44, y: 47, t: 2.5 }] },
          ],
          alt: "Couple main dans la main dans une ruelle enneigée de village provençal, la nuit, lanternes et clocher sous un croissant de lune" },
        // Les autres nuits : la ruelle en fleurs ; lanternes, la fontaine qui coule, étoiles
        { theme: 'nuit', fond: fondVillageNuit, ratio: 1365 / 768, ciel: CIEL['village-nuit'], etoiles: true,
          effets: [
            { type: 'lampes', points: [{ x: 30.9, y: 21.5, t: 5, proche: true }, { x: 78.5, y: 38.5, t: 4, proche: true }, { x: 44, y: 47, t: 2.5 }] },
            { type: 'jet', x: 92, y: 68, l: 3, h: 14 },                               // le filet d'eau de la fontaine
            { type: 'ondes', points: [{ x: 91.5, y: 82 }] },
          ],
          alt: "Couple main dans la main dans une ruelle pavée de village provençal, la nuit, bougainvilliers, lanternes et clocher sous un croissant de lune" },
        // L'hiver, le jour : la ruelle sous la neige, la fontaine gelée ; nuages et flocons
        { saisons: ['hiver', 'noel'], fond: fondVillageHiver, ratio: 1365 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [{ type: 'nuages', x: 40, y: 6, l: 42, h: 18 }],
          alt: "Couple main dans la main dans une ruelle enneigée de village provençal, fontaine gelée et clocher sous le ciel bleu" },
      ],
      alt: "Couple main dans la main dans une ruelle pavée de village provençal, bougainvilliers et clocher au coucher du soleil", badge: 'Villages', titre: 'Flâne dans les ruelles',
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
      ], cadrage: '60% 50%', carte: 'haut-gauche',
      variantes: [
        // Une nuit d'hiver : les falaises sous la neige ; la lune, le phare, les étoiles et les flocons
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondPointDeVueNuitHiver, ratio: 1364 / 768, ciel: CIEL['point-de-vue-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true,
          effets: [{ type: 'lune', x: 82.1, y: 11.5, t: 10 }, { type: 'phare', x: 61.8, y: 28.6 }],
          alt: "Couple emmitouflé assis dans la neige en haut des falaises d'Étretat, face à l'Aiguille, sous la pleine lune" },
        // Les autres nuits : la pleine lune au-dessus de la mer, le phare balaie l'horizon, les étoiles scintillent
        { theme: 'nuit', fond: fondPointDeVueNuit, ratio: 1364 / 768, ciel: CIEL['point-de-vue-nuit'], etoiles: true,
          effets: [
            { type: 'lune', x: 82.1, y: 11.5, t: 10 },
            { type: 'phare', x: 61.8, y: 28.6 },
            { type: 'fleurs', points: [{ x: 4.8, y: 64 }, { x: 19.4, y: 86 }, { x: 65.8, y: 89 }, { x: 89.4, y: 90 }] },
          ],
          alt: "Couple assis dans l'herbe en haut des falaises d'Étretat, face à l'Aiguille, sous la pleine lune" },
        // L'hiver, le jour : les falaises sous la neige ; nuages, voilier et mouettes, des flocons (ni soleil couchant ni fleurs)
        { saisons: ['hiver', 'noel'], fond: fondPointDeVueHiver, ratio: 1364 / 768, ambiance: 'aucune', floconsSeuls: true,
          retirer: ['soleil', 'rougeoie', 'fleurs'],
          alt: "Couple emmitouflé assis dans la neige en haut des falaises d'Étretat, face à l'Aiguille, ciel bleu d'hiver" },
      ],
      alt: "Couple assis dans l'herbe en haut des falaises d'Étretat, face à l'Aiguille et au soleil couchant", badge: 'Points de vue', titre: 'Admire le panorama',
      texte: 'Falaises d\'Étretat, dune du Pilat, belvédères du Verdon : vis les couchers de soleil en grand.', bouton: 'Vois les points de vue sur la carte' },
    { cle: 'restaurant', sansFilante: true, illu: restaurant, fond: fondRestaurant, ratio: 1376 / 768,
      effets: [
        { type: 'flamme', x: 50.3, y: 79, proche: true },                                           // (11) bougie
        { type: 'vapeur', x: 52.2, y: 82 },                                           // (12) au-dessus de l'assiette (pas de tasse sur la photo)
        { type: 'neon', x: 75, y: 3, l: 24.5, h: 20 },                                // (14) enseigne ORIVY
        { type: 'lampes', points: [{ x: 12, y: 33.5, t: 6, proche: true }] },
        // (51) fenêtres retirées le 2026-10-30 (les halos tombaient à côté)
      ], cadrage: '62% 60%', ambiance: 'feuilles',
      variantes: [
        // Une nuit d'hiver : la terrasse sous la neige ; la bougie, l'enseigne, le réverbère, étoiles et flocons
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondRestaurantNuitHiver, ratio: 1376 / 768, ciel: CIEL['restaurant-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true,
          effets: [
            { type: 'flamme', x: 50.4, y: 78.5, proche: true },
            { type: 'neon', x: 75, y: 3, l: 24.5, h: 20 },
            { type: 'lampes', points: [{ x: 12.4, y: 33.8, t: 6, proche: true }] },
          ],
          alt: 'Couple en bonnets en terrasse du bistrot Orivy la nuit, sous la neige, fontaine givrée illuminée' },
        { theme: 'nuit', fond: fondRestaurantNuit, ratio: 1376 / 768, ciel: CIEL['restaurant-nuit'], etoiles: true,
          alt: 'Couple en terrasse du bistrot Orivy la nuit, fontaine illuminée et guirlandes dans les arbres' },
        // L'hiver, le jour : la terrasse sous la neige ; la bougie, l'enseigne, des flocons
        { saisons: ['hiver', 'noel'], fond: fondRestaurantHiver, ratio: 1376 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [{ type: 'flamme', x: 53.9, y: 79.7, proche: true }, { type: 'neon', x: 75, y: 5, l: 24.5, h: 20 }],
          alt: 'Couple en bonnets en terrasse du bistrot Orivy enneigé, fontaine givrée et ciel bleu' },
      ],
      alt: 'Couple en terrasse du bistrot Chez Orivy, place parisienne au coucher du soleil', badge: 'Restaurants', titre: 'Mets les pieds sous la table',
      texte: 'Bistrots de quartier, tables de chef et crêperies : partage un bon repas à plusieurs.', bouton: 'Vois les restaurants sur la carte' },
    { cle: 'bar', sansFilante: true, illu: bar, fond: fondBar, ratio: 1672 / 941,
      effets: [
        { type: 'soleil', x: 62.1, y: 43.8, t: 10 },
        { type: 'guirlande', points: [{ x: 40, y: 8.3 }, { x: 31, y: 15.6 }, { x: 25.4, y: 19.3 }, { x: 18.4, y: 22.8 }, { x: 15.7, y: 11.7 }, { x: 9.3, y: 15.6 }, { x: 5.4, y: 24.7 }] },
        { type: 'lampes', points: [{ x: 9.4, y: 27.8, t: 5 }, { x: 13.3, y: 36.7, t: 4 }, { x: 96, y: 13.8, t: 7, proche: true }] },
        { type: 'lampes', points: [{ x: 39.2, y: 52.6, t: 2.5 }, { x: 47, y: 53, t: 2.5 }, { x: 54.4, y: 53.7, t: 2.5 }, { x: 62.5, y: 54.2, t: 2.5 }] }, // le pont s'éclaire
        { type: 'flamme', x: 7.3, y: 77.9, proche: true },                                          // (11) bougies
        { type: 'flamme', x: 50.1, y: 85, proche: true },
        // (51) fenêtres retirées le 2026-10-29 : les halos tombaient à côté des fenêtres
      ], cadrage: '55% 55%', carte: 'bas-droite', ambiance: 'feuilles',
      // Toutes les versions gardent la guirlande, les lanternes, le pont qui s'éclaire et les bougies ; jamais le soleil
      variantes: [
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondBarNuitHiver, ratio: 1672 / 941, ciel: CIEL['bar-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true, retirer: ['soleil'], effetsEnPlus: [{ type: 'lune', x: 71.2, y: 17, t: 8 }],
          alt: "Couple attablé à la terrasse enneigée d'une guinguette au bord du fleuve, pont et cathédrale illuminés sous la lune" },
        { theme: 'nuit', fond: fondBarNuit, ratio: 1672 / 941, ciel: CIEL['bar-nuit'], etoiles: true,
          retirer: ['soleil'], effetsEnPlus: [{ type: 'lune', x: 67.9, y: 21.8, t: 8 }],
          alt: "Couple attablé à la terrasse d'une guinguette au bord du fleuve, pont et cathédrale illuminés sous la pleine lune" },
        { saisons: ['hiver', 'noel'], fond: fondBarHiver, ratio: 1672 / 941, ambiance: 'aucune', floconsSeuls: true, retirer: ['soleil'],
          alt: "Couple attablé à la terrasse enneigée d'une guinguette au bord du fleuve, pont et cathédrale sous un ciel d'hiver" },
      ],
      alt: "Couple attablé à la terrasse d'une guinguette au bord du fleuve, pont et cathédrale au coucher du soleil", badge: 'Bars', titre: 'Trinque en terrasse',
      texte: 'Guinguettes au bord de l\'eau, bars à vin, toits-terrasses : profite de la soirée avec ta bande.', bouton: 'Vois les bars sur la carte' },
    { cle: 'cinema', sansFilante: true, illu: cinema, fond: fondCinema, ratio: 1365 / 768,
      effets: [
        { type: 'neon', x: 49.5, y: 18, l: 4.5, h: 31 },                              // (14) les lettres « CINÉMA »
        { type: 'chenillard', points: [
            { x: 41, y: 61 }, { x: 45.4, y: 60 }, { x: 49.8, y: 58.6 }, { x: 54.2, y: 57.3 }, { x: 58.6, y: 56.2 }, { x: 63, y: 55.3 },
            { x: 43.2, y: 58 }, { x: 47.6, y: 56.9 }, { x: 52, y: 55.7 }, { x: 56.4, y: 54.7 }, { x: 60.8, y: 53.9 }, { x: 65, y: 53.2 },
        ] },                                                                           // la marquise
        { type: 'reflet', x: 76.5, y: 64, l: 8.5, h: 20 },                            // (13) la lumière glisse sur l'affiche
        { type: 'lampes', points: [{ x: 87, y: 10.2, t: 9, proche: true }, { x: 12.1, y: 51.4, t: 4 }, { x: 18.7, y: 67.7, t: 2.5 }, { x: 5.9, y: 68.4, t: 2.5 }, { x: 22.3, y: 69.7, t: 2 }] },
        // (51) fenêtres de la façade retirées le 2026-10-29 : les halos tombaient à côté des arcades
      ], cadrage: '50% 50%', carte: 'haut-gauche', ambiance: 'feuilles',
      variantes: [
        // Une nuit d'hiver : la rue sous la neige ; mêmes lumières (enseigne, marquise, affiche, réverbères) + lune, étoiles, flocons
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondCinemaNuitHiver, ratio: 1365 / 768, ciel: CIEL['cinema-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true, effetsEnPlus: [{ type: 'lune', x: 32.2, y: 12.4, t: 8 }],   // derrière les branches
          alt: "Couple devant la façade illuminée d'un grand cinéma parisien, la nuit, rue enneigée et clair de lune" },
        { theme: 'nuit', fond: fondCinemaNuit, ratio: 1365 / 768, ciel: CIEL['cinema-nuit'], etoiles: true,
          alt: "Couple devant la façade illuminée d'un grand cinéma parisien, la nuit, pavés mouillés et ciel étoilé" },
        // L'hiver, le jour : la rue sous la neige, enseigne et réverbères éteints ; le reflet sur l'affiche, des flocons
        { saisons: ['hiver', 'noel'], fond: fondCinemaHiver, ratio: 1365 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [{ type: 'reflet', x: 76.5, y: 64, l: 8.5, h: 20 }],
          alt: "Couple devant la façade d'un grand cinéma parisien, rue enneigée sous le ciel bleu d'hiver" },
      ],
      alt: "Couple devant la façade illuminée d'un grand cinéma parisien, pavés mouillés et ciel orangé", badge: 'Cinémas', titre: 'Fais-toi une toile',
      texte: 'Salles Art déco, cinémas de quartier, séances en plein air : le grand écran, c\'est mieux ensemble.', bouton: 'Vois les cinémas sur la carte' },
    { cle: 'evenement', sansFilante: true, illu: evenement, fond: fondEvenement, ratio: 1672 / 941,
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
        { type: 'flamme', x: 91.2, y: 89.3, proche: true },                                          // bougies sur les tables
        { type: 'flamme', x: 78.3, y: 73.3 },
      ], cadrage: '50% 50%', carte: 'bas-droite',
      variantes: [
        // Le 31 octobre seulement, à toute heure : citrouilles allumées, toiles d'araignée, la fanfare et les feuilles mortes
        { jours: ['10-31'], fond: fondEvenementHalloween, ratio: 1365 / 768, ambiance: 'feuilles',
          effets: [
            { type: 'lampes', points: [
                { x: 3.1, y: 14.3, t: 4 }, { x: 25.1, y: 19.3, t: 3 }, { x: 31, y: 22.4, t: 3 }, { x: 41.6, y: 21.5, t: 3.5 }, { x: 48.9, y: 20.2, t: 3 },
                { x: 54.4, y: 15.4, t: 3.5 }, { x: 63.7, y: 11.5, t: 2.5 }, { x: 69.7, y: 17.6, t: 2.5 }, { x: 75.6, y: 19.5, t: 2.5 }, { x: 96.6, y: 9.1, t: 2.5 },
                { x: 2.9, y: 47.5, t: 3.5, proche: true }, { x: 8, y: 48.4, t: 3.5, proche: true },
            ] },                                                                       // les citrouilles
            { type: 'notes', x: 38, y: 40, l: 18, h: 12 },                         // la fanfare joue
          ],
          alt: "Fête d'Halloween sur une place de village : citrouilles allumées, toiles d'araignée, fanfare sur scène et danseurs déguisés" },
        // Une nuit d'hiver : le marché de Noël illuminé ; les lanternes, la fanfare, étoiles et flocons
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondEvenementNuitHiver, ratio: 1365 / 768, ciel: CIEL['evenement-nuit-hiver'], ambiance: 'aucune',
          etoiles: true, floconsSeuls: true,
          effets: [
            { type: 'lampes', points: [{ x: 2.9, y: 13.7, t: 3 }, { x: 25.3, y: 20.2, t: 3 }, { x: 41.6, y: 21.5, t: 3 }, { x: 54.4, y: 15.6, t: 3 }, { x: 97.2, y: 19.5, t: 3 }] },
            { type: 'notes', x: 40, y: 40, l: 18, h: 12 },                         // la fanfare joue
          ],
          alt: "Fête de village une nuit d'hiver : marché de Noël enneigé et illuminé, lanternes, fanfare sur scène et danseurs" },
        { theme: 'nuit', fond: fondEvenementNuit, ratio: 1365 / 768, ciel: CIEL['evenement-nuit'], etoiles: true,
          effetsEnPlus: [{ type: 'lune', x: 91.6, y: 9.5, t: 4 }],                     // le croissant au-dessus du clocher
          alt: 'Fête de village la nuit : lampions, fanions, fanfare sur scène et danseurs sous un croissant de lune' },
        // L'hiver, le jour : le marché de Noël ; les lanternes, la fanfare, des flocons
        { saisons: ['hiver', 'noel'], fond: fondEvenementHiver, ratio: 1365 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [
            { type: 'lampes', points: [{ x: 2.9, y: 13.7, t: 3 }, { x: 25.3, y: 20.2, t: 3 }, { x: 41.6, y: 21.5, t: 3 }, { x: 54.4, y: 15.6, t: 3 }, { x: 97.2, y: 19.5, t: 3 }] },
            { type: 'notes', x: 40, y: 40, l: 18, h: 12 },                         // la fanfare joue
          ],
          alt: 'Fête de village en hiver : marché de Noël enneigé, chalets, lanternes, fanfare sur scène et danseurs' },
      ],
      alt: "Fête de village sur une place au crépuscule : lampions, fanions, fanfare sur scène et danseurs", badge: 'Événements', titre: "Vis l'instant",
      texte: 'Fêtes de village, festivals, marchés de Noël : ne rate plus rien de ce qui se passe près de toi.', bouton: 'Vois les événements sur la carte' },
    { cle: 'monument', illu: monument, fond: fondMonument, ratio: 1376 / 768,
      effets: [
        { type: 'ondes', points: [{ x: 24, y: 90 }, { x: 30.5, y: 93 }] },            // (16, 17)
        { type: 'lampes', points: [{ x: 96.5, y: 51.1, t: 6 }] },                       // (19)
        { type: 'hirondelles', x: 52, y: 20 },                                        // (20)
      ], cadrage: '50% 45%',
      variantes: [
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondMonumentNuitHiver, ratio: 1679 / 937, ciel: CIEL['monument-nuit-hiver'], etoiles: true,
          effets: [{ type: 'lune', x: 17.4, y: 11.3, t: 8 }, ...EFFETS_MONUMENT_NUIT],
          alt: "Château fort enneigé et illuminé au bord d'un étang, sous la pleine lune" },
        { theme: 'nuit', fond: fondMonumentNuit, ratio: 1679 / 937, ciel: CIEL['monument-nuit'], etoiles: true,
          effets: [{ type: 'lune', x: 16.9, y: 10.8, t: 8 }, ...EFFETS_MONUMENT_NUIT],
          alt: "Château fort illuminé au bord d'un étang, sous la pleine lune" },
        // L'hiver, le jour : le château enneigé au lever du soleil, l'étang gelé, des flocons
        { saisons: ['hiver', 'noel'], fond: fondMonumentHiver, ratio: 1376 / 768, ambiance: 'aucune', floconsSeuls: true,
          effets: [{ type: 'lampes', points: [{ x: 96.5, y: 51.2, t: 5 }] }],
          alt: "Château fort enneigé au bord d'un étang gelé, au lever du soleil" },
      ],
      alt: "Château fort aux tours coiffées d'ardoise au bord d'un étang, au coucher du soleil", badge: 'Monuments', titre: 'Remonte le temps',
      texte: "Châteaux de la Loire, ponts romains, abbayes perchées : l'histoire de France se visite en vrai.", bouton: 'Vois les monuments sur la carte' },
];

/* L'arbre du parc suit la saison : parc.svg#printemps, #automne, #hiver (été = sans fragment) */
/* Premier écran : la photo du lac (1 à 5) */
export const EFFETS_LAC = [
    { type: 'brume', x: 34, y: 34, l: 16, h: 14 },                                   // (2) pied de la cascade
    { type: 'nuages', x: 30, y: 2, l: 70, h: 20 },                                   // (3)
    { type: 'flamme', x: 43, y: 80.5, proche: true },                                              // (5) lanterne
];

/* Premier écran (le lac) et ses photos du moment, choisies comme les autres par ecranDuMoment */
export const INTRO = {
    fond: fondAccueil, ratio: 1536 / 1024, effets: EFFETS_LAC,
    variantes: [
        // Nuit d'hiver : le lac gelé sous la lune ; la lanterne, la brume de la cascade, étoiles et flocons
        { theme: 'nuit', saisons: ['hiver', 'noel'], fond: fondAccueilNuitHiver, ratio: 1264 / 843, ciel: CIEL['accueil-lac-nuit-hiver'], etoiles: true, floconsSeuls: true,
          effets: [{ type: 'lune', x: 81.5, y: 17.5, t: 7 }, { type: 'brume', x: 33, y: 36, l: 14, h: 12 }, { type: 'flamme', x: 42.2, y: 80.4, proche: true }] },
        // Les autres nuits : la pleine lune sur le lac, la cascade, la lanterne, les étoiles
        { theme: 'nuit', fond: fondAccueilNuit, ratio: 1536 / 1024, ciel: CIEL['accueil-lac-nuit'], etoiles: true,
          effets: [{ type: 'lune', x: 82.1, y: 15.1, t: 8 }, { type: 'brume', x: 34, y: 37, l: 12, h: 10 }, { type: 'flamme', x: 42.4, y: 78.9, proche: true }] },
        // L'hiver, le jour : le lac gelé ; nuages, brume, lanterne et flocons
        { saisons: ['hiver', 'noel'], fond: fondAccueilHiver, ratio: 1264 / 843, floconsSeuls: true,
          effets: [{ type: 'nuages', x: 40, y: 3, l: 60, h: 20 }, { type: 'brume', x: 33, y: 36, l: 14, h: 12 }, { type: 'flamme', x: 42.2, y: 80.4, proche: true }] },
    ],
};

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
const aujourdhui = () => {
    const d = new Date();
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const ecranDuMoment = (ecran, theme, saison) => {
    const variante = ecran.variantes?.find((v) => (!v.theme || v.theme === theme) && (!v.saisons || v.saisons.includes(saison))
        && (!v.jours || v.jours.includes(aujourdhui())));
    if (!variante) return ecran;
    // Sans « effets » propres, la variante garde ceux de l'écran de base (+ effetsEnPlus) ;
    // les étoiles sont posées dans le ciel de la photo (CIEL, calculé pour chaque photo de nuit)
    const effets = variante.effets ? [...variante.effets] : [
        ...ecran.effets.filter((e) => !variante.retirer?.includes(e.type)),
        ...(variante.effetsEnPlus ?? []),
    ];
    if ((variante.etoiles || variante.etoilesSeules) && variante.ciel) effets.push({ type: 'etoiles', points: variante.ciel });
    return { ...ecran, ...variante, effets };
};
