import * as Keychain from 'react-native-keychain';

export const AuthService = {
    async login(email, password) {
        // Simule une requête API (à remplacer par ton vrai backend)
        const response = await fetch('https://ton-api.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (!data.token) throw new Error('Échec de la connexion');
        await Keychain.setGenericPassword('token', data.token);
        return data.token;
    },

    async logout() {
        await Keychain.resetGenericPassword();
    },

    async getToken() {
        const creds = await Keychain.getGenericPassword();
        return creds ? creds.password : null;
    }
};
