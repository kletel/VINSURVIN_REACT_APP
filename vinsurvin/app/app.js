import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import MainScreen from '../screens/MainScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar
          barStyle="light-content" 
          translucent={false}
          backgroundColor={Platform.OS === 'android' ? '#000' : undefined}
        />
        <MainScreen />
      </AuthProvider>
    </SafeAreaProvider>
  );
}