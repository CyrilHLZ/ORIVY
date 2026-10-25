/*
 * Dates en français, comme dans les maquettes.
 * Le back envoie « 2026-10-25 » (LocalDate) ou « 2026-10-25T07:00:00 » (LocalDateTime).
 */
const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/* « 2026-10-25 » seul serait lu en UTC (décalage possible d'un jour) : on force l'heure locale */
export const lireDate = (valeur) => new Date(valeur.length === 10 ? `${valeur}T00:00` : valeur);

/* 1 → « 1er » */
export const jourDuMois = (d) => (d.getDate() === 1 ? '1er' : String(d.getDate()));

export const moisCourt = (d) => MOIS[d.getMonth()];

/* « Dim. 25 oct. · 7h » (l'heure seulement si la date en contient une) */
export const dateLisible = (valeur) => {
    const d = lireDate(valeur);
    const jour = JOURS[d.getDay()];
    let texte = `${jour[0].toUpperCase()}${jour.slice(1)} ${jourDuMois(d)} ${moisCourt(d)}`;
    if (valeur.length > 10) {
        texte += ` · ${d.getHours()}h${d.getMinutes() ? String(d.getMinutes()).padStart(2, '0') : ''}`;
    }
    return texte;
};

const JOURS_LONGS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

/* « Dimanche 25 octobre » (et l'année seulement si ce n'est pas l'année en cours) */
export const dateLongue = (valeur) => {
    const d = lireDate(valeur);
    const jour = JOURS_LONGS[d.getDay()];
    const annee = d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '';
    return `${jour[0].toUpperCase()}${jour.slice(1)} ${jourDuMois(d)} ${MOIS_LONGS[d.getMonth()]}${annee}`;
};

/* « à l'instant », « il y a 5 min », « il y a 2 h », « hier », puis la date courte */
export const ilYa = (valeur) => {
    const secondes = (Date.now() - lireDate(valeur).getTime()) / 1000;
    if (secondes < 60) return "à l'instant";
    if (secondes < 3600) return `il y a ${Math.floor(secondes / 60)} min`;
    if (secondes < 86400) return `il y a ${Math.floor(secondes / 3600)} h`;
    if (secondes < 172800) return 'hier';
    const d = lireDate(valeur);
    return `le ${jourDuMois(d)} ${moisCourt(d)}`;
};
