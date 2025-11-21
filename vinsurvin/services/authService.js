import * as SecureStore from 'expo-secure-store';
import config from '../config/config';
import { getOrCreateDeviceId } from '../utils/deviceId';

async function debugResponse(tag, res) {
    console.log(`[${tag}] status=`, res.status, res.statusText);
    try {
        for (const [k, v] of res.headers.entries()) {
            console.log(`[${tag}] header:`, k, v);
        }
    } catch { }
    const raw = await res.clone().text();
    console.log(`[${tag}] raw=`, raw);
    let json = null;
    try { json = JSON.parse(raw); } catch (e) { console.log(`[${tag}] JSON parse error:`, e.message); }
    console.log(`[${tag}] json=`, json);
    return json;
}

export const AuthService = {
    async login(email, password) {
        try {
            const deviceUUID = await getOrCreateDeviceId();

            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('deviceUUID', deviceUUID);

            const response = await fetch(`${config.apiBaseUrl}/4DACTION/react_AuthLogin`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error(`Erreur ${response.status}`);

            const data = await response.json();

            if (!data?.accessToken) {
                throw new Error('Échec de la connexion (token manquant)');
            }

            await SecureStore.setItemAsync('token', data.accessToken);
            await SecureStore.setItemAsync('deviceUUID', deviceUUID);
            if (data.uuid_user) await SecureStore.setItemAsync('uuid_user', String(data.uuid_user));
            if (data.nom_user) await SecureStore.setItemAsync('nom_user', String(data.nom_user));

            return data.accessToken;
        } catch (err) {
            console.error('❌ AuthService.login erreur:', err);
            throw err;
        }
    },

    async autoLoginByDevice(deviceUUID) {
        try {
            console.log('[AUTOLOGIN] apiBaseUrl=', config.apiBaseUrl);
            console.log('[AUTOLOGIN] deviceUUID used=', deviceUUID);

            const formData = new FormData();
            formData.append('deviceUUID', deviceUUID);

            const res = await fetch(`${config.apiBaseUrl}/4DACTION/react_autoLoginByDevice`, {
                method: 'POST',
                body: formData,
            });

            const raw = await res.clone().text();
            console.log('[AUTOLOGIN] raw=', raw);

            const data = await debugResponse('AUTOLOGIN', res);
            if (!res.ok) throw new Error(`Erreur réseau (${res.status})`);

            console.log('[AUTOLOGIN] accessToken=', data?.accessToken);
            console.log('[AUTOLOGIN] uuid_user=', data?.uuid_user, 'nom_user=', data?.nom_user);

            if (data?.accessToken) {
                await SecureStore.setItemAsync('token', String(data.accessToken));
                await SecureStore.setItemAsync('deviceUUID', String(deviceUUID));
                if (data.uuid_user) await SecureStore.setItemAsync('uuid_user', String(data.uuid_user));
                if (data.nom_user) await SecureStore.setItemAsync('nom_user', String(data.nom_user));

                console.log('[AUTOLOGIN] SECURE token=', await SecureStore.getItemAsync('token'));
                console.log('[AUTOLOGIN] SECURE uuid_user=', await SecureStore.getItemAsync('uuid_user'));
                console.log('[AUTOLOGIN] SECURE nom_user=', await SecureStore.getItemAsync('nom_user'));

                return data;
            }

            return null;
        } catch (err) {
            console.warn(' AutoLogin impossible:', err);
            return null;
        }
    },

    async logout() {
        try {
            const deviceUUID = await SecureStore.getItemAsync('deviceUUID');
            const token = await SecureStore.getItemAsync('token');

            // On informe 4D pour couper le lien device <-> user
            if (deviceUUID && token) {
                const formData = new FormData();
                formData.append('deviceUUID', deviceUUID);

                try {
                    const res = await fetch(`${config.apiBaseUrl}/4DACTION/react_logoutDevice`, {
                        method: 'POST',
                        headers: { Authorization: token },
                        body: formData,
                    });
                    console.log('[LOGOUT] react_logoutDevice status =', res.status);
                    const txt = await res.text();
                    console.log('[LOGOUT] react_logoutDevice body =', txt);
                } catch (e) {
                    console.warn('[LOGOUT] erreur appel react_logoutDevice:', e);
                }
            }

            // On nettoie le SecureStore (mais on laisse deviceUUID pour de futurs logins)
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('uuid_user');
            await SecureStore.deleteItemAsync('nom_user');

        } catch (err) {
            console.error('Erreur logout:', err);
        }
    },

    async getToken() {
        try {
            return await SecureStore.getItemAsync('token');
        } catch (err) {
            console.error('Erreur getToken:', err);
            return null;
        }
    },
};