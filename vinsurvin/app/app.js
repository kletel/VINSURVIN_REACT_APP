import { useEffect, useState } from "react";
import { Platform, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import SplashScreen from "../components/SplashScreen"; // adapte le chemin
import { AuthProvider } from "../contexts/AuthContext";
import MainScreen from "../screens/MainScreen";

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setAppReady(true);
    };

    prepare();
  }, []);

  if (!appReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar
          barStyle="light-content"
          translucent={false}
          backgroundColor={Platform.OS === "android" ? "#000" : undefined}
        />
        <MainScreen />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
