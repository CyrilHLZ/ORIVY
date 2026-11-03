/*
 * Les catégories viennent maintenant de la BASE (API /api/categories), modifiables par l'admin.
 * Ce module en garde une copie en mémoire, remplie au démarrage par CategoriesContext, pour que
 * categorie(cle) et LISTE_CATEGORIES restent utilisables partout de façon synchrone.
 * Chaque catégorie : { id, cle, nom, pluriel, emoji, couleur, image }.
 * La COULEUR est injectée en CSS (--cat) par CategoriesContext : les classes cat-<cle> marchent pour toutes,
 * y compris celles créées par l'admin. L'ICÔNE est l'emoji (voir EmojiCategorie).
 */

// Photos de repli des 12 catégories d'origine (fond d'une carte de lieu sans image) ; défaut pour les autres
const PHOTOS = {
    monument: 'photo-1524492412937-b28074a5d7da', culture: 'photo-1564399579883-451a5d44ec08',
    parc: 'photo-1441974231531-c6227db76b6e', promenade: 'photo-1551632811-561732d1e306',
    village: 'photo-1470770841072-f978cf4d019e', observatoire: 'photo-1534447677768-be436bb09401',
    sport: 'photo-1500534623283-312aade485b7', restaurant: 'photo-1515003197210-e0cd71810b5f',
    bar: 'photo-1515003197210-e0cd71810b5f', cinema: 'photo-1500534623283-312aade485b7',
    evenement: 'photo-1500534623283-312aade485b7', autre: 'photo-1500534623283-312aade485b7',
};
const imageDe = (cle) => `https://images.unsplash.com/${PHOTOS[cle] || PHOTOS.autre}?auto=format&fit=crop&w=900&q=75`;

// Repli minimal tant que l'API n'a pas répondu (et si une clé est inconnue)
const AUTRE = { cle: 'autre', nom: 'Autre', pluriel: 'Autres', emoji: '📍', couleur: '#6b7280', image: imageDe('autre') };

// « export let » : ces liaisons sont vivantes. definirCategories() les met à jour et les importateurs
// voient la nouvelle valeur (l'app est affichée seulement une fois les catégories chargées).
export let LISTE_CATEGORIES = [AUTRE];
let _parCle = { autre: AUTRE };

/* Remplit le cache à partir de ce que renvoie l'API */
export const definirCategories = (brut) => {
    LISTE_CATEGORIES = brut.map((c) => ({ ...c, image: imageDe(c.cle) }));
    _parCle = Object.fromEntries(LISTE_CATEGORIES.map((c) => [c.cle, c]));
    if (!_parCle.autre) { LISTE_CATEGORIES = [...LISTE_CATEGORIES, AUTRE]; _parCle.autre = AUTRE; }
};

/* Renvoie toujours une catégorie valide (« autre » si la clé est inconnue) */
export const categorie = (cle) => _parCle[cle] || _parCle.autre || AUTRE;
