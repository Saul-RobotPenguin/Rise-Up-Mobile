import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_COORDINATE = { lat: 40.7655863, lon: -73.9544244 };
const DEFAULT_ZOOM_LEVEL = 12;
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = "(c) OpenStreetMap contributors";
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

const buildPopupHtml = (location) => {
  const lines = [];
  if (location.name) lines.push(`<strong>${location.name}</strong>`);
  if (location.address) lines.push(location.address);
  if (location.transit) lines.push(location.transit);
  if (location.hours) lines.push(`Hours: ${location.hours}`);
  if (location.phone) lines.push(`Phone: ${location.phone}`);
  return lines.join("<br />") || "Location";
};

const MARKER_HTML = `
  <svg
    width="30"
    height="42"
    viewBox="0 0 30 38"
    xmlns="http://www.w3.org/2000/svg"
    style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35)); display: block;"
  >
    <path
      d="M15 1C7.268 1 1 7.268 1 15c0 10.628 11.371 26 14 26s14-15.372 14-26C29 7.268 22.732 1 15 1z"
      fill="#d7263d"
    />
    <circle cx="15" cy="15" r="5.2" fill="#fff" />
  </svg>
`;

const DEFAULT_MARKER_ICON =
  typeof window !== "undefined"
    ? L.divIcon({
        className: "",
        html: MARKER_HTML,
        iconSize: [30, 42],
        iconAnchor: [15, 40],
        popupAnchor: [0, -30],
      })
    : null;

export default function Map({ locations = [], onMarkerPress }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const [userCenter, setUserCenter] = useState(null);
  const markerLocations = useMemo(() => {
    const filtered = locations.filter(hasCoordinates);
    if (userCenter) {
      return filterClosestLocations(filtered, userCenter);
    }
    return filtered;
  }, [locations, userCenter]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    mapRef.current = L.map(containerRef.current, {
      scrollWheelZoom: false,
    }).setView(
      [DEFAULT_COORDINATE.lat, DEFAULT_COORDINATE.lon],
      DEFAULT_ZOOM_LEVEL,
    );

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(mapRef.current);

    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      return;
    }
    let canceled = false;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (!canceled) {
          setUserCenter({ lat: coords.latitude, lon: coords.longitude });
        }
      },
      (error) => {
        console.warn("Unable to fetch browser location", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
    return () => {
      canceled = true;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();

    const targetCenter =
      userCenter ??
      markerLocations[0] ??
      DEFAULT_COORDINATE;

    mapRef.current.setView(
      [targetCenter.lat, targetCenter.lon],
      DEFAULT_ZOOM_LEVEL,
    );

    markerLocations.forEach((location) => {
      const marker = L.marker([location.lat, location.lon], {
        icon: DEFAULT_MARKER_ICON ?? undefined,
      })
        .bindPopup(buildPopupHtml(location))
        .addTo(markerLayerRef.current);

      if (onMarkerPress) {
        marker.on("click", () => onMarkerPress(location));
      }
    });
  }, [markerLocations, userCenter, onMarkerPress]);

  const showEmptyOverlay = markerLocations.length === 0 && !userCenter;

  return (
    <View style={styles.wrapper}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      {showEmptyOverlay ? (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyTitle}>Map unavailable</Text>
          <Text style={styles.emptyDetail}>
            Locations exist, but none provide coordinates to plot yet.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    minHeight: 320,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d9d9d9",
    position: "relative",
  },
  emptyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#343434",
  },
  emptyDetail: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    textAlign: "center",
  },
});
