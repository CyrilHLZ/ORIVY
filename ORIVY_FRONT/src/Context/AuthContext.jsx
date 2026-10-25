import { createContext, useContext, useEffect, useState } from 'react';
import { login as loginRequest } from '../Services/Utilisateur/UtilisateurService.js';
import { effacerJeton, enregistrerJeton, jetonExpire, lireJeton } from '../Services/jeton.js';

const STORAGE_KEY = 'orivy.user';
const AuthContext = createContext(null);

const readStoredUser = () => {
    const jeton = lireJeton();

    if (!jeton || jetonExpire(jeton)) {
        effacerJeton();
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }

    try {
        const storedUser = localStorage.getItem(STORAGE_KEY);
        return storedUser ? JSON.parse(storedUser) : null;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);

    const login = async (credentials) => {
        const { token, utilisateur } = await loginRequest(credentials);
        enregistrerJeton(token);
        setUser(utilisateur);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(utilisateur));
        return utilisateur;
    };

    const logout = () => {
        effacerJeton();               // ← nouveau
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    // api.js signale un jeton refusé : on déconnecte
    useEffect(() => {
        const surExpiration = () => {
            effacerJeton();
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
