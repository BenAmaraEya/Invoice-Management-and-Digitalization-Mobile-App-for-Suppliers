import React from 'react';
import { StatusBar } from 'expo-status-bar';
import Layout from './components/Layout';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Layout />
    </NavigationContainer>
  );
}
