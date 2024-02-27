import { View, Text, Button, StyleSheet } from "react-native";
import Map from "../component/Map";
export default function ShelterScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the Shelter Screen</Text>
      <Map />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16, fontWeight: "700" },
});
