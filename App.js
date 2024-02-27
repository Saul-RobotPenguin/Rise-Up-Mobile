import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


//Navbar
import Header from './component/Header';


//Views
import HomeScreen from "./views/HomeScreen";
import ShelterScreen from "./views/ShelterScreen";
import FeedbackScreen from "./views/FeedbackScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          title: "Rise Up",
          headerStyle: {
            backgroundColor: "#DBD8B3",
          },
          headerTintColor: "#343434",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Rise Up" }}
        />
        <Stack.Screen
          name="Shelter"
          component={ShelterScreen}
          options={{ title: "Shelters Near You" }}
        />
        <Stack.Screen
          name="Feedback"
          component={FeedbackScreen}
          options={{ title: "Rise Up" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// I LOVE YOU RAMIZAH


