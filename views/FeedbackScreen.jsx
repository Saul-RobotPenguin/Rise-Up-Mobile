import { View, Text, Button } from "react-native";

export default function FeedbackScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>
        Welcome to the Feedback Screen
      </Text>
      <Button
        title={"Go back Home"}
        onPress={() => navigation.navigate("Home")}
      />
    </View>
  );
}
