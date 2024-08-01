import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './LoginScreen';
import HomeScreen from './HomeScreen';
import SignupScreen from './SignupScreen';
import PeriodTrackerScreen from './PeriodTrackerScreen'; // Import your PeriodTrackerScreen
import PadSOSScreen from './PadSOSScreen'; // Import your PadSOSScreen


const Stack = createNativeStackNavigator();

export default function TabLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="PeriodTracker" component={PeriodTrackerScreen} />
      <Stack.Screen name="PadSOS" component={PadSOSScreen} />

    </Stack.Navigator>
  );
}
//working login