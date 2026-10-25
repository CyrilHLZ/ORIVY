/*
 * Liste des onglets principaux, partagée par l'en-tête (ordinateur)
 * et la barre d'onglets (mobile). Une seule source : si on ajoute un onglet,
 * il apparaît aux deux endroits.
 *
 * chemins : adresses pour lesquelles l'onglet est « actif ».
 * Ex. : « Carte » reste allumé sur /activites, la liste des lieux étant la
 * bascule « liste » de la carte.
 */
export const ONGLETS = [
    { nom: 'Accueil', icone: 'accueil', lien: '/', chemins: ['/'], exact: true },
    { nom: 'Carte', icone: 'carte', lien: '/carte', chemins: ['/carte', '/activites'] },
    { nom: 'Sorties', icone: 'calendrier', lien: '/sorties', chemins: ['/sorties'] },
    { nom: 'Messages', icone: 'messages', lien: '/messages', chemins: ['/messages'] },
];

/* Vrai si l'adresse actuelle correspond à l'onglet */
export const estActif = (onglet, pathname) =>
    onglet.exact
        ? pathname === onglet.lien
        : onglet.chemins.some((chemin) => pathname === chemin || pathname.startsWith(`${chemin}/`));

