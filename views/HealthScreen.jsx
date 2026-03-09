import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import Map from "../component/Map";

const loadCommunityResources = () => {
  try {
    // Metro supports requiring JSON at runtime; fallback guards bundle reloads
    // where the JSON may be missing or malformed.
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
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

const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function HealthScreen() {
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

  const renderClinic = useCallback(({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.organization && item.organization !== item.name ? (
          <Text style={styles.cardSubtitle}>{item.organization}</Text>
        ) : null}
        {item.address ? (
          <Text style={styles.cardDetail}>{item.address}</Text>
        ) : null}
        {item.phone ? (
          <Text style={styles.cardDetail}>Phone: {item.phone}</Text>
        ) : null}
        {item.hours ? (
          <Text style={styles.cardDetail}>{item.hours}</Text>
        ) : null}
        {item.services?.length ? (
          <View style={styles.badgeRow}>
            {item.services.slice(0, 4).map((service) => (
              <View key={`${item.id}-${service}`} style={styles.badge}>
                <Text style={styles.badgeText}>{service}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={clinics}
        keyExtractor={(item) => item.id}
        renderItem={renderClinic}
        contentContainerStyle={
          clinics.length ? styles.listContent : styles.emptyContent
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Healthcare Clinics</Text>
            <Text style={styles.subtitle}>
              Automatically filtered from community resources
            </Text>
            <Map locations={clinics} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No healthcare clinics are available yet.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  listContent: {
    paddingBottom: 48,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFF",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#2F6FED",
    fontWeight: "600",
  },
  cardDetail: {
    fontSize: 14,
    color: "#333",
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  badge: {
    backgroundColor: "#E7F0FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: "#2F6FED",
    fontWeight: "600",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    textAlign: "center",
  },
});
