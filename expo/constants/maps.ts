export const GOOGLE_MAPS_API_KEY = "AlzaSyC5n1xDsRgo2N8sl4kAg7wofjAff8gSE2U";

export const MAP_STYLE = [
  {
    featureType: "all",
    elementType: "geometry",
    stylers: [{ color: "#F5F1E8" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6B5E4C" }],
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#F5F1E8" }, { lightness: 16 }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#F5F1E8" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#D4C4A8" }, { lightness: 14 }, { weight: 1.4 }],
  },
  {
    featureType: "landscape",
    elementType: "all",
    stylers: [{ color: "#F5F1E8" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#E8DCC8" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#FFFFFF" }, { lightness: 18 }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#D4C4A8" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#D4C4A8" }, { lightness: 29 }, { weight: 0.2 }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#E8DCC8" }],
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#F5F1E8" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#E8DCC8" }],
  },
  {
    featureType: "water",
    elementType: "all",
    stylers: [{ color: "#C8DDE5" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#C8DDE5" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6B8E9E" }],
  },
];

export const DEFAULT_LOCATION = {
  latitude: 34.0522,
  longitude: -118.2437,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};
