import { View, Text, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

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
  const markerLocations = locations.filter(hasCoordinates);

  if (markerLocations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          Locations are available, but none include map coordinates yet.
        </Text>
      </View>
    );
  }

  const initialLocation = {
    latitude: markerLocations[0].lat,
    longitude: markerLocations[0].lon,
  };

  return (
    <MapView
      style={styles.map}
      initialRegion={{ ...DEFAULT_REGION, ...initialLocation }}
    >
      {markerLocations.map((location) => (
        <Marker
          key={location.id}
          coordinate={{
            latitude: location.lat,
            longitude: location.lon,
          }}
          title={location.name}
          description={buildDescription(location)}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#343434",
  },
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
