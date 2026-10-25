import { apiRequest } from '../api.js';

// Lire
export const getActivities = () => apiRequest('/activites');
export const getActivity = (id) => apiRequest(`/activites/${id}`);

// Créer / modifier / supprimer
export const createActivity = (activity) => apiRequest('/activites', { method: 'POST', body: activity });
export const updateActivity = (id, activity) => apiRequest(`/activites/${id}`, { method: 'PUT', body: activity });
export const deleteActivity = (id) => apiRequest(`/activites/${id}`, { method: 'DELETE' });

// Rechercher / filtrer (endpoints déjà présents dans le back)
// encodeURIComponent protège les caractères spéciaux (espaces, accents, &...) dans l'URL.
export const searchActivities = (motCle) => apiRequest(`/activites/recherche?motCle=${encodeURIComponent(motCle)}`);
export const getActivitiesByCategory = (categorie) => apiRequest(`/activites/filtre/categorie?categorie=${encodeURIComponent(categorie)}`);
export const getActivitiesByPlace = (lieu) => apiRequest(`/activites/filtre/lieu?lieu=${encodeURIComponent(lieu)}`);
export const getActivitiesByDate = (debut, fin) => apiRequest(`/activites/filtre/date?debut=${encodeURIComponent(debut)}&fin=${encodeURIComponent(fin)}`);
