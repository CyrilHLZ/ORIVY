import { apiRequest } from '../api.js';

// Favoris : cibleType = "point", "activite" ou "sortie"
export const getFavoris = () => apiRequest('/favoris');
export const ajouterFavori = (cibleType, cibleId) => apiRequest(`/favoris/${cibleType}/${cibleId}`, { method: 'POST' });
export const retirerFavori = (cibleType, cibleId) => apiRequest(`/favoris/${cibleType}/${cibleId}`, { method: 'DELETE' });
