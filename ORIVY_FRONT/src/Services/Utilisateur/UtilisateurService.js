import { apiRequest } from '../api.js';

// Authentification
export const register = (user) => apiRequest('/utilisateurs/inscription', { method: 'POST', body: user });
export const login = (credentials) => apiRequest('/utilisateurs/connexion', { method: 'POST', body: credentials });

// Liste des membres (page Communauté).
// ⚠ Le back renvoie aussi e-mail, téléphone et adresse : n'afficher QUE prénom, nom, ville.
export const getUtilisateurs = () => apiRequest('/utilisateurs');

// Profil d'un membre (le mien ou celui d'un autre)
export const getUserProfile = (userId) => apiRequest(`/utilisateurs/${userId}`);

// Modifier un profil. Le back ne change JAMAIS l'e-mail, le mot de passe ni le rôle
// par cette route ; il remplace en revanche tous les autres champs : on envoie donc
// le profil complet (valeurs actuelles + modifications).
export const updateUserProfile = (userId, profil) => apiRequest(`/utilisateurs/${userId}`, { method: 'PUT', body: profil });

// À venir côté back (routes pas encore créées) :
//   GET/PUT/DELETE /utilisateurs/mon-profil (identifier l'utilisateur par son token)

