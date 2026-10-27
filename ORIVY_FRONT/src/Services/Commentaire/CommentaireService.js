import { apiRequest } from '../api.js';

/*
 * Commentaires (dans le back : CommentaireController).
 * Un commentaire vise une « cible » : cibleType ("sortie", "point"…) + cibleId.
 */
export const getCommentaires = (cibleType, cibleId) => apiRequest(`/${cibleType}/${cibleId}/commentaires`);

// contenu et cibleType sont obligatoires (@NotBlank dans le back).
// L'auteur n'est jamais envoyé : le back le lit dans le jeton.
export const createCommentaire = (commentaire) => apiRequest('/commentaires', { method: 'POST', body: commentaire });
