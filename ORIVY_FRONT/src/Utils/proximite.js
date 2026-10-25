/*
 * Proximité : distances et position de l'utilisateur.
 * Repris de design/maquettes/proximite.js.
 */

const RAYON_TERRE_KM = 6371;

/* Distance « à vol d'oiseau » entre deux points GPS (formule de Haversine), en km */
export const distanceKm = (lat1, lng1, lat2, lng2) => {
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLng = (lng2 - lng1) * rad;
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
    return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(a));
};

/* 0,8 → « à 800 m » · 2,345 → « à 2,3 km » · 47,6 → « à 48 km » */
export const formaterDistance = (km) => {
    if (km < 1) return `à ${Math.max(50, Math.round((km * 1000) / 50) * 50)} m`;
    if (km < 10) return `à ${km.toFixed(1).replace('.', ',')} km`;
    return `à ${Math.round(km)} km`;
};

/*
 * Demande la position au navigateur. À n'appeler QUE sur un clic de
 * l'utilisateur (« Autour de moi »), jamais au chargement de la page.
 * Renvoie une promesse : { lat, lng }, ou une erreur avec un message lisible.
 */
export const demanderPosition = () => new Promise((resoudre, rejeter) => {
    if (!('geolocation' in navigator)) {
        rejeter(new Error('Ton navigateur ne sait pas te localiser.'));
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (p) => resoudre({ lat: p.coords.latitude, lng: p.coords.longitude }),
        (e) => rejeter(new Error(e.code === 1
            ? 'Tu as refusé la localisation. Tape plutôt le nom de ta ville.'
            : "On n'arrive pas à te localiser. Tape plutôt le nom de ta ville.")),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
});

/* Grandes villes, pour le champ « Tape ta ville » quand la position est refusée */
const VILLES = {
    paris: [48.8566, 2.3522], lyon: [45.7640, 4.8357], marseille: [43.2965, 5.3698],
    bordeaux: [44.8378, -0.5792], lille: [50.6292, 3.0573], nantes: [47.2184, -1.5536],
    toulouse: [43.6047, 1.4442], strasbourg: [48.5734, 7.7521], nice: [43.7102, 7.2620],
    rennes: [48.1173, -1.6778], montpellier: [43.6108, 3.8767], 'clermont-ferrand': [45.7772, 3.0870],
    annecy: [45.8992, 6.1294], grenoble: [45.1885, 5.7245], 'saint-malo': [48.6493, -2.0257],
};

/* « Clermont Ferrand », « clermont-ferrand », « CLERMONT-FERRAND » → la même ville */
export const trouverVille = (texte) => {
    const cle = (texte || '').trim().toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')   // retire les accents
        .replace(/\s+/g, '-');
    const coord = VILLES[cle];
    return coord ? { lat: coord[0], lng: coord[1], nom: texte.trim() } : null;
};
