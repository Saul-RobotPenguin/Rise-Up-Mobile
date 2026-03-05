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

const hasCoordinates = (location) =>
  Number.isFinite(location?.lat) && Number.isFinite(location?.lon);

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

export default function Map({ locations = [] }) {
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
    () => locations.filter(hasCoordinates),
    [locations]
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
