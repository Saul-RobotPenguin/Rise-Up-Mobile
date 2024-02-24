import { View, Text, Button } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>
        Welcome to the Home Screen
      </Text>
      {/* <Button
        title={"Go to Shelter"}
        onPress={() => navigation.navigate("Shelter")}
      /> */}
    </View>
  );
}
