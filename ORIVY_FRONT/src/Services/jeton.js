// api.js le lit à chaque requête, AuthContext l'écrit à la connexion.
const CLE_JETON = 'orivy.jeton';

export const lireJeton = () => localStorage.getItem(CLE_JETON);
export const enregistrerJeton = (jeton) => localStorage.setItem(CLE_JETON, jeton);
export const effacerJeton = () => localStorage.removeItem(CLE_JETON);

// Le contenu d'un JWT est lisible (signé, pas chiffré) : on peut y lire la date d'expiration
export const jetonExpire = (jeton) => {
    try {
        const contenu = JSON.parse(atob(jeton.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        return contenu.exp * 1000 < Date.now(); // exp est en secondes, Date.now() en millisecondes
    } catch {
        return true; // jeton illisible = on le considère comme mort
    }
};
