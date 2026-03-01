import { View, Text, StyleSheet, ScrollView } from "react-native";
import Map from "../component/Map";
import dropInData from "../data/dropInCenters.json";

const centers = Array.isArray(dropInData?.centers) ? dropInData.centers : [];

const groupByBorough = (items) =>
  items.reduce((acc, item) => {
    const key = item.borough || "Other";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});

const boroughGroups = groupByBorough(centers);
const boroughOrder = ["Bronx", "Brooklyn", "Manhattan", "Queens", "Staten Island"];
const extraBoroughs = Object.keys(boroughGroups).filter(
  (key) => !boroughOrder.includes(key)
);
const orderedBoroughs = [...boroughOrder, ...extraBoroughs];

export default function ShelterScreen() {
  const hasLocations = centers.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NYC Drop-In Centers</Text>
      <Text style={styles.subtitle}>
        Information sourced directly from NYC311. Drop-in centers operate 24/7, including holidays.
      </Text>
      {!hasLocations ? (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>
            Drop-in center data is unavailable right now. Please run npm run sync:dropins to refresh the cache.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.mapWrapper}>
            <Map locations={centers} />
          </View>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {orderedBoroughs.map((borough) => {
              const boroughCenters = boroughGroups[borough];
              if (!boroughCenters || boroughCenters.length === 0) {
                return null;
              }
              return (
                <View key={borough} style={styles.boroughSection}>
                  <Text style={styles.boroughHeading}>{borough}</Text>
                  {boroughCenters.map((location) => (
                    <View key={location.id} style={styles.card}>
                      <Text style={styles.cardTitle}>{location.name}</Text>
                      {location.address ? (
                        <Text style={styles.cardDetail}>{location.address}</Text>
                      ) : null}
                      {location.transit ? (
                        <Text style={styles.cardDetail}>{location.transit}</Text>
                      ) : null}
                      {location.hours ? (
                        <Text style={styles.cardDetail}>{location.hours}</Text>
                      ) : null}
                    </View>
                  ))}
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
    backgroundColor: "#F7F7F2",
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
    minHeight: 260,
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
  boroughSection: {
    gap: 10,
  },
  boroughHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  card: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  cardDetail: {
    fontSize: 14,
    color: "#555",
  },
});
