import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import Footer from "../component/Footer";
import HeartIcon from "../assets/Heart.svg";
import FoodIcon from "../assets/Food.svg";
import WifiIcon from "../assets/Wifi.svg";
import ShelterIcon from "../assets/Home.svg";

const image = {
  uri: "https://images.unsplash.com/photo-1532960401447-7dd05bef20b0?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bmV3JTIweW9yayUyMGNpdHl8ZW58MHx8MHx8fDA%3D",
};
export default function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWideTablet = width >= 1024;
  const isSmallPhone = width < 360;

  const headerHeight = Math.min(
    Math.max(height * (isTablet ? 0.28 : 0.34), 220),
    isTablet ? 380 : 320
  );
  const buttonWidth = isWideTablet
    ? "30%"
    : isTablet
    ? "45%"
    : isSmallPhone
    ? "100%"
    : "47%";
  const cardMinHeight = isTablet ? 210 : isSmallPhone ? 135 : 170;
  const buttonPadding = isTablet ? 28 : isSmallPhone ? 16 : 20;
  const iconSize = isTablet ? 62 : isSmallPhone ? 44 : 52;
  const buttonTextSize = isTablet ? 20 : isSmallPhone ? 16 : 18;

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scrollContainer,
        { paddingHorizontal: isTablet ? 32 : 16 },
      ]}
    >
      <View
        style={[
          styles.container,
          { maxWidth: isWideTablet ? 1000 : isTablet ? 800 : 500 },
        ]}
      >
        <View style={[styles.header, { height: headerHeight }]}>
          <Image source={image} style={styles.headerImage} />
          <Text style={[styles.headerText, { fontSize: isTablet ? 32 : 24 }]}>
            Rise Up
          </Text>
        </View>
        <View
          style={[styles.buttonContainer, { marginTop: isTablet ? 30 : 20 }]}
        >
          <TouchableOpacity
            style={[
              styles.button,
              {
                width: buttonWidth,
                minHeight: cardMinHeight,
                paddingVertical: buttonPadding,
              },
            ]}
            onPress={() => navigation.navigate("Shelter")}
          >
            <ShelterIcon
              width={iconSize}
              height={iconSize}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { fontSize: buttonTextSize }]}>
              Shelters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                width: buttonWidth,
                minHeight: cardMinHeight,
                paddingVertical: buttonPadding,
              },
            ]}
            onPress={() => navigation.navigate("Health")}
          >
            <HeartIcon
              width={iconSize}
              height={iconSize}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { fontSize: buttonTextSize }]}>
              Healthcare
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                width: buttonWidth,
                minHeight: cardMinHeight,
                paddingVertical: buttonPadding,
              },
            ]}
            onPress={() => navigation.navigate("Shelter")}
          >
            <FoodIcon
              width={iconSize}
              height={iconSize}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { fontSize: buttonTextSize }]}>
              FoodBanks
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                width: buttonWidth,
                minHeight: cardMinHeight,
                paddingVertical: buttonPadding,
              },
            ]}
            onPress={() => navigation.navigate("Kiosks")}
          >
            <WifiIcon
              width={iconSize}
              height={iconSize}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { fontSize: buttonTextSize }]}>
              Kiosks
            </Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    paddingVertical: 24,
  },
  container: {
    width: "100%",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
  },
  headerText: {
    fontWeight: "bold",
    color: "white",
    zIndex: 1,
    textShadowColor: "rgba(0,0,0,0.45)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    backgroundColor: "#DBD8B3",
    borderRadius: 14,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#343434",
    fontWeight: "bold",
  },
  buttonImage: {
    width: 50,
    height: 50,
    marginBottom: 10,
  },
});
