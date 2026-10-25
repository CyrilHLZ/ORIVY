# 01 — Direction artistique ORIVY

Validée le 2026-10-22. Ce document fixe l'intention. Les valeurs exactes (variables CSS)
seront posées à l'étape 3 (`design-system.css`) et déclinées aux étapes 4 et 5
(thèmes horaires, saisons).

## 1. L'idée en une phrase

**Un carnet de voyage chaleureux posé sur une table en bois** : de la terre cuite, des
herbes sèches, du papier un peu grainé, des dessins à l'encre. ORIVY donne envie de sortir,
pas de remplir un tableau de bord.

- **Chaleureux** : terracotta, fonds crème et lin, ombres teintées (jamais grises).
- **Aventure** : illustrations à l'encre, grandes photos, titres en serif expressive.
- **Convivial** : formes arrondies, tutoiement, avatars et visages bien présents.

## 2. Palette « Terre & sauge »

Rôle de chaque couleur. Ce sont les valeurs de base, celles du thème « jour » hors saison.

| Rôle | Jour | Nuit | Usage |
|---|---|---|---|
| Principale (terracotta) | `#A34E2C` | `#E58E6A` | logo, bouton principal, liens, onglet actif |
| Accent (sauge) | `#6E8F5F` | `#A9C49A` | puces, interrupteurs, petites touches, décorations |
| Accent texte (sauge foncée) | `#4E6B42` | `#A9C49A` | texte ou icône en sauge sur fond clair |
| Fond | `#F6EFE6` argile clair | `#16211C` vert forêt | fond de page (+ grain) |
| Surface | `#FFFBF6` papier | `#21302A` mousse sombre | cartes, tiroirs, champs |
| Texte | `#2E2622` brun encre | `#EDE6DA` lin | texte courant, titres |
| Texte doux | `#6B5D52` | `#B4AA9C` | métadonnées, dates, distances |
| Bordure | `#E6D9CA` | (étape 4) | séparateurs décoratifs |
| Bordure forte | `#9C8B7C` | (étape 4) | contour des champs et boutons secondaires |
| Danger (rouge framboise) | `#A8173A` | `#FF8A80` | supprimer, quitter une sortie, erreurs |

### Contrastes vérifiés (script Node, seuils WCAG AA)

| Couple | Ratio | Seuil |
|---|---|---|
| Texte / fond (jour) | 13,00 | 4,5 ✔ |
| Texte doux / fond (jour) | 5,56 | 4,5 ✔ |
| Crème sur terracotta (bouton) | 5,53 | 4,5 ✔ |
| Terracotta en texte / fond | 5,00 | 4,5 ✔ |
| Sauge (élément d'interface) / fond | 3,20 | 3 ✔ |
| Sauge foncée en texte / fond | 5,25 | 4,5 ✔ |
| Bordure forte / surface (champs) | 3,19 | 3 ✔ |
| Blanc sur danger | 7,37 | 4,5 ✔ |
| Texte / fond (nuit) | 13,35 | 4,5 ✔ |
| Terracotta nuit / fond nuit | 6,63 | 4,5 ✔ |
| Sauge nuit / fond nuit | 8,71 | 4,5 ✔ |

**Ajustements faits pendant la vérification** :
- la sauge proposée au départ (`#7A9A6B`) n'atteignait que 2,76:1. Elle passe à `#6E8F5F` ;
- la sauge n'est **jamais** utilisée pour du texte sur fond clair : on prend alors la sauge foncée.

### Cohabitation avec les couleurs des catégories

La terracotta est voisine de trois couleurs de catégories. La plus proche est **bar**
(`#8d5b4c`, même luminosité), puis événement (`#e76f51`) et monument (`#ef6f61`).
Règles pour qu'on ne les confonde jamais :

1. La couleur principale **n'est jamais utilisée sur la carte** : ni épingle, ni cercle
   de rayon, ni groupe d'épingles. La carte appartient aux catégories.
2. Un badge de catégorie montre **toujours son icône et son nom**, pas seulement sa couleur
   (c'est aussi une règle d'accessibilité : l'information ne passe jamais par la couleur seule).
3. Les boutons principaux sont pleins et rectangulaires-arrondis, les badges de catégorie
   sont des pastilles (forme « pilule ») plus petites : la forme les distingue aussi.
4. Le danger est un rouge **froid** (framboise), éloigné de la terracotta (écart RGB 57),
   et s'accompagne toujours d'une icône et d'un verbe explicite (« Supprimer la sortie »).
   À l'étape 5, le rouge de Noël sera choisi chaud (écarlate) pour rester distinct du danger.

## 3. Typographie : Fraunces + DM Sans

| Rôle | Police | Graisses | Notes |
|---|---|---|---|
| Titres, accroches, noms de lieux | **Fraunces** | 600, 700 | serif douce, à « ventre » arrondi ; axe `SOFT` à 100 et `opsz` automatique |
| Texte, boutons, formulaires, chiffres | **DM Sans** | 400, 500, 700 | ronde et très lisible au petit corps, chiffres nets pour les distances |

- Fraunces ne descend jamais sous 20px : en dessous, on passe en DM Sans 700.
- Les boutons et les badges sont en DM Sans 500/700, jamais en Fraunces : l'interface reste simple.
- Chargement : une seule requête Google Fonts avec `display=swap`, limitée aux graisses
  ci-dessus pour garder la page légère.
- Échelle typographique (posée à l'étape 3) : rapport ~1,25, base 16px sur mobile.

## 4. Formes et matières : arrondi doux + grain papier

- **Rayons généreux** : 12px (champs, petits boutons), 20px (cartes), 28px (tiroirs,
  grandes images), pilule (badges, filtres, bouton « Autour de moi »).
- **Ombres douces et teintées** : brun chaud transparent le jour, quasi noir verdâtre la nuit.
  Deux ou trois niveaux maximum. Jamais d'ombre grise neutre.
- **Grain papier** : texture SVG très légère (≈3% d'opacité) sur le fond de page uniquement,
  jamais sur le texte ni sur les photos. Fichier minuscule, inline, coupé si l'utilisateur
  préfère le contraste élevé (`prefers-contrast: more`).
- **Pas de dégradés décoratifs** dans l'interface. Seule exception : un voile sombre
  en bas des photos pour rendre le texte lisible.
- Les traits (bordures, séparateurs) sont fins et chauds, comme un trait de crayon.

## 5. Images

- **Accueil** : illustrations SVG à l'encre noire, aplats de la couleur de catégorie,
  fonds aux tons naturels de la palette. Le néon est réservé aux enseignes (« Musée »,
  « Chez Orivy », « Cinéma »).
- **Toutes les autres pages** : photos (Unsplash), grandes, coins arrondis, cadrage
  qui montre le lieu plutôt que des gens posés.
- **Icônes** : style Lucide, trait 2px, coins arrondis, couleur du texte.
- **Avatars** : ronds, avec un liseré de la couleur de surface pour bien se détacher
  quand ils se chevauchent (« + 5 inscrits »).

## 6. Ton et textes

- Tutoiement, phrases courtes, verbes d'action en tête : « Explore la carte »,
  « Rejoins la sortie », « Retourne à la carte ».
- **Accroche principale (écran 1)** : « Découvre la France, vis l'instant, profite à plusieurs. »
- **Signature courte** (sous le logo, favicon, partages) : « Découvre. Vis. Profite. »
- États vides chaleureux et utiles : « Aucune sortie prévue par ici pour l'instant.
  Et si tu lançais la première ? » + un bouton.
- Erreurs sans jargon : « On n'arrive pas à te localiser. Tape plutôt le nom de ta ville. »

## 7. Mouvement

- Doux et organique : légères accélérations et décélérations (`ease-out`), durées courtes
  (150 à 300 ms) pour l'interface, plus longues pour l'accueil et les décorations.
- Uniquement `transform` et `opacity`.
- La seule animation spectaculaire est la tornade de l'accueil sur ordinateur.
- Tout est coupé ou remplacé par un fondu sous `prefers-reduced-motion`.

## 8. À éviter

- L'allure « tableau de bord » : grilles denses, gris neutres, beaucoup de petits chiffres.
- Le néon dans l'interface, les lueurs, les dégradés vifs.
- Utiliser la terracotta pour autre chose que l'action principale et l'identité.
- Plus de deux polices, plus de trois niveaux d'ombre.
- Le noir pur (`#000`) et le blanc pur en grand aplat : on reste sur l'encre et le papier.
