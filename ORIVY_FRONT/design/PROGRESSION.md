# Progression du design ORIVY

Mis à jour par le skill `/orivy-design` après chaque étape.

## Étapes

- [x] 1. Direction artistique → `01-direction-artistique.md`
- [x] 2. Logo (logotype + monogramme) → `logo/`
- [x] 3. Design system (palette, typo, espacements, rayons, ombres) → `design-system.css`
- [x] 4. Thèmes horaires → `themes.css`, `themes.js`
- [x] 5. Saisons et événements (jour + nuit) → `saisons.css`, `saisons.js`, `decorations/`
- [x] 6. Icônes → `icones/`
- [x] 7. Catalogue de composants → `composants.html`
- [x] 8. Maquette Accueil mobile → `maquettes/accueil.html`
- [x] 9. Illustrations SVG de la spirale → `illustrations/`
- [x] 10. Accueil ordinateur avec l'effet tornade → `maquettes/accueil.html`
- [x] 11. Maquette Carte → `maquettes/carte.html`
- [x] 12. Maquette Détail d'une sortie → `maquettes/sortie.html`
- [x] 13. Maquette Activités / lieux (proximité) → `maquettes/activites.html`
- [x] 14. Maquette Sorties → `maquettes/sorties.html`
- [x] 15. Maquette Créer / modifier une sortie → `maquettes/sortie-formulaire.html`
- [x] 16. Maquette Profil + réglages → `maquettes/profil.html`
- [x] 17. Maquettes Communauté, Messages, Notifications → `maquettes/`
- [x] 18. Maquettes Connexion / Inscription → `maquettes/auth.html`
- [x] 19. Maquettes Admin et 404 → `maquettes/`

## Journal des décisions

<!-- Une ligne par décision validée : date — étape — décision -->
2026-10-22 — étape 1 — Palette « Terre & sauge » : principale terracotta #A34E2C (nuit #E58E6A), accent sauge #6E8F5F (nuit #A9C49A), sauge foncée #4E6B42 pour le texte.
2026-10-22 — étape 1 — Neutres jour : fond #F6EFE6, surface #FFFBF6, texte #2E2622, texte doux #6B5D52, bordure #E6D9CA, bordure forte #9C8B7C. Nuit : fond #16211C, surface #21302A, texte #EDE6DA, texte doux #B4AA9C.
2026-10-22 — étape 1 — Sauge ajustée de #7A9A6B à #6E8F5F pour passer le 3:1 (élément d'interface).
2026-10-22 — étape 1 — Danger en rouge framboise froid #A8173A (nuit #FF8A80), toujours avec icône et verbe ; le rouge de Noël sera chaud (écarlate).
2026-10-22 — étape 1 — Terracotta jamais utilisée sur la carte ; badges de catégorie toujours avec icône + nom (bar #8d5b4c est la catégorie la plus proche).
2026-10-22 — étape 1 — Typographie : Fraunces 600/700 (titres, ≥ 20px) + DM Sans 400/500/700 (texte, boutons, chiffres).
2026-10-22 — étape 1 — Formes : rayons 12 / 20 / 28px + pilule, ombres douces teintées (3 niveaux max), grain papier ~3% sur le fond uniquement.
2026-10-22 — étape 1 — Accroche écran 1 : « Découvre la France, vis l'instant, profite à plusieurs. » ; signature courte : « Découvre. Vis. Profite. »
2026-10-22 — étape 2 — Concept « sentier + épingle » : le O est une épingle de carte (cercle + pointe en V), un sentier en pointillés part de sa pointe et se fond dans le pied recourbé du Y.
2026-10-22 — étape 2 — Lettres R I V Y en capitales géométriques à trait constant (10 sur une hauteur de 54), bouts arrondis.
2026-10-22 — étape 2 — Couleur : lettres et sentier en couleur du texte (currentColor), épingle en couleur principale (variable, donc recolorable par les saisons).
2026-10-22 — étape 2 — Logotype : largeur minimale 140px ; en dessous, monogramme (épingle + 3 points), taille mini 24px.
2026-10-22 — étape 2 — Favicon : épingle seule crème sur pavé terracotta ; icône d'app : épingle + 3 points sur fond plein (zone sûre 80%).
2026-10-22 — étape 2 — Interdits : épingle jamais aux couleurs d'une catégorie, pas d'ombre ni de néon, pas de logotype sans sentier.
2026-10-22 — étape 3 — Variables en deux couches : palette brute (--terracotta-600…) puis rôles (--couleur-fond, --couleur-principale…) ; thèmes et saisons ne redéfinissent que les rôles.
2026-10-22 — étape 3 — Bordure forte foncée de #9C8B7C à #8E7D6F (3:1 aussi sur la surface en creux #EFE5D8, ajoutée pour champs et filtres inactifs).
2026-10-22 — étape 3 — La sauge (accent) ne se pose jamais sur la surface en creux (2,93:1).
2026-10-22 — étape 3 — Texte sur les couleurs de catégorie : papier #FFFBF6 (culture, promenade, observatoire, bar, cinéma, autre) ou encre profonde #1F1915 (monument, parc, village, sport, restaurant, événement) ; tous ≥ 4,58:1.
2026-10-22 — étape 3 — Survols : principale #873F22, danger #8E1230. Succès = sauge foncée (pas de vert supplémentaire).
2026-10-22 — étape 3 — Échelle typo 1,25 (12,8 / 14 / 16 / 20 / 25 / 31 / 31→39 / 39→61px) ; h4 et plus petits en DM Sans 700.
2026-10-22 — étape 3 — Espacements multiples de 4px (--espace-1 à 9), marge de page 16 / 24 / 32px ; points de rupture 768 et 1024px ; zone de clic 44px.
2026-10-22 — étape 3 — Ombres teintées brun (RGB 84 52 30) sur 3 niveaux ; durées 150 / 250 / 400ms, 1200ms pour les changements de thème.
2026-10-22 — étape 3 — Grain papier en body::before, z-index -1 (sous le texte), opacité 3,5 %, retiré sous prefers-contrast: more.
2026-10-22 — étape 4 — Intensité « nuancée » : aube fond #F8E9E3 / surface #FFF8F5 / creux #F5E5DE ; crépuscule fond #F6EAD8 / surface #FFF8EC / creux #F2E4D0 (éclaircis pour que la terracotta passe 4,5:1 sur le creux).
2026-10-22 — étape 4 — Nuit : fond #16211C, surface #21302A, creux #1A2722 (plus sombre que la carte), texte #EDE6DA, doux #B4AA9C, bordure #2E4038, bordure forte #6F8579 ; boutons clairs avec texte sombre #16211C.
2026-10-22 — étape 4 — Danger nuit changé de #FF8A80 à #FF8FA8 (framboise clair, écart RGB 67 avec la terracotta de nuit au lieu de 34).
2026-10-22 — étape 4 — Catégories la nuit : même teinte éclaircie pour culture #C06B8D, promenade #5F8D98, observatoire #6F80D2, bar #AE7868, cinéma #937EA1, autre #7D8492 (icône ≥ 3:1 sur surface, badge en encre profonde ≥ 4,5:1) ; les 6 autres inchangées.
2026-10-22 — étape 4 — Changement de thème = fondu d'opacité via l'API View Transitions (1200ms), pas de transition de couleur ; changement immédiat au chargement, au retour sur l'onglet et sous prefers-reduced-motion.
2026-10-22 — étape 4 — themes.js : script bloquant dans le <head>, réglage localStorage « orivy-theme » (auto / jour / nuit), revérification chaque minute, événement « orivy:theme », API window.orivyTheme, met à jour <meta name="theme-color">.
2026-10-22 — étape 4 — Sélecteurs [data-theme="…"] (pas :root) pour permettre l'aperçu côte à côte ; les variables dépendantes (focus, ombres) sont redéclarées sur chaque élément thémé.
2026-10-22 — étape 4 — Outils de maquette : outils/selecteur-apercu.js (panneau flottant heure) et outils/verifier-contrastes.js (172 couples, 0 échec).
2026-10-22 — étapes 5 à 19 — Choix groupés : principale « terracotta déclinée » selon la saison ; onglets mobiles Accueil / Carte / Sorties / Messages / Profil (Communauté via une loupe et Notifications via une cloche dans l'en-tête, Lieux via la bascule carte/liste) ; carte de lieu photo + texte dessous ; Sorties en fil vertical plein écran sur mobile.
2026-10-22 — étape 5 — Clair / nuit : printemps #A9463F / #D08680 + vert #63924B (texte #4B6F39) / #6BA94C ; été #975523 / #D48649 + bleu ciel #3F8CC2 (texte #2F6993) / #56A0D5 ; automne #A04D2C / #D58565 + mousse #808C42 (texte #606A32) / #91A145 ; hiver = terracotta de base + glacier #4B8EAF (texte #396B84) / #57A1C7 ; Halloween #A24C1A / #E17F47 + violet #9778BA (texte #7954A3) / #AC8BD3 ; Noël #C12C15 / #EE7563 + sapin #42946B (texte #337152) / #51A97D.
2026-10-22 — étape 5 — Hiver garde la terracotta de base : la variante plus froide tombait à 23 d'écart RGB de la catégorie bar.
2026-10-22 — étape 5 — Noël en écarlate chaud (teinte 8°) contre le danger framboise (346°) ; règle : le bouton danger est TOUJOURS en contour + icône + verbe, l'aplat rouge n'apparaît que dans la fenêtre de confirmation.
2026-10-22 — étape 5 — Calendrier : printemps 20/03, été 21/06, automne 23/09, hiver 21/12 ; Halloween 20–31/10 et Noël 1–26/12 prioritaires. Réglage « orivy-decorations » (on/off) → html[data-decorations].
2026-10-22 — étape 5 — Décorations : coin de l'en-tête (.deco-coin), mini près du logo (.deco-mini), état vide (.deco-vide), 6 particules qui tombent (.deco-chute, pas en été) ; fichiers dans decorations/ ; animations transform/opacity, coupées sous prefers-reduced-motion.
2026-10-22 — étape 5 — Ordre des catégories de l'accueil par saison dans saisons.js (orivySaison.ordreCategories()).
2026-10-22 — étape 5 — Vérificateur étendu : 508 couples (4 thèmes + 24 combinaisons thème × saison), 0 échec.
2026-10-22 — étape 6 — 63 icônes style Lucide (51 interface + 12 catégories) dans une source unique icones/icones.js : sprite injecté pour les maquettes (<use href="#i-nom">), un .svg par icône dans icones/svg/ via outils/generer-icones.cjs (.cjs car le front est en "type": "module").
2026-10-22 — étape 6 — Tailles d'icône : 16px dans le texte, 24px par défaut, 32px dans la barre d'onglets ; icône seule dans un bouton = aria-label sur le bouton.
2026-10-22 — étape 7 — composants.css : 22 blocs nommés en BEM français (un futur composant React chacun) ; classes .cat-xxx qui fournissent --cat / --cat-texte à tout leur contenu.
2026-10-22 — étape 7 — Photo avec repli : aplat de la couleur de catégorie + son icône si l'image manque ; seules les 8 photos Unsplash de Constants/categories.js sont utilisées ; avatars en initiales (aucune photo de personne).
2026-10-22 — étape 7 — Cartes cliquables en entier via le lien du titre (::after), un seul arrêt de tabulation ; filtre de rayon et choix du thème = vrais boutons radio.
2026-10-22 — étape 7 — En-tête et barre d'onglets insérés par maquettes/commun.js (data-page sur <body>) ; sur ordinateur, les onglets passent dans la barre du haut, Profil devient l'avatar.
2026-10-22 — étape 7 — La décoration de coin « pend » sous l'en-tête (top: 100%) pour ne jamais recouvrir la loupe, la cloche ou l'avatar ; panneau « Aperçu » des maquettes replié par défaut.
2026-10-22 — étape 8 — Accueil mobile : paysage dans les 62 % du haut + carte de texte posée dessus ; titre 31px sur mobile, 39→61px dès la tablette ; catégories empilées (illustration 4:3 puis texte) ; sorties en carrousel à 85 % de large (on voit la suivante).
2026-10-22 — étape 8 — Fondu à l'apparition : animation liée au défilement (animation-timeline: view(), entrée 0→40 %), repli IntersectionObserver via html.js-repli ; sans JS tout reste visible.
2026-10-22 — étape 8 — Ordre des écrans de catégorie réarrangé par accueil.js selon orivySaison.ordreCategories().
2026-10-22 — étape 9 — 11 illustrations SVG 800×600 (paysage 1600×1000) : trait encre #1F1915, aplats de la couleur de catégorie, fonds naturels ; néon (avec halo) seulement sur « Musée », « Chez Orivy », « Cinéma ».
2026-10-22 — étape 9 — Animations internes aux SVG, actives seulement si l'image fait plus de 480px de large (donc fixes sur mobile) et sans prefers-reduced-motion ; néon : allumage 3 s puis respiration 0,85↔1 en 4 s ; guirlandes : cycles ≥ 2,4 s (< 3 flashs/s).
2026-10-22 — étape 9 — Arbre du parc saisonnier dans un seul fichier via :target (parc.svg, #printemps, #automne, #hiver) ; règle : une seule classe de saison par élément.
2026-10-22 — étape 10 — Tornade (≥ 1024px + survol + pointeur fin) : écrans de 100vh − en-tête, scroll-snap obligatoire ; animation liée au défilement : sortie 0°→+150°, échelle 1→0,15, opacité 1→0 ; entrée +150°→0° (sens inverse), 0,15→1, 0→1 ; contre-translation ±100 % pour garder la scène au centre ; durée = un cran de défilement (~500–700 ms).
2026-10-22 — étape 10 — Repli sans animation-timeline : transition 900 ms (même rotation/échelle) déclenchée par IntersectionObserver ; mouvement réduit : simple fondu d'opacité ; au repos transform: none (lisible et cliquable).
2026-10-22 — étape 10 — Alternance illustration gauche / droite par :nth-child(even) après le tri saisonnier ; indicateur de progression = points à droite (zones de 44px), écran courant si ≥ 60 % visible.
2026-10-22 — étape 10 — En-tête à hauteur FIXE (--hauteur-entete : 73px mobile, 89px ordinateur) : la hauteur calculée d'après le contenu (logo) faussait le calage du scroll-snap.
2026-10-22 — étape 11 — Carte Leaflet 1.9.4 centrée sur la France (zoom 5 mobile, 6 ordinateur) ; tuiles OpenStreetMap standard, inversées en CSS la nuit (les fonds CARTO exigent désormais une clé d'API).
2026-10-22 — étape 11 — Épingles = goutte de la couleur de catégorie + icône (texte --cat-texte), liseré surface, accessibles au clavier ; épingle active agrandie ×1,3 ; épingles hors rayon à 45 % d'opacité.
2026-10-22 — étape 11 — Point bleu de position : nouvelle variable --couleur-position (#2E6FD6, nuit #6FA3FF), halo qui pulse (coupé sous mouvement réduit) ; cercle du rayon en pointillés.
2026-10-22 — étape 11 — Tiroir de lieu (photo, note, distance, description, prochaines sorties, « Crée une sortie ici », « Itinéraire ») ; Échap ou clic sur la carte le ferme et rend le focus à l'épingle.
2026-10-22 — étape 11 — #carte en isolation: isolate pour que les calques Leaflet (z-index 400–800) restent sous le tiroir et les onglets.
2026-10-22 — étape 11 — Données de démonstration sur des week-ends réels (25 oct. 2026 = dimanche) ; données et calculs partagés dans maquettes/donnees.js et maquettes/proximite.js.
2026-10-22 — étape 12 — Détail d'une sortie : photo du lieu en tête (16:10 mobile, 21:8 arrondie sur ordinateur), infos pratiques avec icônes, programme, participants (organisatrice signalée), galerie, commentaires + saisie.
2026-10-22 — étape 12 — Inscription : barre collée en bas sur mobile (au-dessus des onglets), encart collant à droite sur ordinateur avec jauge des places ; les deux boutons restent synchronisés ; confirmation par toast.
2026-10-22 — étape 12 — Zone organisatrice (Modifier / Supprimer en contour danger + fenêtre de confirmation) ; règle CSS : tout composant avec un display explicite reçoit [hidden] { display: none }.
2026-10-22 — étape 13 — Proximité : « Autour de moi » (position demandée au clic uniquement) + champ « Ou tape une ville » toujours visible ; refus → message dans un encart et focus sur le champ ville.
2026-10-22 — étape 13 — Rayon 1/5/10/25 (défaut)/50 km désactivé tant qu'aucune position n'est connue ; tri « plus récent » sans position, « plus proche » dès qu'une position existe ; compteur annoncé (aria-live) « 6 lieux à moins de 25 km de Lyon ».
2026-10-22 — étape 13 — Distance Haversine côté front, format « à 400 m » / « à 2,1 km » / « à 48 km » ; état vide avec « Passer à 50 km ».
2026-10-22 — étape 13 — À signaler : l'image par défaut « monument » de Constants/categories.js montre le Taj Mahal (à remplacer par un monument français).
2026-10-22 — étape 14 — Sorties : fil vertical plein écran sur mobile (scroll-snap obligatoire, une sortie par écran, photo bord à bord), actions au pouce à droite (j'aime, commentaires, partager), filtres posés en haut ; grille 3 colonnes (cartes 3:4) sur ordinateur.
2026-10-22 — étape 14 — Texte sur photo en clair FIXE (--argile-50) sur un voile sombre à 85–92 % en bas : seule exception aux dégradés, contraste garanti quelle que soit la photo.
2026-10-22 — étape 15 — Formulaire unique créer / modifier (?mode=modifier : champs préremplis, bouton « Enregistre les modifications », zone danger encadrée en framboise) ; arrivée depuis la carte (?lieu=…) préremplit le lieu.
2026-10-22 — étape 15 — Lieu en combobox accessible (flèches, Entrée, aria-activedescendant) ; type de sortie en boutons radio stylés en puces, choisi automatiquement d'après le lieu ; compteur 0/600 ; photo facultative.
2026-10-22 — étape 15 — Validation à l'envoi : message sous chaque champ (icône + texte), aria-invalid, focus sur le premier champ fautif ; aperçu en direct de la carte de sortie sur ordinateur.
2026-10-22 — étape 16 — Profil : avatar XL, ville, bio, statistiques (abonnés / abonnements / sorties), onglets Organisées / Passées / Photos (motif ARIA tabs, flèches du clavier) ; profil d'autrui (?u=…) : « Suivre » + « Message », sans réglages.
2026-10-22 — étape 16 — Réglages branchés : Thème Automatique / Jour / Nuit → orivyTheme.choisir() ; décorations → orivySaison.activerDecorations() ; notifications par type ; lien Administration visible pour les admins.
2026-10-22 — étape 16 — Règle globale [hidden]:not(.tiroir) { display: none !important } dans design-system.css : l'attribut hidden l'emporte toujours sur un display de composant.
2026-10-22 — étape 17 — Communauté (esprit Strava) : recherche, fil d'activité des abonnements avec réactions (j'aime, commentaires) et vignette du lieu, suggestions « Près de toi » et « Les plus actifs » avec bouton Suivre.
2026-10-22 — étape 17 — Messages : liste OU conversation sur mobile (bouton retour), deux colonnes sur ordinateur ; hauteur fixe, seul le fil défile ; sortie partagée en mini-carte dans une bulle ; Entrée envoie, Maj+Entrée va à la ligne.
2026-10-22 — étape 17 — Notifications groupées (Aujourd'hui / Cette semaine), point de non-lu + texte caché pour lecteurs d'écran, actions directes (« Suis en retour », « Réponds »), « Tout marquer comme lu » efface aussi la pastille de la cloche.
2026-10-22 — étape 18 — Connexion / inscription sur une seule page à deux onglets (#inscription ouvre le second) ; paysage + signature « Découvre. Vis. Profite. » en moitié gauche sur ordinateur ; pas de navigation ni de barre d'onglets avant connexion.
2026-10-22 — étape 18 — Bouton œil pour afficher/masquer le mot de passe (aria-pressed + libellé qui change), exigences vérifiées en direct (8 caractères, un chiffre, une majuscule), autocomplete renseigné, erreurs sous le champ avec icône.
2026-10-22 — étape 19 — Admin : chiffres clés, recherche + filtre de catégorie, tableau (badge, note, sorties, statut Publié / En attente, actions modifier + supprimer en contour danger avec confirmation) ; sur mobile chaque ligne devient une carte (data-label), sans défilement horizontal ; pagination 44px.
2026-10-22 — étape 19 — 404 : « Oups, ce sentier ne mène nulle part », épingle perdue au bout d'un sentier en pointillés (SVG en ligne aux couleurs du thème et de la saison, balancement coupé sous mouvement réduit), décoration saisonnière d'état vide, boutons « Retourne à l'accueil » et « Explore la carte ».
2026-10-22 — fin — Sommaire de tous les livrables : design/index.html. Vérification finale : 508 couples de contrastes AA sans échec, 94 SVG valides, aucune couleur en dur dans les feuilles de composants/pages, aucune des 19 pages ne déborde à 375 / 768 / 1280px.
2026-10-22 — retouche étape 18 — À la demande de l'utilisateur, le paysage des pages connexion / inscription est remplacé par une carte au trésor (illustrations/carte-tresor.svg) : parchemin sur table en bois, sentier en pointillés du village au trésor, épingle ORIVY sur le X, rose des vents, voilier ; animations transform seulement (épingle, aiguille, bateau, vagues).
2026-10-23 — accueil — Fonds photo fournis par l'utilisateur : premier écran = couple en pique-nique face à un lac au coucher du soleil (fonds/accueil-lac.jpg), carte de texte en bas à droite sur ordinateur ; écran Musées = place parisienne, fontaine et façade haussmannienne avec « MUSÉE » en lettres dorées gravées au-dessus des arcades (fonds/musee.jpg), photo plein écran et carte de texte en bas à gauche. Les autres écrans gardent leurs illustrations ; la tornade est conservée.
2026-10-23 — accueil — Transition entre écrans : la tornade (rotation 150°) est remplacée par la « plongée », toujours liée au défilement : l'écran qui sort grossit de ×1 à ×1,6 et s'efface (opacité 0 dès 65 %), le suivant arrive de ×0,8 à ×1 ; aucune rotation ; fondu simple sous mouvement réduit.
2026-10-23 — accueil — Photos fournies par l'utilisateur pour Restaurant (bistrot haussmannien « ORIVY », fonds/restaurant.jpg) et Monument (château au bord d'un étang, fonds/monument.jpg) ; toutes les photos ont un lent zoom permanent « Ken Burns » (classe photo-vivante, 24 s aller-retour, transform seulement, coupé sous mouvement réduit).
2026-10-23 — accueil — La « plongée » est remplacée par le « scan », plus doux : l'écran qui part recule à peine (×0,97) et s'estompe (opacité 0,2), le suivant monte de 6 % en apparaissant, et une fine ligne lumineuse cyan (halo léger) le balaie de bas en haut. Zoom permanent des photos retiré (il agrandissait des images déjà basse définition). Piège noté : overflow: clip et non hidden sur .ecran, sinon view() suit l'écran au lieu de la page.
2026-10-23 — accueil — Animations légères sur les photos, sans zoom : halo doré qui respire et dérive (14 s), 12 grains de lumière qui montent en oscillant (13 à 20 s) ; composant <Ambiance /> (aria-hidden, pointer-events: none), grains retirés sous mouvement réduit. Images restaurant et monument remplacées par des versions 1376×768.
2026-10-23 — accueil — Photos Parc (jardin parisien, bassin aux voiliers) et Randonnée (sentier vers le puy de Dôme, panneau GR4) intégrées ; nouvelle option « carte » par écran (bas-gauche par défaut, bas-droite, haut-gauche, haut-droite) pour que la carte de texte ne cache ni les personnes ni le sujet : Parc et Randonnée en haut.
2026-10-23 — accueil — Ambiances par écran (<Ambiance type>) : premier écran (lac) et Randonnée = feuilles d'érable orange qui tombent en tournoyant (3 teintes, decorations/feuille-erable-1..3.svg) ; Monuments = fleurs de lys dorées qui tombent en se balançant (decorations/fleur-de-lys.svg) ; Musée, Parc, Restaurant = halo + grains de lumière (inchangé). Tout en transform/opacity, particules retirées sous mouvement réduit.
2026-10-23 — accueil — Monuments : les fleurs de lys sont retirées (fichier supprimé) et remplacées par une petite volée d'oiseaux qui traverse le ciel de gauche à droite (22 à 34 s) en battant des ailes (0,5 s) ; decorations/oiseau.svg.
2026-10-24 — animations — 99 propositions sur 100 réalisées (la 10, pigeons, refusée), dans src/Style/animations.css. Photos : composant Accueil/PhotoAnimee.jsx qui recadre l'image à la main (unités cqw/cqh) pour poser chaque effet en % DE L'IMAGE ; effets par écran dans EcransAccueil.js. Couche heure/saison (aube, jour, crépuscule, nuit, printemps, été, automne, Halloween, Noël) pilotée en CSS par data-theme / data-saison.
2026-10-24 — animations — Retirés à la demande : chauves-souris volantes, grains de lumière (ambiance « lumiere » = halo seul), lune, effet sur le panneau en bois, gouttes de la fontaine du musée, reflet « vent » sur l'auvent du restaurant ; lucioles retirées aussi (grains lumineux). Papillons plus petits, sur les côtés en bas. Herbes animées rendues discrètes.
2026-10-24 — animations — Inscription « MUSÉE » déplacée entre les deux arbres, au-dessus de l'arcade centrale (fonds/musee.jpg recomposée).
2026-10-24 — animations — Indicateur de progression de l'accueil : icône de la saison à la place des points (fleur, soleil, feuille, flocon, citrouille, cadeau ; decorations/cadeau.svg ajouté), icônes déjà passées « remplies », épingle ORIVY qui glisse le long du sentier.
2026-10-24 — animations — Transitions de vue : changements de page en fondu rapide (Link viewTransition), onglet actif qui glisse ; le fondu lent de 1,2 s est réservé aux changements de thème (classe vt-theme posée par themes.js), et la vague circulaire (vt-vague) quand on choisit le thème dans le profil.
2026-10-24 — animations — Retirés : chauve-souris de la décoration d'Halloween (halloween-coin.svg) et fichier chauve-souris.svg, ruissellement du jet de la fontaine (musée) et de la cascade (parc), feuilles qui roulent en bas de l'écran restaurant, effets liés au curseur (halo qui suit la souris, profondeur à la souris).
2026-10-24 — accueil — Idées 5 et 7 (ordinateur) : cartes de texte en verre dépoli (voile rgb(22 17 13 / 0.55) + flou 16px, contraste du blanc ≥ 4,5:1 vérifié au calcul), titres blancs en taille 4xl avec ombre douce, « vis l'instant » en pêche claire #FFC9A8, bouton secondaire en contour blanc.
2026-10-24 — accueil — Idée 10 : en-tête fixe et transparent au-dessus de la photo d'accueil (texte blanc sur léger dégradé sombre, body.entete-transparente tant que scrollY < 40), son fond opaque revient en fondu dès qu'on descend ; la photo du premier écran remonte sous l'en-tête.
2026-10-24 — animations — Retirés : volée d'oiseaux de l'écran Monuments et aigle de l'écran Randonnée ; gardées : les hirondelles qui tournent au loin autour des tours du château.
2026-10-24 — accueil — 6 nouvelles photos (parc à la française, village provençal, Étretat, guinguette, cinéma, fête de village) : les 10 écrans ont maintenant une photo. Nouveaux effets : soleil (halo + rayons), guirlande, chenillard, confettis, notes de musique.
2026-10-24 — animations — Retirés : effets d'eau (reflets, ondes) sur Parc, Point de vue, Bar et Village ; herbes du Point de vue ; feuilles qui tombent sur Parc et Village.
2026-10-24 — animations — Remis : les ronds dans l'eau sous la fontaine du Village.
2026-10-24 — animations — Point de vue : voilier qui passe sur l'horizon, halo du soleil qui descend et ciel qui rougit, phare au bout de la falaise (crépuscule et nuit), fleurs sauvages qui se balancent, deuxième ronde de mouettes autour de l'Aiguille.
