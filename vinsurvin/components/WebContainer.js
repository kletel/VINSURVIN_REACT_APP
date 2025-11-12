import React, { useEffect, useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, ActivityIndicator, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { CacheManager } from '../services/cacheManager';
import config from '../config/config';

const WebContainer = ({ token, deviceId, nomUser, uuidUser }) => {
    const insets = useSafeAreaInsets();
    const webviewRef = useRef(null);

    const buildInjection = () => `
    (function(){
      try {
        var t  = ${JSON.stringify(token || '')};
        var d  = ${JSON.stringify(deviceId || '')};
        var nu = ${JSON.stringify(nomUser || '')};
        var uu = ${JSON.stringify(uuidUser || '')};

        localStorage.setItem('APP_HOST','rn');
        sessionStorage.setItem('APP_HOST','rn');

        if (t) {
          localStorage.setItem('token', t);
          sessionStorage.setItem('token', t);
        }
        if (d) {
          localStorage.setItem('deviceUUID', d);
          sessionStorage.setItem('deviceUUID', d);
        }
        if (uu) {
          localStorage.setItem('uuid_user', uu);
          sessionStorage.setItem('uuid_user', uu);
        }
        if (nu) {
          localStorage.setItem('nom_user', nu);
          sessionStorage.setItem('nom_user', nu);
        }

        window.dispatchEvent(new Event('app-auth-changed'));
        if (window.onReceiveDeviceUUID) window.onReceiveDeviceUUID(d);
      } catch(e){ console.error(e); }
    })(); true;
  `;

    const injectedJS = useMemo(buildInjection, [token, deviceId, nomUser, uuidUser]);

    useEffect(() => {
        if (!webviewRef.current) return;
        webviewRef.current.injectJavaScript(buildInjection());
    }, [token, deviceId, nomUser, uuidUser]);

    const onMessage = async (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message.type === 'LOGOUT') {
                await SecureStore.deleteItemAsync('token');
                await SecureStore.deleteItemAsync('uuid_user');
                await SecureStore.deleteItemAsync('nom_user');
                if (webviewRef.current) {
                    webviewRef.current.reload();
                }
                return;
            }

            if (message.type === 'CACHE') {
                await CacheManager.set(message.key, message.data);
            }
        } catch (error) {
            console.warn('Erreur onMessage WebView:', error);
        }
    };

    const WEB_URL = 'https://vinsurvin.vitissia.fr/';
    /*const WEB_URL = 'http://localhost:3006';*/

    console.log('[WebView] URL:', WEB_URL);
    console.log(
        '[WebView] inject token?', !!token,
        'deviceId?', deviceId,
        'uuidUser?', uuidUser,
        'nomUser?', nomUser
    );

    return (
        <SafeAreaView
            style={{ flex: 1, backgroundColor: '#fff' }}
            edges={['top', 'left', 'right', 'bottom']}
        >
            <View
                style={{
                    flex: 1,
                    paddingTop: insets.top,       
                    paddingBottom: insets.bottom, 
                    backgroundColor: '#fff',
                }}
            >
                <WebView
                    ref={webviewRef}
                    source={{ uri: WEB_URL }}
                    javaScriptEnabled
                    domStorageEnabled
                    onMessage={onMessage}
                    startInLoadingState
                    renderLoading={() => <ActivityIndicator style={{ marginTop: 50 }} />}
                    injectedJavaScriptBeforeContentLoaded={injectedJS}
                    injectedJavaScript={injectedJS}
                    bounces={false}
                />
            </View>
        </SafeAreaView>
    );
};

export default WebContainer;