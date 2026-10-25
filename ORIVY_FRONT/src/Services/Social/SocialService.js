import { apiRequest } from '../api.js';

// Abonnements (modèle Instagram) : l'utilisateur connecté est identifié par le back (token),
// on ne passe donc que l'id de la personne concernée.

export const followUser = (targetUserId) => apiRequest(`/utilisateurs/${targetUserId}/abonnement`, { method: 'POST' });
export const unfollowUser = (targetUserId) => apiRequest(`/utilisateurs/${targetUserId}/abonnement`, { method: 'DELETE' });

// Ceux qui suivent cet utilisateur
export const getFollowers = (userId) => apiRequest(`/utilisateurs/${userId}/abonnes`);
// Ceux que cet utilisateur suit
export const getFollowing = (userId) => apiRequest(`/utilisateurs/${userId}/abonnements`);
