import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


//Navbar
import Header from './component/Header';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Header />
    </NavigationContainer>
  );
}

// I LOVE YOU RAMIZAH


