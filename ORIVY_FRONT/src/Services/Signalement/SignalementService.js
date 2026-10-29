import { apiRequest } from '../api.js';

/*
 * Signalements (dans le back : SignalementController).
 * cibleType : "membre", "sortie", "commentaire" ou "photo".
 */
export const signaler = (cibleType, cibleId, motif) =>
    apiRequest('/signalements', { method: 'POST', body: { cibleType, cibleId, motif } });

// Admin seulement
export const getSignalements = () => apiRequest('/signalements');
export const traiterSignalement = (id) => apiRequest(`/signalements/${id}/traite`, { method: 'PUT' });
