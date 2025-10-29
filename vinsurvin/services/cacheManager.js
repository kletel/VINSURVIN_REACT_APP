import * as SecureStore from 'expo-secure-store';

export const CacheManager = {
    async set(key, value) {
        try {
            const v = typeof value === 'string' ? value : JSON.stringify(value);
            await SecureStore.setItemAsync(String(key), v);
        } catch (e) {
            console.warn('[CacheManager.set] fail:', e);
        }
    },
    async get(key) {
        try {
            const raw = await SecureStore.getItemAsync(String(key));
            try { return JSON.parse(raw); } catch { return raw; }
        } catch (e) {
            console.warn('[CacheManager.get] fail:', e);
            return null;
        }
    },
    async remove(key) {
        try {
            await SecureStore.deleteItemAsync(String(key));
        } catch (e) {
            console.warn('[CacheManager.remove] fail:', e);
        }
    }
};