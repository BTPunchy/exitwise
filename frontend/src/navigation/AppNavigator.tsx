import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { Map, MapPin } from 'lucide-react-native';

import { LandingScreen } from '../screens/LandingScreen';
// import { OnboardingScreen } from '../screens/OnboardingScreen';
// import { MapScreen } from '../screens/MapScreen';
import SavedTripsScreen from '../screens/SaveTripScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { Q1 } from '../screens/Q1Screen'
import { Q2 } from '../screens/Q2Screen'

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: "#0EA5E9" }}>
    {/* <Tab.Screen 
      name="Map" 
      component={MapScreen} 
      options={{ tabBarIcon: ({color}) => <Map color={color} size={24} /> }}
    /> */}
    <Tab.Screen 
      name="Planner" 
      component={SavedTripsScreen}
      options={{ tabBarIcon: ({color}) => <MapPin color={color} size={24} /> }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={LandingScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Q1" component={Q1} />
        <Stack.Screen name="Q2" component={Q2} />
        <Stack.Screen name="SavedTrips" component={SavedTripsScreen} />
        {/* <Stack.Screen name="Onboarding" component={OnboardingScreen} /> */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
