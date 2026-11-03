import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest, deconnexion as deconnexionRequest } from '../Services/Utilisateur/UtilisateurService.js';

const STORAGE_KEY = 'orivy.user';
const AuthContext = createContext(null);

// Le jeton est dans un cookie HttpOnly (invisible au JS) : ici on ne garde que le membre,
// qui n'est pas secret. Si le cookie a expiré, la 1re requête protégée renverra 401 → déconnexion.
const readStoredUser = () => {
    try {
        const stocke = localStorage.getItem(STORAGE_KEY);
        return stocke ? JSON.parse(stocke) : null;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);

    const login = async (credentials) => {
        const utilisateur = await loginRequest(credentials);   // le back renvoie le membre et pose le cookie
        setUser(utilisateur);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(utilisateur));
        return utilisateur;
    };

    const logout = () => {
        deconnexionRequest().catch(() => {});   // demande au back d'effacer le cookie (sans bloquer)
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        window.orivySaison?.apercu(null);   // l'aperçu « Mode hiver » de l'admin ne survit pas à la déconnexion
    };

    // api.js signale un jeton refusé : on déconnecte
    useEffect(() => {
        const surExpiration = () => {
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
        };
        window.addEventListener('orivy:session-expiree', surExpiration);
        return () => window.removeEventListener('orivy:session-expiree', surExpiration);
    }, []);


    // Après une modification du profil : on remplace l'utilisateur gardé en mémoire,
    // pour que le nouveau nom apparaisse partout (avatar de l'en-tête, commentaires…)
    const mettreAJourUtilisateur = (nouveau) => {
        const fusion = { ...user, ...nouveau };
        setUser(fusion);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fusion));
    };

    const value = {
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role?.toLowerCase() === 'admin',
        login,
        logout,
        mettreAJourUtilisateur,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
};
