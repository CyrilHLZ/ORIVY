import { apiRequest } from '../api.js';

// Catégories (dans le back : CategorieController). Lecture publique, écriture réservée à l'admin.
export const getCategories = () => apiRequest('/categories');
export const creerCategorie = (categorie) => apiRequest('/categories', { method: 'POST', body: categorie });
export const modifierCategorie = (id, categorie) => apiRequest(`/categories/${id}`, { method: 'PUT', body: categorie });
export const supprimerCategorie = (id) => apiRequest(`/categories/${id}`, { method: 'DELETE' });
