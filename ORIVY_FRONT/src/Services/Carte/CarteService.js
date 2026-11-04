import { apiRequest } from '../api.js';

// Toutes les données de la carte : { pointsInteret, promenades, activites }
export const getMapData = () => apiRequest('/carte');

// Points d'intérêt (les repères de la carte)
export const getPoints = () => apiRequest('/points-interet');

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
