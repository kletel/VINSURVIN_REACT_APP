// src/components/SplashScreen.js
import { LinearGradient } from "expo-linear-gradient"; // 👈 important pour Expo
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

const SplashScreen = () => {
  return (
    <LinearGradient
      style={styles.container}
      colors={["#8C2438", "#5A1020", "#3B0B15"]}
    >
      <View style={styles.content}>
        <Image
          source={require("../public/iconeload.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Bonjour, bienvenue sur Vinsurvin</Text>
        <ActivityIndicator style={styles.loader} size="large" color="#FFFFFF" />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
