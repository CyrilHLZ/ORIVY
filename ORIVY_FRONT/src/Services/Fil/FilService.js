import { apiRequest } from '../api.js';

/*
 * Fil façon TikTok (dans le back : FilController).
 * onglet : "pour-toi" (tout le monde) ou "abonnements" (les membres que je suis).
 * page : 0, 1, 2… (10 publications par page). Une page de moins de 10 = c'était la dernière.
 */
export const getFil = (onglet, page) => apiRequest(`/fil?onglet=${onglet}&page=${page}`);
