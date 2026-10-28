import { lireJeton } from './jeton.js';


/**
 * Client HTTP unique de l'application.
 * Tous les services l'utilisent : c'est le SEUL endroit du projet qui appelle fetch.
 *
 * - ajoute le préfixe /api (le proxy Vite redirige vers le back)
 * - transforme automatiquement `body` en JSON
 * - lance une erreur si le back répond avec un code d'échec (404, 500...)
 * - renvoie directement les données (JSON, texte, ou null si la réponse est vide)
 */
export const apiRequest = async (path, { body, headers, ...options } = {}) => {
    const jeton = lireJeton();
    const estFichier = body instanceof FormData;

    const response = await fetch(`/api${path}`, {
        ...options,
        headers: {
            ...(!estFichier && { 'Content-Type': 'application/json'}),
            ...(jeton && { 'Authorization': `Bearer ${jeton}` }),
            ...headers,
        },
        body: body === undefined ? undefined : estFichier ? body : JSON.stringify(body),
    });

     if (response.status === 401 && jeton) {
        window.dispatchEvent(new Event('orivy:session-expiree'));
    }

    if (!response.ok) {
        // Spring renvoie { status, error, message, ... } : on ne garde que le message
        const texte = await response.text();
        let message = texte;
        try {
            message = JSON.parse(texte).message || texte;
        } catch {
            // réponse en texte brut : on la garde telle quelle
        }
        throw new Error(message || `Erreur HTTP ${response.status}`);
    }

    if (response.status === 204) return null;
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('application/json') ? response.json() : response.text();
};
