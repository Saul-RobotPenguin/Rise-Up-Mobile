import { View, Text, Button, StyleSheet } from "react-native";
import MapView from "react-native-maps";
import { Marker } from "react-native-maps";

export default function Map(data) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 40.7655863,
        longitude: -73.9544244,
        latitudeDelta: 0.0,
        longitudeDelta: 0.0,
      }}
    >
      <Marker
        coordinate={{
          latitude: data.HealthLocations[0].lat,
          longitude: data.HealthLocations[0].lon,
        }}
        title={data.HealthLocations[0].name}
        description={data.HealthLocations[0].phone}
      />
      {console.log(data)}
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
  map: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
