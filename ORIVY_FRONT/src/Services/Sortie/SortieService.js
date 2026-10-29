import { apiRequest } from '../api.js';

export const getSorties = () => apiRequest('/sorties');
export const createSortie = (sortie) => apiRequest('/sorties', { method: 'POST', body: sortie });
export const deleteSortie = (sortieId) => apiRequest(`/sorties/${sortieId}`, { method: 'DELETE' });
export const updateSortie = (sortieId, sortie) => apiRequest(`/sorties/${sortieId}`, { method: 'PUT', body: sortie });
export const getSortieById = (sortieId) => apiRequest(`/sorties/${sortieId}`);
export const inscriptionSortie = (sortieId) => apiRequest(`/sorties/${sortieId}/inscription`, { method: 'POST' });
export const desinscriptionSortie = (sortieId) => apiRequest(`/sorties/${sortieId}/inscription`, { method: 'DELETE' });
export const searchSorties = (query) => apiRequest(`/sorties/search?query=${encodeURIComponent(query)}`);
export const getSortiesMembre = (utilisateurId) => apiRequest(`/sorties/membre/${utilisateurId}`);
export const envoyerMediaSortie = (sortieId, fichier) => {
    const formulaire = new FormData();
    formulaire.append('photo', fichier);
    return apiRequest(`/sorties/${sortieId}/photo`, { method: 'POST', body: formulaire });
};
