import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme';
import BoinTabBar from './src/BoinTabBar';
import RegistroScreen from './src/screens/RegistroScreen';
import BoinScreen from './src/screens/BoinScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import MapScreen from './src/screens/MapScreen';
import MercadoScreen from './src/screens/MercadoScreen';
import WalletScreen from './src/screens/WalletScreen';
import YoScreen from './src/screens/YoScreen';

const Tab = createBottomTabNavigator();

function Tabs({ user, onLogout }) {
  const { mode } = useTheme();
  return (
    <NavigationContainer>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Tab.Navigator
        initialRouteName="Map"
        tabBar={(props) => <BoinTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Boin" component={BoinScreen} />
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Mercado" component={MercadoScreen} />
        <Tab.Screen name="Wallet">{() => <WalletScreen user={user} />}</Tab.Screen>
        <Tab.Screen name="Yo">{() => <YoScreen user={user} onLogout={onLogout} />}</Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function Root() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTheme();

  useEffect(() => {
    AsyncStorage.getItem('boinUser').then(v => { if (v) setUser(JSON.parse(v)); }).finally(() => setLoading(false));
  }, []);

  const onLogin = async (u) => { await AsyncStorage.setItem('boinUser', JSON.stringify(u)); setUser(u); };
  const onLogout = async () => { await AsyncStorage.removeItem('boinUser'); setUser(null); };

  if (loading) return <View style={{ flex: 1, backgroundColor: t.bg, justifyContent: 'center' }}><ActivityIndicator color={t.acc} size="large" /></View>;
  if (!user) return <RegistroScreen onLogin={onLogin} />;
  return <Tabs user={user} onLogout={onLogout} />;
}

export default function App() {
  return <ThemeProvider><Root /></ThemeProvider>;
}