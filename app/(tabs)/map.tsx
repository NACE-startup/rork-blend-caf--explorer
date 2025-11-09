import { useRouter } from "expo-router";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import {
  MapPin,
  Star,
  SlidersHorizontal,
  Navigation,
  X,
  Search,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { GOOGLE_MAPS_API_KEY, MAP_STYLE, DEFAULT_LOCATION } from "@/constants/maps";
import { trpc } from "@/lib/trpc";

interface CafeMarker {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  image: string;
  tags: string[];
  ratings: {
    overall: number;
    totalReviews: number;
  };
}

const VIBES = ["Study", "Work", "Chill", "Social", "Quiet"];
const AMENITIES = ["WiFi", "Outlets", "Pastries", "Seating", "Coffee"];

const generateMapHTML = () => {
  const mapStyleJSON = JSON.stringify(MAP_STYLE);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { height: 100%; width: 100%; overflow: hidden; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places"></script>
  <script>
    let map;
    let markers = [];
    let userMarker = null;
    let selectedMarkerId = null;
    
    const mapStyle = ${mapStyleJSON};
    
    function initMap() {
      console.log('Initializing Google Map...');
      try {
        if (!google || !google.maps) {
          console.error('Google Maps JavaScript API not loaded');
          return;
        }
        
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: { lat: ${DEFAULT_LOCATION.latitude}, lng: ${DEFAULT_LOCATION.longitude} },
          styles: mapStyle,
          disableDefaultUI: true,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy'
        });
        console.log('Google Map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
    
    function clearMarkers() {
      markers.forEach(m => m.setMap(null));
      markers = [];
    }
    
    function setUserLocation(lat, lng) {
      if (userMarker) {
        userMarker.setMap(null);
      }
      
      if (lat && lng) {
        userMarker = new google.maps.Marker({
          position: { lat, lng },
          map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: '#8B6E4E',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
            scale: 10
          },
          zIndex: 9999
        });
        
        map.setCenter({ lat, lng });
      }
    }
    
    function setCafes(cafes, selectedId) {
      console.log('Setting cafes on map:', cafes.length);
      clearMarkers();
      selectedMarkerId = selectedId;
      
      cafes.forEach(cafe => {
        const isSelected = cafe.id === selectedId;
        
        const marker = new google.maps.Marker({
          position: { lat: cafe.latitude, lng: cafe.longitude },
          map,
          title: cafe.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: isSelected ? '#8B6E4E' : '#FFFFFF',
            fillOpacity: 1,
            strokeColor: isSelected ? '#FFFFFF' : '#8B6E4E',
            strokeWeight: 3,
            scale: isSelected ? 12 : 10
          },
          zIndex: isSelected ? 1000 : 1
        });
        
        marker.addListener('click', function() {
          console.log('Marker clicked:', cafe.name);
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markerClick',
              cafeId: cafe.id
            }));
          }
        });
        
        markers.push(marker);
      });
      
      console.log('Markers added:', markers.length);
    }
    
    function centerOnLocation(lat, lng, zoom) {
      if (map && lat && lng) {
        map.setCenter({ lat, lng });
        if (zoom) {
          map.setZoom(zoom);
        }
      }
    }
    
    window.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'updateLocation') {
          setUserLocation(data.latitude, data.longitude);
        } else if (data.type === 'updateCafes') {
          setCafes(data.cafes, data.selectedId);
        } else if (data.type === 'centerOn') {
          centerOnLocation(data.latitude, data.longitude, data.zoom);
        }
      } catch (e) {
        console.error('Error processing message:', e);
      }
    });
    
    document.addEventListener('message', function(event) {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'updateLocation') {
          setUserLocation(data.latitude, data.longitude);
        } else if (data.type === 'updateCafes') {
          setCafes(data.cafes, data.selectedId);
        } else if (data.type === 'centerOn') {
          centerOnLocation(data.latitude, data.longitude, data.zoom);
        }
      } catch (e) {
        console.error('Error processing message:', e);
      }
    });
    
    initMap();
    
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'mapReady'
    }));
  </script>
</body>
</html>
  `;
};

export default function MapScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const insets = useSafeAreaInsets();
  
  const [selectedCafe, setSelectedCafe] = useState<CafeMarker | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [radius, setRadius] = useState(5);
  const [selectedVibes, setSelectedVibes] = useState<Set<string>>(new Set());
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoadingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          
          setUserLocation(newLocation);
        } else {
          Alert.alert(
            "Location Permission Required",
            "Blend needs your location to show nearby cafés. You can enable it in Settings.",
            [{ text: "OK" }]
          );
          setUserLocation({
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
          });
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setUserLocation({
          latitude: DEFAULT_LOCATION.latitude,
          longitude: DEFAULT_LOCATION.longitude,
        });
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (mapReady && userLocation && webViewRef.current) {
      const message = JSON.stringify({
        type: 'updateLocation',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      });
      
      if (Platform.OS === 'web') {
        webViewRef.current.injectJavaScript(`
          window.postMessage(${message}, '*');
        `);
      } else {
        webViewRef.current.postMessage(message);
      }
    }
  }, [mapReady, userLocation]);

  const selectedTags = useMemo(() => {
    return [...Array.from(selectedVibes), ...Array.from(selectedAmenities)];
  }, [selectedVibes, selectedAmenities]);

  const nearbyCafesQuery = trpc.cafes.nearby.useQuery(
    {
      latitude: userLocation?.latitude ?? DEFAULT_LOCATION.latitude,
      longitude: userLocation?.longitude ?? DEFAULT_LOCATION.longitude,
      radiusMiles: radius,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      limit: 50,
    },
    {
      enabled: !isLoadingLocation,
      refetchOnWindowFocus: false,
    }
  );

  const cafes: CafeMarker[] = useMemo(() => {
    if (!nearbyCafesQuery.data) return [];
    
    let filtered = nearbyCafesQuery.data;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cafe) =>
          cafe.name.toLowerCase().includes(query) ||
          cafe.address.toLowerCase().includes(query) ||
          cafe.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [nearbyCafesQuery.data, searchQuery]);

  useEffect(() => {
    if (mapReady && webViewRef.current) {
      const message = JSON.stringify({
        type: 'updateCafes',
        cafes: cafes.map(c => ({
          id: c.id,
          name: c.name,
          latitude: c.latitude,
          longitude: c.longitude,
        })),
        selectedId: selectedCafe?.id || null,
      });
      
      if (Platform.OS === 'web') {
        webViewRef.current.injectJavaScript(`
          window.postMessage(${message}, '*');
        `);
      } else {
        webViewRef.current.postMessage(message);
      }
    }
  }, [mapReady, cafes, selectedCafe]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        console.log('Map is ready');
        setMapReady(true);
      } else if (data.type === 'markerClick') {
        const cafe = cafes.find(c => c.id === data.cafeId);
        if (cafe) {
          setSelectedCafe(cafe);
        }
      }
    } catch (error) {
      console.error('Error handling WebView message:', error);
    }
  };

  const handleViewCafe = () => {
    if (selectedCafe) {
      router.push(`/cafe/${selectedCafe.id}`);
    }
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vibe)) {
        newSet.delete(vibe);
      } else {
        newSet.add(vibe);
      }
      return newSet;
    });
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(amenity)) {
        newSet.delete(amenity);
      } else {
        newSet.add(amenity);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setRadius(5);
    setSelectedVibes(new Set());
    setSelectedAmenities(new Set());
  };

  const recenterMap = () => {
    if (userLocation && webViewRef.current && mapReady) {
      const message = JSON.stringify({
        type: 'centerOn',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        zoom: 14,
      });
      
      if (Platform.OS === 'web') {
        webViewRef.current.injectJavaScript(`
          window.postMessage(${message}, '*');
        `);
      } else {
        webViewRef.current.postMessage(message);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleWebViewMessage}
        originWhitelist={['*']}
        scrollEnabled={false}
        bounces={false}
      />

      {showSearch && (
        <View style={[styles.searchContainer, { top: 80 }]}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search cafés by name, area, or vibe..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setShowSearch(false);
              }}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!showSearch && (
        <View style={[styles.topControls, { top: 80 }]}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(true)}
          >
            <Search size={20} color={Colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <SlidersHorizontal size={20} color={Colors.text} />
            {(selectedVibes.size > 0 || selectedAmenities.size > 0) && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {selectedVibes.size + selectedAmenities.size}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.recenterButton, { bottom: selectedCafe ? 220 : 120 }]}
        onPress={recenterMap}
      >
        <Navigation size={20} color={Colors.primary} />
      </TouchableOpacity>

      {nearbyCafesQuery.isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading nearby cafés...</Text>
          </View>
        </View>
      )}

      {!nearbyCafesQuery.isLoading && cafes.length === 0 && (
        <View style={styles.noCafesCard}>
          <MapPin size={32} color={Colors.textSecondary} />
          <Text style={styles.noCafesText}>No cafés found</Text>
          <Text style={styles.noCafesSubtext}>
            Try increasing your radius or adjusting filters
          </Text>
        </View>
      )}

      {selectedCafe && (
        <View style={styles.cafeModal}>
          <TouchableOpacity
            style={styles.cafeCard}
            onPress={handleViewCafe}
            activeOpacity={0.9}
          >
            <View style={styles.cafeInfo}>
              <View style={styles.cafeHeader}>
                <View style={styles.cafeTitle}>
                  <Text style={styles.cafeName} numberOfLines={1}>
                    {selectedCafe.name}
                  </Text>
                  <View style={styles.rating}>
                    <Star size={16} color={Colors.accent} fill={Colors.accent} />
                    <Text style={styles.ratingText}>
                      {selectedCafe.ratings.overall.toFixed(1)}
                    </Text>
                    <Text style={styles.reviewCount}>
                      ({selectedCafe.ratings.totalReviews})
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedCafe(null)}
                  style={styles.closeButton}
                >
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.cafeDistance}>
                {selectedCafe.distance.toFixed(1)} mi away
              </Text>
              <View style={styles.tags}>
                {selectedCafe.tags.slice(0, 3).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Radius</Text>
              <View style={styles.radiusOptions}>
                {[1, 3, 5, 10].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.radiusOption,
                      radius === r && styles.radiusOptionActive,
                    ]}
                    onPress={() => setRadius(r)}
                  >
                    <Text
                      style={[
                        styles.radiusOptionText,
                        radius === r && styles.radiusOptionTextActive,
                      ]}
                    >
                      {r} mi
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Vibe</Text>
              <View style={styles.checkboxGroup}>
                {VIBES.map((vibe) => (
                  <TouchableOpacity
                    key={vibe}
                    style={styles.checkbox}
                    onPress={() => toggleVibe(vibe)}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        selectedVibes.has(vibe) && styles.checkboxBoxChecked,
                      ]}
                    >
                      {selectedVibes.has(vibe) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{vibe}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Amenities</Text>
              <View style={styles.checkboxGroup}>
                {AMENITIES.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={styles.checkbox}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        selectedAmenities.has(amenity) &&
                          styles.checkboxBoxChecked,
                      ]}
                    >
                      {selectedAmenities.has(amenity) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>{amenity}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>
                Show {cafes.length} Cafés
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  map: {
    flex: 1,
  },
  topControls: {
    position: "absolute",
    top: 80,
    right: 24,
    gap: 12,
  },
  searchButton: {
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButton: {
    backgroundColor: Colors.cardBackground,
    padding: 12,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: {
    ...typography.caption,
    color: Colors.cardBackground,
    fontSize: 11,
    fontWeight: "700" as const,
  },
  searchContainer: {
    position: "absolute",
    top: 80,
    left: 24,
    right: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: Colors.text,
  },
  recenterButton: {
    position: "absolute",
    right: 24,
    backgroundColor: Colors.cardBackground,
    padding: 14,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(245, 241, 232, 0.8)",
  },
  loadingCard: {
    backgroundColor: Colors.cardBackground,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: {
    ...typography.body,
    color: Colors.text,
  },
  noCafesCard: {
    position: "absolute",
    top: "50%",
    left: 24,
    right: 24,
    backgroundColor: Colors.cardBackground,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  noCafesText: {
    ...typography.h3,
    color: Colors.text,
  },
  noCafesSubtext: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  cafeModal: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  cafeCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  cafeInfo: {
    padding: 16,
  },
  cafeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cafeTitle: {
    flex: 1,
    gap: 4,
  },
  cafeName: {
    ...typography.h3,
    color: Colors.text,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    ...typography.bodySmall,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  reviewCount: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  closeButton: {
    padding: 4,
  },
  cafeDistance: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    ...typography.caption,
    color: Colors.primary,
  },
  filterModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTitle: {
    ...typography.h2,
    color: Colors.text,
  },
  filterContent: {
    flex: 1,
    padding: 24,
  },
  filterSection: {
    marginBottom: 32,
  },
  filterLabel: {
    ...typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  radiusOptions: {
    flexDirection: "row",
    gap: 12,
  },
  radiusOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
  },
  radiusOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radiusOptionText: {
    ...typography.button,
    color: Colors.text,
    fontSize: 14,
  },
  radiusOptionTextActive: {
    color: Colors.cardBackground,
  },
  checkboxGroup: {
    gap: 16,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.cardBackground,
    fontSize: 16,
    fontWeight: "700" as const,
  },
  checkboxLabel: {
    ...typography.body,
    color: Colors.text,
  },
  filterFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
  },
  clearButtonText: {
    ...typography.button,
    color: Colors.text,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  applyButtonText: {
    ...typography.button,
    color: Colors.cardBackground,
  },
});
