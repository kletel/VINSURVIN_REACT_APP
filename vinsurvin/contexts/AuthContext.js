import React, { createContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getOrCreateDeviceId } from '../utils/deviceId';
import { AuthService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const tokenFromStore = await SecureStore.getItemAsync('token');
                console.log('[AuthContext] boot: tokenFromStore?', !!tokenFromStore);

                let hasValidToken = false;

                if (tokenFromStore) {
                    try {
                        const res = await fetch(`${config.apiBaseUrl}/4DACTION/react_getUserInfo?UUID_=`, {
                            method: 'GET',
                            headers: { Authorization: tokenFromStore },
                        });
                        if (res.ok) {
                            hasValidToken = true;
                            setToken(tokenFromStore);
                        } else {
                            await SecureStore.deleteItemAsync('token');
                            await SecureStore.deleteItemAsync('uuid_user');
                            await SecureStore.deleteItemAsync('nom_user');
                            setToken(null);
                        }
                    } catch {
                        await SecureStore.deleteItemAsync('token');
                        await SecureStore.deleteItemAsync('uuid_user');
                        await SecureStore.deleteItemAsync('nom_user');
                        setToken(null);
                    }
                }

                if (!hasValidToken) {
                    const deviceUUID = await getOrCreateDeviceId();
                    console.log('[AuthContext] boot: autoLogin with UUID:', deviceUUID);

                    const res = await AuthService.autoLoginByDevice(deviceUUID);
                    console.log('[AuthContext] boot: autoLogin success?', !!res);

                    if (res?.accessToken) setToken(res.accessToken);
                }
            } catch (e) {
                console.warn('[AuthContext] boot error:', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = async (email, password) => {
        console.log('[AuthContext] manual login…');
        const t = await AuthService.login(email, password);
        setToken(t);
        console.log('[AuthContext] manual login success');
    };

    const logout = async () => {
        await AuthService.logout();
        setToken(null);
        console.log('[AuthContext] logged out');
    };

    return (
        <AuthContext.Provider value={{ token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};