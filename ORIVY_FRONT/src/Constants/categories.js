/*
 * Source unique des catégories : noms affichés, icône, image par défaut.
 * Les clés (« parc », « monument »…) sont celles de la base de données ET
 * celles des variables CSS --cat-parc, --cat-monument… (design-system.css).
 * La couleur n'est donc PAS ici : elle vient du CSS, et suit le thème de nuit.
 */
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

export const CATEGORIES = {
    monument:     { nom: 'Monument',     pluriel: 'Monuments',     image: image('photo-1524492412937-b28074a5d7da') },
    culture:      { nom: 'Musée',        pluriel: 'Musées',        image: image('photo-1564399579883-451a5d44ec08') },
    parc:         { nom: 'Parc',         pluriel: 'Parcs',         image: image('photo-1441974231531-c6227db76b6e') },
    promenade:    { nom: 'Randonnée',    pluriel: 'Randonnées',    image: image('photo-1551632811-561732d1e306') },
    village:      { nom: 'Village',      pluriel: 'Villages',      image: image('photo-1470770841072-f978cf4d019e') },
    observatoire: { nom: 'Point de vue', pluriel: 'Points de vue', image: image('photo-1534447677768-be436bb09401') },
    sport:        { nom: 'Sport',        pluriel: 'Sports',        image: image('photo-1500534623283-312aade485b7') },
    restaurant:   { nom: 'Restaurant',   pluriel: 'Restaurants',   image: image('photo-1515003197210-e0cd71810b5f') },
    bar:          { nom: 'Bar',          pluriel: 'Bars',          image: image('photo-1515003197210-e0cd71810b5f') },
    cinema:       { nom: 'Cinéma',       pluriel: 'Cinémas',       image: image('photo-1500534623283-312aade485b7') },
    evenement:    { nom: 'Événement',    pluriel: 'Événements',    image: image('photo-1500534623283-312aade485b7') },
    autre:        { nom: 'Autre',        pluriel: 'Autres',        image: image('photo-1500534623283-312aade485b7') },
};

/* Renvoie toujours une catégorie valide (« autre » si la clé est inconnue) */
export const categorie = (cle) => (CATEGORIES[cle] ? { cle, ...CATEGORIES[cle] } : { cle: 'autre', ...CATEGORIES.autre });

/* Liste dans l'ordre d'affichage des filtres */
export const LISTE_CATEGORIES = Object.keys(CATEGORIES).map(categorie);
