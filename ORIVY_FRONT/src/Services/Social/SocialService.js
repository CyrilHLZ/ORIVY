import { apiRequest } from '../api.js';

// Abonnements (modèle Instagram) : l'utilisateur connecté est identifié par le back (token),
// on ne passe donc que l'id de la personne concernée.

export const followUser = (targetUserId) => apiRequest(`/utilisateurs/${targetUserId}/abonnement`, { method: 'POST' });
export const unfollowUser = (targetUserId) => apiRequest(`/utilisateurs/${targetUserId}/abonnement`, { method: 'DELETE' });

// Ceux qui suivent cet utilisateur
export const getFollowers = (userId) => apiRequest(`/utilisateurs/${userId}/abonnes`);
// Ceux que cet utilisateur suit
export const getFollowing = (userId) => apiRequest(`/utilisateurs/${userId}/abonnements`);

// Blocage : plus de messages ni d'abonnement entre les deux membres
export const bloquer = (userId) => apiRequest(`/utilisateurs/${userId}/blocage`, { method: 'POST' });
export const debloquer = (userId) => apiRequest(`/utilisateurs/${userId}/blocage`, { method: 'DELETE' });
export const getMesBlocages = () => apiRequest('/utilisateurs/moi/blocages');
