import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { CacheManager } from '../services/cacheManager';

const WebContainer = ({ token, deviceId, nomUser, uuidUser }) => {
    const insets = useSafeAreaInsets();
    const webviewRef = useRef(null);

    const buildInjection = () => `
      (function() {
        try {
          var t  = ${JSON.stringify(token || '')};
          var d  = ${JSON.stringify(deviceId || '')};
          var nu = ${JSON.stringify(nomUser || '')};
          var uu = ${JSON.stringify(uuidUser || '')};

          // Debug vers React Native
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'DEBUG_INJECTION',
              tokenPresent: !!t,
              deviceUUID: d,
              nomUser: nu,
              uuidUser: uu
            }));
          }

          localStorage.setItem('APP_HOST','rn');
          sessionStorage.setItem('APP_HOST','rn');

          if (d) {
            localStorage.setItem('deviceUUID', d);
            sessionStorage.setItem('deviceUUID', d);
          }
          if (t) {
            localStorage.setItem('token', t);
            sessionStorage.setItem('token', t);
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
        } catch (e) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'DEBUG_INJECTION_ERROR',
              message: e.message
            }));
          }
        }
      })();
      true;
    `;

    const injectedJS = useMemo(buildInjection, [token, deviceId, nomUser, uuidUser]);

    useEffect(() => {
        if (!webviewRef.current) return;
        webviewRef.current.injectJavaScript(buildInjection());
    }, [token, deviceId, nomUser, uuidUser]);

    const onMessage = async (event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);

            if (message.type === 'DEBUG_INJECTION') {
                console.log('[INJECTION DEBUG]', message);
                return;
            }
            if (message.type === 'DEBUG_INJECTION_ERROR') {
                console.log('[INJECTION ERROR]', message.message);
                return;
            }

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
            style={{ flex: 1, backgroundColor: '#8C2438' }}
            edges={['left', 'right']}
        >
            <View
                style={{
                    flex: 1,
                    paddingTop: 60,
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
                    automaticallyAdjustContentInsets={false}
                    contentInset={{ top: 0, bottom: 0, left: 0, right: 0 }}
                    contentInsetAdjustmentBehavior="never"
                    bounces={false}
                />
            </View>
        </SafeAreaView>
    );
};

export default WebContainer;