import { createContext, useContext, useState } from 'react';
import { login as loginRequest } from '../Services/api.js';

const STORAGE_KEY = 'orivy.user';
const AuthContext = createContext(null);

const readStoredUser = () => {
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
        const response = await loginRequest(credentials);
        const authenticatedUser = typeof response === 'object' && response !== null
            ? response
            : { email: credentials.email, role: 'utilisateur' };

        setUser(authenticatedUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
        return authenticatedUser;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    const value = {
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role?.toLowerCase() === 'admin',
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
    return context;
};
