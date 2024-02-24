import { View, Text, Button } from "react-native";
import MapView from "react-native-maps";
export default function ShelterScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>
        Welcome to the Shelter Screen
      </Text>

      <MapView
        style={{ flex: 1, minHeight: "75%", minWidth: "100%" }}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />
    </View>
  );
}
