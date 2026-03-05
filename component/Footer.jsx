import { Text, View, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Made by Saul.C</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: "100%",
    backgroundColor: "#DBD8B3",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    alignSelf: "stretch",
    marginTop: 32,
    borderRadius: 12,
  },
  footerText: {
    fontSize: 16,
    color: "black",
  },
});
