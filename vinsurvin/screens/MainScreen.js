import React, { useContext, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import WebContainer from '../components/WebContainer';
import { AuthContext } from '../contexts/AuthContext';
import { NetInfoService } from '../services/netInfoService';

export default function MainScreen() {
    const { token } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const unsubscribe = NetInfoService.subscribe(setIsOnline);
        return () => unsubscribe();
    }, []);

    if (!isOnline) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Mode hors ligne activé 🌙</Text>
        </View>;
    }

    return <WebContainer token={token} />;
}
