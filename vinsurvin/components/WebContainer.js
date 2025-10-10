import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';
import { View, ActivityIndicator } from 'react-native';
import { CacheManager } from '../services/cacheManager';

const WebContainer = ({ token }) => {
    const webviewRef = useRef(null);

    const onMessage = async (event) => {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === 'CACHE') {
            await CacheManager.set(message.key, message.data);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <WebView
                ref={webviewRef}
                source={{ uri: 'https://vinsurvin.vitissia.fr' }}
                javaScriptEnabled
                domStorageEnabled
                onMessage={onMessage}
                startInLoadingState
                renderLoading={() => <ActivityIndicator style={{ marginTop: 50 }} />}
                injectedJavaScript={`window.localStorage.setItem('token', '${token}')`}
            />
        </View>
    );
};

export default WebContainer;
