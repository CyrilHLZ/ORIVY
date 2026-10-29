import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { ajouterFavori, getFavoris, retirerFavori } from '../Services/Favori/FavoriService.js';

/*
 * Les favoris du membre connecté, chargés UNE fois et partagés par tous les cœurs de la page
 * (sinon 24 cartes de lieu = 24 requêtes). cibleType : "point", "activite" ou "sortie".
 */
const FavorisContext = createContext(null);
const cle = (type, id) => `${type}-${id}`;   // « point-12 », « sortie-3 »

export const FavorisProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [favoris, setFavoris] = useState([]);   // [{ cibleType, cibleId, dateAjout }], le plus récent d'abord

    useEffect(() => {
        if (!isAuthenticated) { setFavoris([]); return; }
        getFavoris().then(setFavoris).catch(() => setFavoris([]));
    }, [isAuthenticated]);

    // Un Set répond très vite à « point-12 est-il dedans ? »
    const cles = new Set(favoris.map((f) => cle(f.cibleType, f.cibleId)));
    const estFavori = (type, id) => cles.has(cle(type, id));

    const basculer = async (type, id) => {
        const avant = favoris;
        const deja = estFavori(type, id);
        // Affichage « optimiste » : le cœur change tout de suite, puis on prévient le back
        setFavoris(deja
            ? avant.filter((f) => cle(f.cibleType, f.cibleId) !== cle(type, id))
            : [{ cibleType: type, cibleId: id, dateAjout: new Date().toISOString() }, ...avant]);
        try {
            if (deja) await retirerFavori(type, id);
            else await ajouterFavori(type, id);
        } catch {
            setFavoris(avant);   // le back a refusé : on remet comme avant
        }
    };

    return <FavorisContext.Provider value={{ favoris, estFavori, basculer }}>{children}</FavorisContext.Provider>;
};

export const useFavoris = () => {
    const contexte = useContext(FavorisContext);
    if (!contexte) throw new Error('useFavoris doit être utilisé dans un FavorisProvider');
    return contexte;
};
