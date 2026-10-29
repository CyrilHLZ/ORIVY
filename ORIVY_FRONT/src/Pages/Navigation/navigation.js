/*
 * Liste des onglets principaux, partagée par l'en-tête (ordinateur)
 * et la barre d'onglets (mobile). Une seule source : si on ajoute un onglet,
 * il apparaît aux deux endroits.
 *
 * chemins : adresses pour lesquelles l'onglet est « actif ».
 * mobile  : false = absent de la barre du bas. Sur mobile, l'accueil passe par
 *           le logo et les messages par l'icône de l'en-tête (à côté de la cloche) :
 *           la barre garde ainsi 5 cases au maximum, confortables pour le pouce.
 */
export const ONGLETS = [
    { nom: 'Accueil', icone: 'accueil', lien: '/', chemins: ['/'], exact: true, mobile: false },
    { nom: 'Carte', icone: 'carte', lien: '/carte', chemins: ['/carte'] },
    { nom: 'Lieux', icone: 'epingle', lien: '/activites', chemins: ['/activites'] },
    { nom: 'Sorties', icone: 'calendrier', lien: '/sorties', chemins: ['/sorties'] },
    { nom: 'Fil', icone: 'image', lien: '/fil', chemins: ['/fil'] },
    { nom: 'Messages', icone: 'messages', lien: '/messages', chemins: ['/messages'], mobile: false },
];

/* Les onglets de la barre du bas (mobile) */
export const ONGLETS_MOBILE = ONGLETS.filter((onglet) => onglet.mobile !== false);

/* Vrai si l'adresse actuelle correspond à l'onglet */
export const estActif = (onglet, pathname) =>
    onglet.exact
        ? pathname === onglet.lien
        : onglet.chemins.some((chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`));
