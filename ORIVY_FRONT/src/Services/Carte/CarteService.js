import { apiRequest } from '../api.js';

// Toutes les données de la carte : { pointsInteret, promenades, activites }
export const getMapData = () => apiRequest('/carte');

// Points d'intérêt (les repères de la carte)
export const getPoints = () => apiRequest('/points-interet');
export const createPoint = (point) => apiRequest('/points-interet', { method: 'POST', body: point });
export const updatePoint = (id, point) => apiRequest(`/points-interet/${id}`, { method: 'PUT', body: point });
export const deletePoint = (id) => apiRequest(`/points-interet/${id}`, { method: 'DELETE' });
