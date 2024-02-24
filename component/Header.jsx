import { createDrawerNavigator } from "@react-navigation/drawer";

//Views
import HomeScreen from "../views/HomeScreen";
import ShelterScreen from "../views/ShelterScreen";
import FeedbackScreen from "../views/FeedbackScreen";
const Drawer = createDrawerNavigator();

export default function Header() {
  return (
    <Drawer.Navigator
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
      <Drawer.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: "Rise Up" }}
      />
      <Drawer.Screen
        name="Shelter"
        component={ShelterScreen}
        options={{ title: "Shelters Near You" }}
      />
      <Drawer.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ title: "Rise Up" }}
      />
    </Drawer.Navigator>
  );
}
