import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { Settings, Award, MapPin, Star } from "lucide-react-native";

import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { useApp } from "@/contexts/AppContext";
import { trpc } from "@/lib/trpc";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useApp();
  
  const visitsQuery = trpc.visits.byUser.useQuery(
    { limit: 100, offset: 0 },
    { enabled: !!user }
  );
  
  const reviewsQuery = trpc.reviews.byUser.useQuery(
    { userId: user?.id || "", limit: 100, offset: 0 },
    { enabled: !!user }
  );
  
  const favoritesQuery = trpc.favorites.list.useQuery(undefined, {
    enabled: !!user,
  });
  
  const visits = visitsQuery.data?.visits || [];
  const reviews = reviewsQuery.data?.reviews || [];
  const favorites = (favoritesQuery.data || []).filter(cafe => cafe !== null);
  
  const uniqueVisitedCafes = useMemo(() => {
    const cafeIds = new Set(visits.map(v => v.cafeId));
    return cafeIds.size;
  }, [visits]);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const isLoading = visitsQuery.isLoading || reviewsQuery.isLoading || favoritesQuery.isLoading;
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.avatar || "https://i.pravatar.cc/150?img=5" }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || "Guest"}</Text>
          <Text style={styles.email}>{user?.email || "Not logged in"}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <MapPin size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{uniqueVisitedCafes}</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
            <View style={styles.statBox}>
              <Star size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{reviews.length}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statBox}>
              <Award size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{favorites.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <View style={styles.badgeIcon}>
                <Text style={styles.badgeEmoji}>☕</Text>
              </View>
              <Text style={styles.badgeName}>Café Explorer</Text>
            </View>
            <View style={styles.badge}>
              <View style={styles.badgeIcon}>
                <Text style={styles.badgeEmoji}>⭐</Text>
              </View>
              <Text style={styles.badgeName}>Top Reviewer</Text>
            </View>
            <View style={styles.badge}>
              <View style={styles.badgeIcon}>
                <Text style={styles.badgeEmoji}>🗺️</Text>
              </View>
              <Text style={styles.badgeName}>Local Guide</Text>
            </View>
            <View style={styles.badge}>
              <View style={styles.badgeIcon}>
                <Text style={styles.badgeEmoji}>📸</Text>
              </View>
              <Text style={styles.badgeName}>Photographer</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Preferences</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Privacy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Help & Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {!isLoading && favorites.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorite Cafés</Text>
            <View style={styles.favoritesContainer}>
              {favorites.map((fav) => (
                <TouchableOpacity
                  key={fav.id}
                  style={styles.favoriteCard}
                  onPress={() => router.push(`/cafe/${fav.cafeId}`)}
                >
                  <Image source={{ uri: fav.cafeImage }} style={styles.favoriteImage} />
                  <Text style={styles.favoriteName}>{fav.cafeName}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    ...typography.h1,
    color: Colors.text,
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  name: {
    ...typography.h2,
    color: Colors.text,
    marginBottom: 4,
  },
  email: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statBox: {
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    ...typography.h2,
    color: Colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    ...typography.h3,
    color: Colors.text,
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  badge: {
    alignItems: "center",
    gap: 8,
    width: "22%",
  },
  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  badgeEmoji: {
    fontSize: 32,
  },
  badgeName: {
    ...typography.caption,
    color: Colors.text,
    textAlign: "center",
  },
  menuContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuText: {
    ...typography.body,
    color: Colors.text,
  },
  logoutButton: {
    marginHorizontal: 24,
    marginTop: 8,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    ...typography.button,
    color: Colors.error,
  },
  favoritesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  favoriteCard: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: Colors.cardBackground,
  },
  favoriteImage: {
    width: "100%",
    height: "80%",
  },
  favoriteName: {
    ...typography.caption,
    color: Colors.text,
    padding: 6,
    textAlign: "center",
  },
});
