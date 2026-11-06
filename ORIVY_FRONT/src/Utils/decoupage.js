/*
 * Régions et départements de la carte.
 * Contours : IGN Admin Express (Licence Ouverte), via france-geojson, simplifiés (public/geo/*.geojson).
 * Chaque département porte : { code, nom, region } ; chaque région : { code, nom }.
 */

let promesse = null;

/* Charge les deux fichiers une seule fois (ils sont gardés en mémoire pour la suite de la visite) */
export const chargerDecoupage = () => {
    if (!promesse) {
        const lire = (fichier) => fetch(`/geo/${fichier}.geojson`).then((r) => {
            if (!r.ok) throw new Error('Contours introuvables');
            return r.json();
        });
        promesse = Promise.all([lire('regions'), lire('departements')])
            .then(([regions, departements]) => ({ regions, departements }))
            .catch((e) => { promesse = null; throw e; });
    }
    return promesse;
};

// Lancer de rayon : on compte les bords traversés par une demi-droite partant du point
const dansAnneau = (anneau, x, y) => {
    let dedans = false;
    for (let i = 0, j = anneau.length - 1; i < anneau.length; j = i++) {
        const [xi, yi] = anneau[i];
        const [xj, yj] = anneau[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans;
    }
    return dedans;
};

const contient = (feature, lat, lng) => {
    const { type, coordinates } = feature.geometry;
    const polygones = type === 'Polygon' ? [coordinates] : coordinates;
    return polygones.some(([exterieur, ...trous]) =>
        dansAnneau(exterieur, lng, lat) && !trous.some((t) => dansAnneau(t, lng, lat)));
};

/* Le département (feature) qui contient ce point, ou null (en mer, hors de France) */
export const departementDe = (departements, lat, lng) =>
    departements.features.find((f) => contient(f, lat, lng)) ?? null;
