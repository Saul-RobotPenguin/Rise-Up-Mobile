import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import Map from "../component/Map";

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

const loadCommunityResources = () => {
  try {
    const payload = require("../data/communityResources.json");
    const resolvedPayload =
      (payload && typeof payload === "object" && payload.default) || payload;
    if (resolvedPayload && typeof resolvedPayload === "object") {
      if (Array.isArray(resolvedPayload.locations)) {
        return resolvedPayload;
      }
      if (Array.isArray(resolvedPayload)) {
        return { locations: resolvedPayload };
      }
      return resolvedPayload;
    }
  } catch (error) {
    console.warn(
      "[HealthScreen] Unable to load community resources JSON",
      error
    );
  }
  return { locations: [] };
};

const CLINIC_KEYWORDS = [
  "clinic",
  "health center",
  "healthcare",
  "community health",
  "medical center",
];
const CLINIC_SOURCE_IDS = new Set([
  "cbwchc",
  "nyit-pillars",
  "echo-clinic",
  "hofstra-student-clinic",
]);

const hasCoordinates = (location) =>
  Number.isFinite(location?.lat) && Number.isFinite(location?.lon);

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

export default function HealthScreen() {
  const [selectedId, setSelectedId] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const scrollViewRef = useRef(null);
  const cardPositions = useRef({});

  const clinics = useMemo(() => {
    const communityResources = loadCommunityResources();

    const isClinic = (resource = {}) => {
      if (CLINIC_SOURCE_IDS.has(resource.sourceId)) {
        return true;
      }
      const haystack = `${resource.name ?? ""} ${
        resource.organization ?? ""
      }`.toLowerCase();
      const keywordMatch = CLINIC_KEYWORDS.some((keyword) =>
        haystack.includes(keyword)
      );
      const hasServiceData = Array.isArray(resource.services)
        ? resource.services.length > 0
        : false;
      return keywordMatch || hasServiceData;
    };

    const formatServices = (services = []) =>
      services
        .map((service) => service?.name?.trim())
        .filter(Boolean);

    const locationsArray = Array.isArray(communityResources?.locations)
      ? communityResources.locations
      : [];

    return locationsArray
      .filter(isClinic)
      .map((resource) => {
        const availability =
          resource.availability?.filter(Boolean).join(" | ") || undefined;

        return {
          id: resource.id,
          name: resource.name ?? resource.organization ?? "Clinic",
          organization: resource.organization,
          address: resource.address ?? null,
          phone: resource.phones?.[0] ?? null,
          lat: resource.lat ?? null,
          lon: resource.lon ?? null,
          hours: availability,
          services: formatServices(resource.services),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted || status !== "granted") return;
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (isMounted) {
          setUserLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        }
      } catch (error) {
        console.warn("Unable to fetch health screen location", error);
      }
    };
    fetchLocation();
    return () => { isMounted = false; };
  }, []);

  const sortedClinics = useMemo(() => {
    const withDistance = clinics.map((clinic) => {
      if (
        userLocation &&
        hasCoordinates(clinic) &&
        Number.isFinite(userLocation.latitude) &&
        Number.isFinite(userLocation.longitude)
      ) {
        return {
          ...clinic,
          distanceKm: distanceInKm(
            userLocation.latitude,
            userLocation.longitude,
            clinic.lat,
            clinic.lon,
          ),
        };
      }
      return { ...clinic, distanceKm: null };
    });
    if (!userLocation) return withDistance;
    return [...withDistance].sort((a, b) => {
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [clinics, userLocation]);

  const handleMarkerPress = useCallback((location) => {
    setSelectedId(location.id);
    const y = cardPositions.current[location.id];
    if (y != null && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y, animated: true });
    }
  }, []);

  const getDirectionsUrl = (location) => {
    if (!hasCoordinates(location)) {
      return null;
    }
    const encodedLabel = encodeURIComponent(location?.name ?? "Clinic");
    if (Platform.OS === "ios") {
      return `http://maps.apple.com/?daddr=${location.lat},${location.lon}&q=${encodedLabel}`;
    }
    if (Platform.OS === "android") {
      return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lon}&destination_place_id=&travelmode=walking`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lon}`;
  };

  const handleDirectionsPress = async (location) => {
    const url = getDirectionsUrl(location);
    if (!url) return;
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
      <Text style={styles.title}>Healthcare Clinics</Text>
      <Text style={styles.subtitle}>
        Automatically filtered from community resources
      </Text>

      <View style={styles.mapWrapper}>
        <Map locations={clinics} onMarkerPress={handleMarkerPress} />
      </View>

      <View style={styles.sortingHintWrapper}>
        <Text style={styles.sortingHint}>
          Tap a pin on the map to find its card below
        </Text>
      </View>

      {sortedClinics.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No healthcare clinics are available yet.
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
        >
          {sortedClinics.map((clinic) => {
            const directionsUrl = getDirectionsUrl(clinic);
            const disabled = !directionsUrl;
            const isSelected = selectedId === clinic.id;
            return (
              <View
                key={clinic.id}
                onLayout={(e) => {
                  cardPositions.current[clinic.id] = e.nativeEvent.layout.y;
                }}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
              >
                <Text style={styles.cardTitle}>{clinic.name}</Text>
                {clinic.organization && clinic.organization !== clinic.name ? (
                  <Text style={styles.cardOrg}>{clinic.organization}</Text>
                ) : null}
                {clinic.address ? (
                  <Text style={styles.cardDetail}>{clinic.address}</Text>
                ) : null}
                {clinic.phone ? (
                  <Text style={styles.cardDetail}>Phone: {clinic.phone}</Text>
                ) : null}
                {clinic.hours ? (
                  <Text style={styles.cardDetail}>{clinic.hours}</Text>
                ) : null}
                {clinic.distanceKm != null ? (
                  <Text style={styles.cardDistance}>
                    {clinic.distanceKm.toFixed(1)} km away
                  </Text>
                ) : null}
                {clinic.services?.length ? (
                  <View style={styles.badgeRow}>
                    {clinic.services.slice(0, 4).map((service) => (
                      <View key={`${clinic.id}-${service}`} style={styles.badge}>
                        <Text style={styles.badgeText}>{service}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <DirectionsButton
                  disabled={disabled}
                  onPress={() => handleDirectionsPress(clinic)}
                />
              </View>
            );
          })}
        </ScrollView>
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
    color: "#5C5840",
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
  sortingHintWrapper: {
    paddingHorizontal: 8,
  },
  sortingHint: {
    fontSize: 13,
    color: "#8A8570",
    textAlign: "center",
  },
  listContent: {
    gap: 16,
    paddingBottom: 24,
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
  cardOrg: {
    fontSize: 14,
    color: "#5C5840",
    fontWeight: "600",
  },
  cardDetail: {
    fontSize: 14,
    color: "#5C5840",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  badge: {
    backgroundColor: "#C8C4A0",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: "#343434",
    fontWeight: "600",
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
  cardDistance: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#7A7760",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343434",
    textAlign: "center",
  },
});
