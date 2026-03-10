import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import Map from "../component/Map";
import dropInData from "../data/dropInCenters.json";

const centers = Array.isArray(dropInData?.centers) ? dropInData.centers : [];

const hasCoordinates = (location) =>
  Number.isFinite(location?.lat) && Number.isFinite(location?.lon);

const toRadians = (degrees) => (degrees * Math.PI) / 180;
const distanceInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function DirectionsButton({ disabled, onPress }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.directionsButton,
        disabled && styles.directionsButtonDisabled,
        !disabled && hovered && { backgroundColor: "#9E9B75" },
      ]}
    >
      <Text
        style={[
          styles.directionsButtonText,
          disabled && styles.directionsButtonTextDisabled,
        ]}
      >
        Get Directions
      </Text>
    </Pressable>
  );
}

export default function ShelterScreen() {
  const hasLocations = centers.length > 0;
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);
  const scrollViewRef = useRef(null);
  const cardPositions = useRef({});

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) {
          return;
        }
        if (status !== "granted") {
          setLocationStatus("denied");
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!isMounted) {
          return;
        }
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLocationStatus("granted");
      } catch (error) {
        console.warn("Unable to fetch shelter screen location", error);
        if (isMounted) {
          setLocationStatus("error");
        }
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const centersWithDistance = useMemo(
    () =>
      centers.map((center) => {
        if (
          userLocation &&
          hasCoordinates(center) &&
          Number.isFinite(userLocation.latitude) &&
          Number.isFinite(userLocation.longitude)
        ) {
          return {
            ...center,
            distanceKm: distanceInKm(
              userLocation.latitude,
              userLocation.longitude,
              center.lat,
              center.lon,
            ),
          };
        }
        return { ...center, distanceKm: null };
      }),
    [centers, userLocation],
  );

  const sortedCenters = useMemo(() => {
    if (!userLocation) {
      return centersWithDistance;
    }
    return [...centersWithDistance].sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [centersWithDistance, userLocation]);

  const getDirectionsUrl = (location) => {
    if (!hasCoordinates(location)) {
      return null;
    }
    const encodedLabel = encodeURIComponent(location?.name ?? "Shelter");
    if (Platform.OS === "ios") {
      return `http://maps.apple.com/?daddr=${location.lat},${location.lon}&q=${encodedLabel}`;
    }
    if (Platform.OS === "android") {
      // https scheme opens Google Maps app if installed, otherwise browser.
      return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lon}&destination_place_id=&travelmode=walking`;
    }
    // Web and fallback
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`;
  };

  const handleMarkerPress = useCallback((location) => {
    setSelectedId(location.id);
    const y = cardPositions.current[location.id];
    if (y != null && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y, animated: true });
    }
  }, []);

  const handleDirectionsPress = async (location) => {
    const url = getDirectionsUrl(location);
    if (!url) {
      return;
    }
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.warn("Unable to open directions link", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NYC Drop-In Centers</Text>
      <Text style={styles.subtitle}>
        Information sourced directly from NYC311. Drop-in centers operate 24/7,
        including holidays.
      </Text>
      {!hasLocations ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>
            Drop-in center data is unavailable right now. Please run npm run
            sync:dropins to refresh the cache.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.mapWrapper}>
            <Map locations={centers} onMarkerPress={handleMarkerPress} />
          </View>
          <View style={styles.sortingHintWrapper}>
            {userLocation ? (
              <Text style={styles.sortingHint}>
                Showing closest shelters first (updated from your location).
              </Text>
            ) : locationStatus === "denied" ? (
              <Text style={styles.sortingHint}>
                Location access denied - showing unsorted list.
              </Text>
            ) : (
              <Text style={styles.sortingHint}>
                Fetching your location to sort shelters by distance...
              </Text>
            )}
          </View>
          <ScrollView
            ref={scrollViewRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {sortedCenters.map((location) => {
              const directionsUrl = getDirectionsUrl(location);
              const disabled = !directionsUrl;
              const isSelected = selectedId === location.id;
              return (
                <View
                  key={location.id}
                  onLayout={(e) => {
                    cardPositions.current[location.id] = e.nativeEvent.layout.y;
                  }}
                  style={[
                    styles.card,
                    isSelected && styles.cardSelected,
                  ]}
                >
                  <Text style={styles.cardTitle}>{location.name}</Text>
                  {location.borough ? (
                    <Text style={styles.boroughLabel}>{location.borough}</Text>
                  ) : null}
                  {location.address ? (
                    <Text style={styles.cardDetail}>{location.address}</Text>
                  ) : null}
                  {location.transit ? (
                    <Text style={styles.cardDetail}>{location.transit}</Text>
                  ) : null}
                  {location.hours ? (
                    <Text style={styles.cardDetail}>{location.hours}</Text>
                  ) : null}
                  {location.distanceKm != null ? (
                    <Text style={styles.cardDistance}>
                      {location.distanceKm.toFixed(1)} km away
                    </Text>
                  ) : null}
                  <DirectionsButton
                    disabled={disabled}
                    onPress={() => handleDirectionsPress(location)}
                  />
                </View>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F0E8",
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#343434",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#5c5c5c",
  },
  feedback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackText: {
    fontSize: 16,
    color: "#343434",
    textAlign: "center",
  },
  mapWrapper: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    overflow: "hidden",
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 16,
    paddingBottom: 24,
  },
  sortingHintWrapper: {
    paddingHorizontal: 8,
  },
  sortingHint: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  boroughLabel: {
    fontSize: 12,
    color: "#6b6b6b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#DBD8B3",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 4,
    borderWidth: 2,
    borderColor: "transparent",
  },
  cardSelected: {
    borderColor: "#343434",
    backgroundColor: "#CCC9A3",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#343434",
  },
  cardDetail: {
    fontSize: 14,
    color: "#5C5840",
  },
  cardDistance: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#7A7760",
  },
  directionsButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#B5B28A",
    alignItems: "center",
  },
  directionsButtonDisabled: {
    backgroundColor: "#c7c7c7",
  },
  directionsButtonText: {
    color: "#343434",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  directionsButtonTextDisabled: {
    color: "#999",
  },
});
