// Météo prévue à l'heure d'une sortie, avec Open-Meteo (gratuit, sans clé, prévisions jusqu'à 16 jours)
const TEMPS = {
    0: ['☀️', 'Grand soleil'], 1: ['🌤️', 'Plutôt ensoleillé'], 2: ['⛅', 'Nuageux'], 3: ['☁️', 'Couvert'],
    45: ['🌫️', 'Brouillard'], 48: ['🌫️', 'Brouillard givrant'],
    51: ['🌦️', 'Bruine'], 53: ['🌦️', 'Bruine'], 55: ['🌦️', 'Bruine forte'],
    61: ['🌧️', 'Pluie faible'], 63: ['🌧️', 'Pluie'], 65: ['🌧️', 'Forte pluie'],
    71: ['🌨️', 'Neige faible'], 73: ['🌨️', 'Neige'], 75: ['❄️', 'Forte neige'],
    80: ['🌦️', 'Averses'], 81: ['🌧️', 'Averses'], 82: ['⛈️', 'Fortes averses'],
    95: ['⛈️', 'Orage'], 96: ['⛈️', 'Orage et grêle'], 99: ['⛈️', 'Orage et grêle'],
};

export const meteoDeLaSortie = async (sortie) => {
    if (sortie.latitude == null || sortie.longitude == null || !sortie.dateDebut) return null;
    const date = sortie.dateDebut.slice(0, 10);                 // « 2030-06-01 »
    const jours = (new Date(date) - new Date()) / 86400000;
    if (jours < -1 || jours > 15) return null;                  // trop loin pour une prévision

    // fetch et pas apiRequest : c'est un AUTRE site (pas de /api devant, et surtout pas notre jeton)
    const url = 'https://api.open-meteo.com/v1/forecast'
        + `?latitude=${sortie.latitude}&longitude=${sortie.longitude}`
        + '&hourly=temperature_2m,weather_code,precipitation_probability'
        + `&timezone=Europe%2FParis&start_date=${date}&end_date=${date}`;
    const reponse = await fetch(url);
    if (!reponse.ok) return null;
    const { hourly } = await reponse.json();

    // 24 valeurs, une par heure : on prend celle de l'heure de la sortie
    const heure = Number(sortie.dateDebut.slice(11, 13)) || 12;
    const [emoji, texte] = TEMPS[hourly.weather_code[heure]] ?? ['🌡️', ''];
    return {
        emoji,
        texte,
        temperature: Math.round(hourly.temperature_2m[heure]),
        pluie: hourly.precipitation_probability[heure],
    };
};
