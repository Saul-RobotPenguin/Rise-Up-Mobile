import { View, Text, StyleSheet } from "react-native";
import Map from "../component/Map";
import HealthLocations from "../data/HealthLocations";

export default function HealthScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Health Screen</Text>
      <Map HealthLocations={HealthLocations} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16, fontWeight: "700" },
});
