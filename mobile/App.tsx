import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { theme } from './src/theme';
import { I18nProvider } from './src/providers/I18nProvider';
import HomeScreen from './src/screens/HomeScreen';
import ServicesScreen from './src/screens/ServicesScreen';
import ContactScreen from './src/screens/ContactScreen';
import ChatScreen from './src/screens/ChatScreen';
import ConsultationScreen from './src/screens/ConsultationScreen';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const Stack = createStackNavigator();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <I18nProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor="#1e3a8a" />
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#1e3a8a',
                  },
                  headerTintColor: '#fff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              >
                <Stack.Screen 
                  name="Home" 
                  component={HomeScreen}
                  options={{ title: 'IPEACE Consulting' }}
                />
                <Stack.Screen 
                  name="Services" 
                  component={ServicesScreen}
                  options={{ title: 'Our Services' }}
                />
                <Stack.Screen 
                  name="Contact" 
                  component={ContactScreen}
                  options={{ title: 'Contact Us' }}
                />
                <Stack.Screen 
                  name="Chat" 
                  component={ChatScreen}
                  options={{ title: 'AI Assistant' }}
                />
                <Stack.Screen 
                  name="Consultation" 
                  component={ConsultationScreen}
                  options={{ title: 'Book Consultation' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </I18nProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}