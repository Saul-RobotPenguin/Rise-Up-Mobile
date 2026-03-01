import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Footer from "../component/Footer";
import HeartIcon from "../assets/Heart.svg";
import FoodIcon from "../assets/Food.svg";
import WifiIcon from "../assets/Wifi.svg";
import ShelterIcon from "../assets/Home.svg";

const image = {
  uri: "https://images.unsplash.com/photo-1532960401447-7dd05bef20b0?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bmV3JTIweW9yayUyMGNpdHl8ZW58MHx8MHx8fDA%3D",
};
export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={image} style={styles.headerImage} />
        <Text style={styles.headerText}>Rise Up</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Shelter")}
        >
          <ShelterIcon width={50} height={50} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Shelters</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Health")}
        >
          <HeartIcon width={50} height={50} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Healthcare</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Shelter")}
        >
          <FoodIcon width={50} height={50} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>FoodBanks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Kiosks")}
        >
          <WifiIcon width={50} height={50} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Kiosks</Text>
        </TouchableOpacity>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    zIndex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginTop: 20,
    padding: 10,
  },
  button: {
    backgroundColor: "#DBD8B3",
    width: "48%",
    aspectRatio: 1,
    padding: 20,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
    elevation: 3, // Add elevation for shadow effect
  },
  buttonText: {
    color: "#343434",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
});
