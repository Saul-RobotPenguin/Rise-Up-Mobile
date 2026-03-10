import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
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

const NAV_BUTTONS = [
  { label: "Shelters", subtitle: "Find nearby shelters", icon: ShelterIcon, route: "Shelter" },
  { label: "Healthcare", subtitle: "Clinics & services", icon: HeartIcon, route: "Health" },
  { label: "Food Banks", subtitle: "Free food assistance", icon: FoodIcon, route: "Shelter" },
  { label: "Kiosks", subtitle: "Free WiFi access", icon: WifiIcon, route: "Kiosks" },
];

function NavCard({ label, subtitle, icon: Icon, route, navigation, iconSize, isWide, borderRight, borderBottom }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={() => navigation.navigate(route)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed
          ? "rgba(255,255,255,0.45)"
          : hovered
          ? "rgba(255,255,255,0.25)"
          : "transparent",
        borderRightWidth: borderRight ? 1 : 0,
        borderBottomWidth: borderBottom ? 1 : 0,
        borderColor: "#C8C4A0",
        cursor: "pointer",
      })}
    >
      <View
        className="items-center justify-center"
        style={{
          minHeight: isWide ? 280 : undefined,
          paddingVertical: isWide ? 40 : 24,
        }}
      >
        <Icon width={iconSize} height={iconSize} />
        <Text
          className="font-bold"
          style={{
            color: "#343434",
            fontSize: isWide ? 22 : 16,
            marginTop: isWide ? 20 : 12,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            color: "#5C5840",
            fontSize: isWide ? 15 : 12,
            marginTop: isWide ? 8 : 4,
          }}
        >
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isWide = width >= 600;
  const isSmallPhone = width < 360;

  const headerHeight = Math.min(
    Math.max(height * (isWide ? 0.4 : 0.34), 240),
    isWide ? 500 : 320
  );
  const iconSize = isWide ? 80 : isSmallPhone ? 40 : 50;

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ backgroundColor: "#F5F0E8" }}
    >
      {/* Hero Banner - full width */}
      <View
        style={{ height: headerHeight }}
        className="items-center justify-center overflow-hidden"
      >
        <Image
          source={image}
          className="absolute w-full h-full"
          style={{ resizeMode: "cover" }}
        />
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/50" />
        <View className="items-center justify-center z-10 px-6">
          <Text
            className="font-extrabold text-white"
            style={{
              fontSize: isWide ? 72 : 48,
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 12,
              letterSpacing: 6,
            }}
          >
            RISE UP
          </Text>
          <View
            className="rounded-full mt-4 mb-4"
            style={{
              height: 2,
              width: isWide ? 80 : 50,
              backgroundColor: "rgba(255,255,255,0.5)",
            }}
          />
          <Text
            className="text-white font-medium"
            style={{
              fontSize: isWide ? 20 : 14,
              textShadowColor: "rgba(0,0,0,0.5)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 6,
              letterSpacing: 2,
            }}
          >
            NYC Resources at Your Fingertips
          </Text>
        </View>
      </View>

      {/* Content area - full width */}
      <View className="pt-6" style={{ alignItems: "center" }}>
        <View style={{ width: "100%" }}>
          {/* Section Label - centered */}
          <View className="mb-5 items-center">
            <Text
              className={`font-bold ${isWide ? "text-2xl" : "text-lg"}`}
              style={{ color: "#343434" }}
            >
              What do you need?
            </Text>
            <Text
              className={`mt-1 ${isWide ? "text-base" : "text-sm"}`}
              style={{ color: "#8A8570" }}
            >
              Tap a category to find resources near you
            </Text>
          </View>

          {/* Navigation Cards - full width */}
          <View
            style={{
              backgroundColor: "#DBD8B3",
              overflow: "hidden",
            }}
          >
            {isWide ? (
              <View>
                <View className="flex-row">
                  {NAV_BUTTONS.slice(0, 2).map(({ label, subtitle, icon, route }, i) => (
                    <NavCard
                      key={label}
                      label={label}
                      subtitle={subtitle}
                      icon={icon}
                      route={route}
                      navigation={navigation}
                      iconSize={iconSize}
                      isWide={isWide}
                      borderRight={i === 0}
                      borderBottom={true}
                    />
                  ))}
                </View>
                <View className="flex-row">
                  {NAV_BUTTONS.slice(2, 4).map(({ label, subtitle, icon, route }, i) => (
                    <NavCard
                      key={label}
                      label={label}
                      subtitle={subtitle}
                      icon={icon}
                      route={route}
                      navigation={navigation}
                      iconSize={iconSize}
                      isWide={isWide}
                      borderRight={i === 0}
                      borderBottom={false}
                    />
                  ))}
                </View>
              </View>
            ) : (
              <View>
                {NAV_BUTTONS.map(({ label, subtitle, icon, route }, i) => (
                  <NavCard
                    key={label}
                    label={label}
                    subtitle={subtitle}
                    icon={icon}
                    route={route}
                    navigation={navigation}
                    iconSize={iconSize}
                    isWide={isWide}
                    borderRight={false}
                    borderBottom={i < NAV_BUTTONS.length - 1}
                  />
                ))}
              </View>
            )}
          </View>

          <View className="px-5">
            <Footer />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
