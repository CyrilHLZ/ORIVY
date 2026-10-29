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

export const trouverVille = async (texte) => {
    const nom = (texte || '').trim();
    if (nom.length < 2) return null;
    const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(nom)}`
        + '&fields=nom,centre&boost=population&limit=1';
    const reponse = await fetch(url);
    if (!reponse.ok) throw new Error('La recherche de ville ne répond pas. Réessaie dans un instant.');
    const [commune] = await reponse.json();
    if (!commune) return null;
    const [lng, lat] = commune.centre.coordinates;   // GeoJSON : longitude D'ABORD
    return { lat, lng, nom: commune.nom };
};

/* { lat, lng } → « 15 Rue Bardin 03200 Vichy » (ou '' si rien trouvé : en mer, à l'étranger…) */
export const adresseDe = async (lat, lng) => {
    const reponse = await fetch(`https://api-adresse.data.gouv.fr/reverse/?lat=${lat}&lon=${lng}&limit=1`);
    if (!reponse.ok) return '';
    const { features } = await reponse.json();
    return features[0]?.properties.label ?? '';
};

