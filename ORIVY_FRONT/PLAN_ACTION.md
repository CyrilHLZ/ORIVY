# Plan d'action ORIVY — de ton code actuel à la version complète

Objectif : arriver, en codant toi-même, à une application où l'on peut explorer une carte de lieux,
prévoir des sorties, s'y inscrire, suivre des profils, partager des photos et discuter.

## Comment utiliser ce plan

- **Tu écris le code.** Pour chaque étape, lis l'objectif et les notions, essaie, puis demande-moi
  un indice si tu bloques (« indice étape 7 »). Je t'explique, mais je ne code pas à ta place.
- **`_correction/`** contient une version terminée. Ne l'ouvre qu'**après** avoir fini une étape,
  pour comparer. Il y a souvent plusieurs bonnes solutions : la tienne peut être différente et juste.
- **Une étape = un commit.** Tu peux ainsi revenir en arrière et voir tes progrès.
- Coche les cases au fur et à mesure.
- **Le back n'a pas encore les endpoints à partir de la phase 5.** Astuce : fais d'abord
  renvoyer des **fausses données** par ta fonction de service, par exemple
  `export const getSorties = async () => [{ id: 1, titre: 'Test', ... }]`. Tu construis ainsi
  l'écran, puis tu branches le vrai appel quand le back est prêt.

---

## Phase 0 — Préparer le terrain

- [ ] **Étape 0 · Un vrai dépôt git pour ORIVY**
  - Problème : ton dépôt git actuel est à la racine de `C:\Users\houil` (tout ton dossier perso !).
  - Notions : `git init`, `.gitignore`, `git remote`.
  - À faire : créer un dépôt dans `IdeaProjects/ORIVY`, ignorer `node_modules/`, `dist/`, `target/`
    et `_correction/`, faire un premier commit.
  - C'est fini quand : `git status` dans `ORIVY` ne montre que les fichiers du projet.

## Phase 1 — Réparer et assainir

- [ ] **Étape 1 · Réparer le build**
  - Notions : lire une erreur Vite, chemins relatifs (`./`, `../`), imports par défaut / nommés.
  - À faire : `npm run build`, corriger les imports de `Routes/Route.jsx` et les imports CSS
    des pages dans `Pages/Main/Activite/`.
  - C'est fini quand : `npm run build` affiche `✓ built`.

- [ ] **Étape 2 · Les fichiers sans imports**
  - Notions : chaque fichier est un module isolé ; un hook (`useState`, `useParams`...) doit être importé.
  - À faire : compléter `ModifierActivitePage`, `CreationSortiePage`, `SocialPage`, `MonProfilService`
    (qui appelle une fonction qui n'existe pas), et ajouter les `export default` manquants.
  - C'est fini quand : aucun de ces fichiers n'utilise un nom qu'il n'a pas importé ou défini.

- [ ] **Étape 3 · Conventions de nommage**
  - Notions : un composant React **doit** commencer par une majuscule (`activitePage` → `ActivitePage`).
    Un fichier sans JSX prend l'extension `.js`, pas `.jsx`.
  - À faire : renommer les composants et les fichiers de services.

- [ ] **Étape 4 · Ranger les pages par domaine**
  - Notions : organisation « par fonctionnalité » plutôt que par type technique.
  - À faire : viser `Pages/{Accueil, Carte, Lieux, Sorties, Profil, Communaute, Messages, Notifications, Auth, Admin}`
    et `Components/` pour les éléments réutilisés (ex. `Navbar`). Mettre à jour tous les imports.
  - Correction : `_correction/src/Pages/`, `_correction/src/Components/`.

## Phase 2 — Les fondations

- [ ] **Étape 5 · Un seul client HTTP**
  - Notions : DRY (ne pas se répéter). Aujourd'hui la même fonction `fetch` est copiée dans 3 fichiers.
  - À faire : un `Services/api.js` qui exporte `apiRequest`, qui :
    1. ajoute `/api` devant le chemin ;
    2. transforme automatiquement `body` en JSON ;
    3. ajoute l'en-tête `Authorization: Bearer <token>` si on est connecté (prépare l'étape 14) ;
    4. lance une erreur qui contient le code HTTP (`error.status`).
  - Bonus : gérer `FormData` (pour les photos : pas de `Content-Type` JSON dans ce cas).
  - Correction : `_correction/src/Services/api.js`.

- [ ] **Étape 6 · Un service par domaine**
  - À faire : `LieuService`, `ActiviteService`, `SortieService`, `UtilisateurService`, `PhotoService`,
    `CommentaireService`, `MessageService`, `NotificationService`. Chacun importe `apiRequest`.
  - Règle : **aucune page n'appelle `fetch` directement.**
  - Référence des URLs : le tableau « Contrat d'API » dans `_correction/README.md`.

- [ ] **Étape 7 · Les catégories en un seul endroit**
  - Notions : « source unique de vérité ». Aujourd'hui les catégories, couleurs et images sont recopiées
    dans 3 fichiers, avec des différences.
  - À faire : `Constants/categories.js` avec un tableau `{ id, label, couleur, image }` et une fonction
    `getCategorie(id)` qui renvoie « autre » par défaut.

- [ ] **Étape 8 · Un seul format « lieu »**
  - Notions : normaliser des données. Le back envoie des `pointsInteret` (champ `type`) et des `activites`
    (champ `categorie`, `lieu`). L'écran ne devrait connaître qu'un seul format.
  - À faire : `Utils/lieux.js` avec `normaliserPoint`, `normaliserActivite` et des fonctions de liens
    (`lienLieu`, `lienNouvelleSortie`, `lienGoogleMaps`...).
  - Question à te poser : comment distinguer le point n°3 de l'activité n°3 ? (indice : le `type`).

- [ ] **Étape 9 · Ton premier hook personnalisé : `useAsync`**
  - Notions : hooks personnalisés, `useEffect`, `useCallback`, éviter de mettre à jour un composant démonté.
  - À faire : `useAsync(charger, deps)` qui renvoie `{ data, loading, error, reload }`. Puis un composant
    `Etat.jsx` (Chargement / Erreur / Vide) pour arrêter de réécrire les trois mêmes cas dans chaque page.
  - C'est fini quand : `ActivitePage` n'a plus ses trois `useState` de chargement.

## Phase 3 — Découvrir les lieux

- [ ] **Étape 10 · Navbar et routes**
  - Notions : `NavLink`, routes dynamiques (`/lieux/:type/:id`), page 404.
  - À faire : liens Carte, Lieux, Sorties, Communauté, puis Messages / Notifications / Mon profil si connecté.

- [ ] **Étape 11 · Le catalogue des lieux**
  - Notions : découper l'interface en composants (`LieuCard`), les props, `key`.
  - À faire : renommer `ActivitePage` en `LieuxPage`, utiliser `getLieux()`, `CATEGORIES` et `LieuCard`.
    Chaque carte a deux liens : « Voir le lieu » et « Prévoir une sortie ».

- [ ] **Étape 12 · La carte cliquable**
  - Notions : react-leaflet (`MapContainer`, `CircleMarker`, `Popup`, `useMap`), `useMemo`,
    l'API de géolocalisation du navigateur.
  - À faire : un popup avec image, nom, et les boutons « Voir le lieu » et « Prévoir une sortie ».
    Ajouter un filtre par catégorie, une recherche texte et un bouton « Autour de moi ».
  - Piège : ne jamais appeler `map.flyTo` directement pendant le rendu → utiliser un `useEffect`.

- [ ] **Étape 13 · La fiche d'un lieu**
  - Notions : `useParams`, composition de sections.
  - À faire : `LieuDetailPage` avec description, mini-carte, liens d'itinéraire, et les avis
    (`Commentaires.jsx` : **le back les gère déjà**, tu peux tester pour de vrai).

## Phase 4 — Les comptes

- [ ] **Étape 14 · Une vraie session**
  - Notions : Context React, `localStorage`, token d'authentification.
  - À faire : stocker `{ token, utilisateur }` ; exposer `user`, `isAuthenticated`, `isAdmin`,
    `login`, `logout`, `updateUser`. Une fonction `estMoi(auth, id)`.
  - À savoir : le back renvoie aujourd'hui une simple chaîne à la connexion → c'est pour ça que
    tu n'es jamais admin. Ce sera une tâche côté back.

- [ ] **Étape 15 · Routes protégées et formulaires propres**
  - Notions : `<Navigate>`, `useLocation`, `state` de navigation.
  - À faire : `RequireAuth` / `RequireAdmin` ; après la connexion, revenir à la page demandée.
    Remplacer les `window.alert` par des messages dans la page. Après l'inscription : connexion automatique.

## Phase 5 — Les sorties (cœur du projet)

- [ ] **Étape 16 · Lister les sorties**
  - Notions : paramètres de requête (`?aVenir=true`), onglets.
  - À faire : `SortieCard` et `SortiesPage` avec trois onglets : « Toutes », « J'y participe », « J'organise ».

- [ ] **Étape 17 · Créer une sortie depuis un lieu**
  - Notions : `useSearchParams`, formulaire contrôlé, un seul formulaire pour créer et modifier.
  - À faire : `/sorties/nouvelle?lieuType=...&lieuId=...` arrive avec le lieu déjà sélectionné ;
    `/sorties/:id/modifier` réutilise le même composant.

- [ ] **Étape 18 · Détail et participation**
  - Notions : affichage conditionnel selon l'utilisateur (organisateur / participant / visiteur).
  - À faire : boutons « Je participe », « Me désinscrire », « Modifier », « Annuler » ; liste des
    participants ; « Complet » si le nombre maximum est atteint.

## Phase 6 — Le réseau social

- [ ] **Étape 19 · Avatar, carte membre, bouton s'abonner**
  - Notions : composants réutilisables, mise à jour optimiste (changer l'affichage tout de suite).
  - À faire : `Avatar` (initiales si pas de photo), `UtilisateurCard`, `BoutonAbonnement`
    (redirige vers la connexion si on n'est pas connecté).

- [ ] **Étape 20 · La page profil**
  - À faire : `/profil/:id` avec bio, ville, centres d'intérêt, statistiques, et quatre onglets :
    Photos, Sorties, Abonnés, Abonnements. Si c'est mon profil : bouton « Modifier », sinon « S'abonner »
    et « Envoyer un message ».

- [ ] **Étape 21 · Modifier mon profil**
  - Notions : cases à cocher multiples (tableau dans le state).
  - À faire : `EditionProfilPage` (prénom, nom, ville, bio, photo, centres d'intérêt).

- [ ] **Étape 22 · Communauté**
  - Notions : *debounce* (attendre que l'utilisateur arrête de taper avant d'appeler l'API).
  - À faire : recherche de membres, et un fil d'actualité des personnes suivies.

## Phase 7 — Les photos

- [ ] **Étape 23 · Galerie et envoi**
  - Notions : `<input type="file">`, `FormData`, une fenêtre d'agrandissement (modale) accessible.
  - À faire : un composant `GaleriePhotos` réutilisé sur la fiche lieu, la sortie et le profil.

## Phase 8 — Échanger

- [ ] **Étape 24 · Messagerie** : liste des conversations + fil de messages, défilement automatique
  vers le dernier message (`useRef` + `scrollIntoView`).
- [ ] **Étape 25 · Notifications** : liste, « marquer comme lu », « tout marquer comme lu ».

## Phase 9 — Administration

- [ ] **Étape 26 · Admin complet**
  - À faire : onglets Repères / Activités, et un formulaire activité unique pour créer et modifier
    (`/admin/activites/nouvelle` et `/admin/activites/:id`). Remplace `ModifierActivitePage` et
    `CreationActivitePage`.

## Phase 10 — Finitions

- [ ] **Étape 27 · Style** des nouveaux écrans, en réutilisant les variables CSS du thème
  (`--deep`, `--lime`, `--line`...). Vérifier l'affichage sur mobile.
- [ ] **Étape 28 · Documentation** : un README avec l'architecture, la liste des fonctionnalités et
  le contrat d'API à donner au back.
- [ ] **Étape 29 · Qualité** : installer ESLint avec `eslint-plugin-react-hooks`, puis écrire quelques
  tests avec Vitest.

---

## Suivi

| Phase | Étapes | Statut |
|---|---|---|
| 0 — Terrain | 0 | ⬜ |
| 1 — Réparer | 1 → 4 | ⬜ |
| 2 — Fondations | 5 → 9 | ⬜ |
| 3 — Lieux | 10 → 13 | ⬜ |
| 4 — Comptes | 14 → 15 | ⬜ |
| 5 — Sorties | 16 → 18 | ⬜ |
| 6 — Social | 19 → 22 | ⬜ |
| 7 — Photos | 23 | ⬜ |
| 8 — Échanger | 24 → 25 | ⬜ |
| 9 — Admin | 26 | ⬜ |
| 10 — Finitions | 27 → 29 | ⬜ |
