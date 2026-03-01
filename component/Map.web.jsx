import { View, Text, StyleSheet } from "react-native";

const hasCoordinates = (location) =>
  Number.isFinite(location?.lat) && Number.isFinite(location?.lon);

const formatCoords = (location) =>
  hasCoordinates(location)
    ? `${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}`
    : "Coordinates unavailable";

export default function Map({ locations = [] }) {
  if (locations.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>No locations to display.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Locations</Text>
      {locations.map((location) => (
        <View key={location.id} style={styles.item}>
          <Text style={styles.name}>{location.name}</Text>
          {location.address ? (
            <Text style={styles.detail}>{location.address}</Text>
          ) : null}
          {location.transit ? (
            <Text style={styles.detail}>{location.transit}</Text>
          ) : null}
          {location.hours ? (
            <Text style={styles.detail}>{location.hours}</Text>
          ) : null}
          {location.phone ? (
            <Text style={styles.detail}>{location.phone}</Text>
          ) : null}
          <Text style={styles.coords}>{formatCoords(location)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 20,
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#343434",
  },
  item: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: "#555",
  },
  coords: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
});
