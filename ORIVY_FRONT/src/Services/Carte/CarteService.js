import { apiRequest } from '../api.js';

// Toutes les données de la carte : { pointsInteret, promenades, activites }
export const getMapData = () => apiRequest('/carte');

// Points d'intérêt (les repères de la carte)
export const getPoints = () => apiRequest('/points-interet');
export const getPoint = (id) => apiRequest(`/points-interet/${id}`);

// Lieux importés (Monuments historiques…) dans la zone affichée ; types vide = toutes les catégories
export const getZone = ({ nord, sud, est, ouest }, types = []) => {
    const parametres = new URLSearchParams({ nord, sud, est, ouest });
    if (types.length > 0) parametres.set('types', types.join(','));
    return apiRequest(`/carte/zone?${parametres}`);
};
// Lieux importés à moins de km kilomètres, les plus proches d'abord ; type facultatif
export const getAutour = ({ lat, lng }, km, type) => {
    const parametres = new URLSearchParams({ lat, lng, km });
    if (type) parametres.set('type', type);
    return apiRequest(`/carte/autour?${parametres}`);
};
// Lieux importés dont le nom contient le texte (3 lettres au moins)
export const rechercherLieux = (texte) => apiRequest(`/carte/recherche?${new URLSearchParams({ q: texte })}`);
export const createPoint = (point) => apiRequest('/points-interet', { method: 'POST', body: point });
export const updatePoint = (id, point) => apiRequest(`/points-interet/${id}`, { method: 'PUT', body: point });
export const deletePoint = (id) => apiRequest(`/points-interet/${id}`, { method: 'DELETE' });
// Photo d'un lieu (admin) : envoyer un fichier, ou la retirer (→ « Photo en attente »)
export const envoyerPhotoPoint = (id, fichier) => {
    const formulaire = new FormData();
    formulaire.append('photo', fichier);
    return apiRequest(`/points-interet/${id}/photo`, { method: 'POST', body: formulaire });
};
export const retirerPhotoPoint = (id) => apiRequest(`/points-interet/${id}/photo`, { method: 'DELETE' });

// Promenades : { id, nom, description, distanceKm, dureeMinutes, difficulte, parcoursJson }
export const getPromenades = () => apiRequest('/promenades');
