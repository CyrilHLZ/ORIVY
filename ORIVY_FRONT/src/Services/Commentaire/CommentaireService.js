import { apiRequest } from '../api.js';

/*
 * Commentaires (dans le back : CarteController).
 * Un commentaire vise une « cible » : cibleType ("sortie", "point"…) + cibleId.
 */
export const getCommentaires = (cibleType, cibleId) => apiRequest(`/${cibleType}/${cibleId}/commentaires`);

// auteur, contenu et cibleType sont obligatoires (@NotBlank dans le back)
export const createCommentaire = (commentaire) => apiRequest('/commentaires', { method: 'POST', body: commentaire });
