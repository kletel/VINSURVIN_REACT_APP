import Constants from 'expo-constants';
import { Platform } from 'react-native';

function detectHostname() {
    if (typeof window !== 'undefined' && window?.location?.hostname) {
        return window.location.hostname;
    }
    const fromExtra = Constants.expoConfig?.extra?.HOSTNAME;
    if (fromExtra) return fromExtra;

    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const host = hostUri.split(':')[0];
        if (host === '127.0.0.1') return 'localhost';
        return host;
    }

    if (__DEV__) {
        if (Platform.OS === 'ios') return 'localhost';
        return '10.0.2.2';
    }

    return 'vinsurvin.vitissia.fr';
}

function getApiBaseUrl() {
    const hostname = detectHostname();

    if (hostname === 'localhost') return 'http://localhost:80';
    if (hostname === '127.0.0.1') return 'http://127.0.0.1';
    if (hostname === '192.168.2.130') return 'http://192.168.2.130:80';

    if (hostname === '192.168.2.118') return 'https://192.168.2.118';
    if (hostname === 'vinsurvin.vitissia.fr') return 'https://vinsurvin.vitissia.fr';

    return `https://vinsurvin.vitissia.fr`;
    /*return `http://localhost:80`;*/
}

const config = { apiBaseUrl: getApiBaseUrl() };

console.log('API Base URL:', config.apiBaseUrl);

export default config;