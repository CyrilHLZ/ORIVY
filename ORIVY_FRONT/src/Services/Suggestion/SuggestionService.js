import { apiRequest } from '../api.js';

/*
 * Suggestions des membres (dans le back : SuggestionController).
 *   { type: 'lieu', nomLieu, categorie, adresse, latitude?, longitude?, message? }  → lieu à ajouter
 *   { type: 'idee', message }                                                     → idée pour ORIVY
 */
export const suggerer = (suggestion) => apiRequest('/suggestions', { method: 'POST', body: suggestion });

// Admin seulement
export const getSuggestions = () => apiRequest('/suggestions');
export const traiterSuggestion = (id) => apiRequest(`/suggestions/${id}/traitee`, { method: 'PUT' });
