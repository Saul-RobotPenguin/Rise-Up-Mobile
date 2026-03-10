import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

const DEFAULT_REGION = {
  latitude: 40.7655863,
  longitude: -73.9544244,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};
const MAX_MARKERS = 10;

const hasCoordinates = (location) =>
  Number.isFinite(location?.lat) && Number.isFinite(location?.lon);

const toRadians = (degrees) => (degrees * Math.PI) / 180;
const extractLatitude = (coordinate) =>
  coordinate?.latitude ?? coordinate?.lat ?? null;
const extractLongitude = (coordinate) =>
  coordinate?.longitude ?? coordinate?.lon ?? null;

const metersBetween = (origin, destination) => {
  const originLat = extractLatitude(origin);
  const originLon = extractLongitude(origin);
  const destLat = extractLatitude(destination);
  const destLon = extractLongitude(destination);
  if (
    originLat == null ||
    originLon == null ||
    destLat == null ||
    destLon == null
  ) {
    return Number.POSITIVE_INFINITY;
  }
  const R = 6371000;
  const dLat = toRadians(destLat - originLat);
  const dLon = toRadians(destLon - originLon);
  const lat1 = toRadians(originLat);
  const lat2 = toRadians(destLat);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) *
      Math.sin(dLon / 2) *
      Math.cos(lat1) *
      Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const filterClosestLocations = (locations, origin) => {
  if (!origin) return locations;
  return locations
    .map((location) => {
      const destination = { latitude: location.lat, longitude: location.lon };
      return {
        location,
        distance: metersBetween(origin, destination),
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_MARKERS)
    .map((entry) => entry.location);
};

const buildDescription = (location) => {
  if (location?.address && location?.transit) {
    return `${location.address}\n${location.transit}`;
  }
  return (
    location?.address ||
    location?.transit ||
    location?.hours ||
    location?.phone ||
    ""
  );
};

export default function Map({ locations = [], onMarkerPress }) {
  const [userCoordinate, setUserCoordinate] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (isMounted) {
          setUserCoordinate({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });
        }
      } catch (error) {
        console.warn("Unable to fetch user location", error);
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const markerLocations = useMemo(
    () => {
      const filtered = locations.filter(hasCoordinates);
      if (userCoordinate) {
        return filterClosestLocations(filtered, userCoordinate);
      }
      return filtered;
    },
    [locations, userCoordinate]
  );

  if (markerLocations.length === 0 && !userCoordinate) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Locations are available, but none include map coordinates yet.
        </Text>
      </View>
    );
  }

  const fallbackRegion = markerLocations.length
    ? {
        ...DEFAULT_REGION,
        latitude: markerLocations[0].lat,
        longitude: markerLocations[0].lon,
      }
    : DEFAULT_REGION;

  const initialRegion = userCoordinate
    ? { ...DEFAULT_REGION, ...userCoordinate }
    : fallbackRegion;

  return (
    <View style={styles.wrapper}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation
        followsUserLocation={false}
      >
        {markerLocations.map((location) => {
          const id =
            location.id ??
            `${location.lat.toFixed(3)}-${location.lon.toFixed(3)}`;

          return (
            <Marker
              key={id}
              coordinate={{
                latitude: location.lat,
                longitude: location.lon,
              }}
              title={location.name}
              description={buildDescription(location)}
              onPress={() => onMarkerPress?.(location)}
            />
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 320,
    borderRadius: 16,
    overflow: "hidden",
  },
  emptyContainer: {
    minHeight: 200,
    borderRadius: 12,
    backgroundColor: "#F5FCFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343434",
    textAlign: "center",
  },
});
