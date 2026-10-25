# Brief design ORIVY

Source de vérité pour l'identité visuelle et les maquettes. Le skill `/orivy-design` le lit
à chaque étape. Toute décision prise en cours de route est notée dans `PROGRESSION.md`.

## 1. Le produit
ORIVY est une application web pour découvrir des lieux partout en France (monuments, musées,
parcs, randonnées, villages, points de vue, restaurants, bars, cinémas, événements),
les voir sur une carte, et organiser des "sorties" à plusieurs : on crée une sortie
sur un lieu, d'autres s'y inscrivent, on suit des profils, on partage des photos,
on commente et on discute.

## 2. Les utilisateurs
- Cible principale : 20-50 ans, citadins, qui cherchent des idées de sorties le week-end.
- Zone : la France entière.
- Usage : mobile en priorité, mais aussi sur ordinateur.
- Deux rôles : utilisateur (explore, crée et rejoint des sorties) et admin (gère les lieux/activités).

## 3. Ambiance et identité
- 3 mots-clés : chaleureux, aventure, convivial.
- Références, et ce qu'on leur emprunte :
  - Prairie / "Les pépites de France" : la présentation des lieux, grandes images, ton inspirant.
  - Waze : une carte simple, lisible, ludique, avec des épingles bien visibles.
  - Strava : le côté social (suivre des profils, voir l'activité des autres, réagir).
  - TikTok : la navigation verticale fluide, au pouce.
- À éviter : look "tableau de bord d'entreprise", trop de dégradés, interface néon
  (le néon est réservé aux enseignes des illustrations), interface trop complexe.
- Style général : nature, tons naturels, matières douces.
- Typographie : un duo de polices Google Fonts (titres + texte).
- Logo : un logotype qui mêle les lettres du nom ORIVY (lettres entrelacées ou
  qui se fondent les unes dans les autres), décliné en version complète et en monogramme
  (favicon, avatar de l'app). Il doit fonctionner en clair et en sombre.

## 4. Ton et textes
- Tutoiement partout ("Découvre les lieux autour de toi", "Retourne à la carte").
- Ton chaleureux, simple, enthousiaste, jamais corporate.
- Mots clés de l'accroche : **découvre, vis, profite**.
  Pistes : "Découvre. Vis. Profite." / "Découvre la France, vis l'instant, profite à plusieurs."
- Nom du restaurant sur l'enseigne néon : **Chez Orivy**.

## 5. Contrainte couleur importante
Chaque catégorie a déjà une couleur, utilisée pour les épingles de la carte et les badges.
Ces couleurs ne changent jamais de teinte, quels que soient l'heure ou la saison
(seule une version plus claire est autorisée la nuit, pour la lisibilité).
La palette globale doit rester harmonieuse avec elles :
monument #ef6f61, culture #b5527a, parc #4f9d69, promenade #3c5960, village #c98a3c,
observatoire #5468c9, sport #2a9d8f, restaurant #f4a259, bar #8d5b4c, cinéma #6d597a,
événement #e76f51, autre #6b7280.
Proposer une couleur principale, une couleur d'accent, et des neutres (fond, surface, texte, bordures).

## 6. Thèmes automatiques
Deux systèmes indépendants qui se combinent, posés sur la balise <html> :
`<html data-theme="..." data-saison="...">`
- Le thème horaire gère la luminosité (fond, surface, texte, bordures).
- La saison gère la couleur principale, l'accent et de petites décorations,
  **de jour comme de nuit** : chaque saison définit une variante claire
  (aube, jour, crépuscule) et une variante sombre (nuit) de sa principale et de son accent,
  pour rester lisible et respecter le contraste AA dans les deux cas.

### 6.1 Thème selon l'heure
- Aube (6h-9h) : tons pêche et rosés, lumière douce.
- Jour (9h-18h) : thème clair principal, tons naturels lumineux.
- Crépuscule (18h-21h) : tons dorés et orangés, plus chauds.
- Nuit (21h-6h) : thème sombre mais naturel (vert forêt / bleu nuit profond, pas de noir pur).
- Couleurs des catégories : version plus claire de la même teinte la nuit si besoin.
- Le passage d'un thème à l'autre se fait en douceur (transition des couleurs).
- Le thème est choisi avant l'affichage de la page (script dans index.html),
  pour éviter un flash au chargement, puis revérifié toutes les minutes.

### 6.2 Ambiance selon la saison (jour et nuit)
- Printemps : vert tendre, fleurs discrètes.
- Été : jaune soleil et bleu ciel.
- Automne : orange et vert mousse, feuilles mortes.
- Hiver : bleu glacier et blanc, quelques flocons.
- Événements prioritaires sur la saison :
  - Halloween (20-31 octobre) : citrouilles, orange et violet doux.
  - Noël (1er-26 décembre) : rouge et vert sapin, boules et flocons.
- Règles :
  - Le rouge de Noël ne doit pas être confondu avec le bouton "danger".
  - Les décorations restent discrètes (coin du header, logo, états vides), décoratives
    (aria-hidden), et n'empêchent jamais un clic.
- Selon la saison, l'accueil met en avant d'autres catégories en premier
  (automne : promenades ; hiver : musées et événements ; été : points de vue et bars).

### 6.3 Réglages utilisateur
- Thème : Automatique (par défaut) / Jour / Nuit.
- Décorations saisonnières : activées (par défaut) / désactivées.
- Choix enregistrés dans le navigateur (localStorage).

## 7. Les pages

### 7.1 Accueil : l'effet "tornade" (élément signature, ordinateur uniquement)

Version ordinateur (écran large et souris) :
L'accueil est une suite d'écrans plein écran (100vh). En descendant, on passe de l'un
à l'autre avec une transition en spirale :
- Écran 1 : un grand paysage, le logo ORIVY, l'accroche, et deux boutons
  ("Explore la carte", "Vois les sorties").
- En descendant, l'écran actuel tourne sur lui-même, rétrécit et s'efface vers le centre,
  comme aspiré par une tornade. L'écran suivant arrive en tournant dans l'autre sens
  et en grandissant jusqu'à remplir l'écran.
- Chaque écran suivant présente une catégorie, en alternant la disposition
  (illustration à gauche / texte à droite, puis l'inverse) : musée, parc, randonnée,
  village, point de vue, restaurant, bar, cinéma, événement, monument.
  L'ordre change selon la saison (voir 6.2).
- Chaque écran de catégorie contient : le badge de la catégorie (avec sa couleur),
  un titre court, une phrase d'accroche, et un bouton "Vois les [catégorie] sur la carte".
- Dernier écran : les 3 prochaines sorties (cartes de sortie) et un bouton "Crée une sortie".
- Un indicateur de progression discret (points ou mini-boussole) montre l'écran actuel.

Version mobile et tablette : simple, sans spirale
- Même contenu, dans le même ordre, mais en défilement vertical classique.
- Écran 1 : le paysage en plein écran avec l'accroche et les deux boutons.
- Ensuite, les catégories sous forme de blocs empilés : illustration en haut,
  texte et bouton en dessous. Pas d'alternance gauche/droite.
- Au plus, un léger fondu à l'apparition de chaque bloc. Aucune rotation ni zoom.
- Les 3 prochaines sorties défilent horizontalement au pouce (carrousel simple).
- La page doit se charger vite : éléments légers et chargés au fur et à mesure (lazy loading).

Illustrations des écrans (accueil uniquement ; les autres pages gardent des photos) :
- Chaque écran est une illustration en SVG.
- Style commun : dessin au trait noir (style encre), aplats de la couleur de la catégorie,
  fond aux tons naturels. Le néon est réservé aux enseignes, jamais à l'interface.
- Scènes :
  - Monument : silhouette d'un château ou d'un pont de pierre, des oiseaux qui passent.
  - Musée : façade parisienne haussmannienne avec colonnes, enseigne néon "Musée".
  - Parc : deux personnes dessinées au trait noir assises sur l'herbe, un grand arbre,
    des feuilles qui tombent lentement.
  - Randonnée : randonneur avec sac à dos sur un sentier de montagne, des sapins.
  - Village : ruelle en pierre, volets colorés, un chat sur un muret.
  - Point de vue : une personne assise au bord d'une falaise au coucher du soleil.
  - Restaurant : bistrot parisien, auvent rayé, tables en terrasse, enseigne néon "Chez Orivy".
  - Bar : terrasse de guinguette avec guirlandes lumineuses.
  - Cinéma : façade Art déco avec enseigne néon "Cinéma".
  - Événement : fête de village avec lampions et silhouettes qui dansent.
- Petites animations : feuilles qui tombent, néon qui s'allume doucement, guirlandes
  qui scintillent. Le néon ne clignote jamais vite (pas plus de 3 flashs par seconde).
- L'arbre du parc change selon la saison (fleurs, feuillage d'été, feuilles orange
  qui tombent, neige).
- Sur mobile : mêmes illustrations, mais fixes et allégées.

Contraintes techniques de l'accueil :
- La spirale ne s'active que sur ordinateur :
  `@media (min-width: 1024px) and (hover: hover) and (pointer: fine)`.
  En dessous, c'est la version mobile.
- Mobile first : le CSS de base est la version mobile simple, la spirale s'ajoute
  par-dessus dans la media query ordinateur.
- Pas de librairie d'animation : CSS (scroll-snap, transform, scroll-driven animations)
  avec un repli en JavaScript (IntersectionObserver) si le navigateur ne le gère pas.
- Animer uniquement transform et opacity.
- Le contenu reste lisible et cliquable sans l'animation.
- Documenter précisément l'animation (durée, rotation en degrés, échelle).

### 7.2 Les autres pages
1. Activités / lieux : liste filtrable par catégorie, cartes avec photo, système de proximité :
   - Bouton "Autour de moi" qui demande la position (jamais au chargement).
   - Position refusée : champ pour taper une ville.
   - Distance sur chaque carte ("à 2,3 km", "à 800 m" sous 1 km).
   - Tri : plus proche / mieux noté / plus récent.
   - Filtre de rayon : 1, 5, 10, 25, 50 km (simple au pouce).
   - Distance à vol d'oiseau (formule de Haversine), calculée côté front.
2. Carte : plein écran (Leaflet), centrée par défaut sur la France entière,
   épingles colorées par catégorie, filtres, panneau de détail au clic sur un lieu
   (tiroir qui monte du bas sur mobile), bouton "me localiser", point bleu pour
   la position, cercle qui montre le rayon choisi.
3. Sorties : liste des sorties à venir (lieu, date, distance, organisateur, nombre d'inscrits).
4. Détail d'une sortie : infos, participants, bouton s'inscrire, photos, commentaires.
5. Créer / modifier une sortie : formulaire (titre, lieu, date, description).
6. Profil : avatar, bio, abonnés/abonnements, sorties organisées et passées,
   accès aux réglages (thème, décorations saisonnières).
7. Communauté : trouver et suivre des profils (design libre, dans l'esprit Strava).
8. Messages : conversations entre utilisateurs (design libre).
9. Notifications : nouvelles inscriptions, abonnés, commentaires (design libre).
10. Connexion et inscription.
11. Admin : gestion des lieux et activités (tableau simple).
12. Page 404.

## 8. Composants
Barre de navigation (barre en haut sur desktop, barre d'onglets en bas sur mobile),
logo, carte de lieu (avec distance), carte de sortie, carte d'utilisateur, avatar,
badge de catégorie, badge de distance, filtre de rayon, bouton "Autour de moi",
bouton d'abonnement, galerie photos, fil de commentaires, bulle de message,
élément de notification, champs de formulaire, boutons (principal, secondaire, danger),
interrupteurs de réglages, états vides, chargement et erreur (avec une petite
décoration saisonnière).

## 9. Contraintes techniques
- Front en React + Vite, styles en CSS pur (pas de Tailwind ni de librairie UI).
- Icônes : SVG inline dans le style Lucide (trait 2px, coins arrondis), copiées dans
  le projet, sans dépendance npm.
- Photos des lieux : Unsplash, comme dans `Constants/categories.js`.
- Variables CSS (:root) pour couleurs, espacements, rayons, ombres, polices
  et durées d'animation.
- Responsive : mobile d'abord, puis tablette et desktop.
- Accessibilité : contraste AA pour chaque combinaison thème horaire × saison,
  focus visible, zones de clic d'au moins 44px.
- Toutes les animations (spirale, feuilles, neige, néon) sont coupées ou remplacées
  par un simple fondu avec prefers-reduced-motion.
