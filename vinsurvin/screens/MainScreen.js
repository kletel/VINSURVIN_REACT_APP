import React, { useContext, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import WebContainer from '../components/WebContainer';
import { AuthContext } from '../contexts/AuthContext';
import { NetInfoService } from '../services/netInfoService';
import { getOrCreateDeviceId } from '../utils/deviceId';

export default function MainScreen() {
    const { token } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(true);
    const [deviceId, setDeviceId] = useState(null);
    const [nomUser, setNomUser] = useState(null);
    const [uuidUser, setUuidUser] = useState(null);

    useEffect(() => {
        const unsubscribe = NetInfoService.subscribe((online) => {
            console.log('[NetInfo] online?', online);
            setIsOnline(online);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        (async () => {
            const id = await getOrCreateDeviceId();
            console.log('[MainScreen] deviceId ready:', id);
            setDeviceId(id);

            const n = await SecureStore.getItemAsync('nom_user');
            const u = await SecureStore.getItemAsync('uuid_user');
            if (n) setNomUser(n);
            if (u) setUuidUser(u);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const n = await SecureStore.getItemAsync('nom_user');
            const u = await SecureStore.getItemAsync('uuid_user');
            if (n) setNomUser(n);
            if (u) setUuidUser(u);
        })();
    }, [token]);

    if (!isOnline) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Mode hors ligne activé 🌙</Text>
            </View>
        );
    }

    if (!deviceId) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Initialisation de l’appareil...</Text>
            </View>
        );
    }

    return (
        <WebContainer
            token={token}
            deviceId={deviceId}
            nomUser={nomUser}
            uuidUser={uuidUser}
        />
    );
}