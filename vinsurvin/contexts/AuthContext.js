import React, { createContext, useEffect, useState } from 'react';
import { AuthService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const savedToken = await AuthService.getToken();
            if (savedToken) setToken(savedToken);
            setLoading(false);
        })();
    }, []);

    const login = async (email, password) => {
        const t = await AuthService.login(email, password);
        setToken(t);
    };

    const logout = async () => {
        await AuthService.logout();
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
