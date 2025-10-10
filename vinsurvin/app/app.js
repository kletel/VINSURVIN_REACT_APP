import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from '../contexts/AuthContext';
import MainScreen from '../screens/MainScreen';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" />
      <MainScreen />
    </AuthProvider>
  );
}
