import { View, Text, Button } from "react-native";

export default function ShelterScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>
        Welcome to the Shelter Screen
      </Text>
      <Button
        title={"Go to Shelter again"}
        onPress={() => navigation.push("Shelter")}
      />
      <Button
        title={"Go to Feedback"}
        onPress={() => navigation.navigate("Feedback")}
      />
    </View>
  );
}
