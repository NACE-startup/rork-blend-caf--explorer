import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
} from "react-native";

import { Search, MapPin, Star } from "lucide-react-native";

import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { featuredCafes, mockCafes } from "@/mocks/cafes";
import { Cafe } from "@/types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 48;

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCafes = useMemo(() => {
    if (!searchQuery.trim()) return mockCafes;
    
    const query = searchQuery.toLowerCase();
    return mockCafes.filter(
      (cafe) =>
        cafe.name.toLowerCase().includes(query) ||
        cafe.address.toLowerCase().includes(query) ||
        cafe.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const handleCafePress = (cafeId: string) => {
    router.push(`/cafe/${cafeId}`);
  };

  const renderFeaturedItem = ({ item }: { item: Cafe }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => handleCafePress(item.id)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.image }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay}>
        <View style={styles.featuredInfo}>
          <Text style={styles.featuredName}>{item.name}</Text>
          <View style={styles.featuredMeta}>
            <View style={styles.ratingBadge}>
              <Star size={14} color={Colors.accent} fill={Colors.accent} />
              <Text style={styles.ratingText}>{item.ratings.overall.toFixed(1)}</Text>
            </View>
            <View style={styles.distanceBadge}>
              <MapPin size={12} color={Colors.cardBackground} />
              <Text style={styles.distanceText}>{item.distance}mi</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCafeCard = (cafe: Cafe) => (
    <TouchableOpacity
      key={cafe.id}
      style={styles.cafeCard}
      onPress={() => handleCafePress(cafe.id)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: cafe.image }} style={styles.cafeImage} />
      <View style={styles.cafeInfo}>
        <View style={styles.cafeHeader}>
          <Text style={styles.cafeName}>{cafe.name}</Text>
          <View style={styles.rating}>
            <Star size={16} color={Colors.accent} fill={Colors.accent} />
            <Text style={styles.ratingValue}>{cafe.ratings.overall.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.cafeAddress}>{cafe.address}</Text>
        <View style={styles.tags}>
          {cafe.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your perfect café</Text>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vibe, drink, or location"
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <FlatList
            data={featuredCafes}
            renderItem={renderFeaturedItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.featuredList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Results (${filteredCafes.length})` : "Nearby"}
          </Text>
          {filteredCafes.length > 0 ? (
            filteredCafes.map(renderCafeCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No cafés found</Text>
              <Text style={styles.emptyStateSubtext}>Try a different search term</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: {
    ...typography.h1,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: Colors.text,
    paddingVertical: 14,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.h2,
    color: Colors.text,
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  featuredList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 240,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  featuredInfo: {
    gap: 8,
  },
  featuredName: {
    ...typography.h2,
    color: Colors.cardBackground,
    fontSize: 28,
  },
  featuredMeta: {
    flexDirection: "row",
    gap: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingText: {
    ...typography.bodySmall,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  distanceText: {
    ...typography.bodySmall,
    color: Colors.cardBackground,
    fontWeight: "600" as const,
  },
  cafeCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cafeImage: {
    width: 120,
    height: 120,
  },
  cafeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  cafeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cafeName: {
    ...typography.h3,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    ...typography.bodySmall,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  cafeAddress: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    ...typography.caption,
    color: Colors.primary,
  },
  emptyState: {
    padding: 48,
    alignItems: "center",
  },
  emptyStateText: {
    ...typography.h3,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    ...typography.body,
    color: Colors.textSecondary,
  },
});
