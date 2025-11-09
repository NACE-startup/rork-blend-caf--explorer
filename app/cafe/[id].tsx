import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

import {
  ArrowLeft,
  MapPin,
  Star,
  Coffee,
  Armchair,
  Volume2,
  Sparkles,
  Clock,
  Navigation,
  Share2,
  Heart,
  X,
} from "lucide-react-native";

import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { useApp } from "@/contexts/AppContext";
import { trpc } from "@/lib/trpc";

export default function CafeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useApp();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [ratings, setRatings] = useState({
    coffee: 0,
    seating: 0,
    noise: 0,
    environment: 0,
  });
  const [reviewText, setReviewText] = useState("");

  const cafeQuery = trpc.cafes.byId.useQuery(
    { id: id || "" },
    { enabled: !!id }
  );
  
  const reviewsQuery = trpc.reviews.byCafe.useQuery(
    { cafeId: id || "" },
    { enabled: !!id }
  );
  
  const favoriteCheckQuery = trpc.favorites.check.useQuery(
    { cafeId: id || "" },
    { enabled: !!id && !!user }
  );
  
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      favoriteCheckQuery.refetch();
    },
  });
  
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      favoriteCheckQuery.refetch();
    },
  });
  
  const createReviewMutation = trpc.reviews.create.useMutation({
    onSuccess: () => {
      reviewsQuery.refetch();
      cafeQuery.refetch();
    },
  });
  
  const createVisitMutation = trpc.visits.create.useMutation();

  const cafe = cafeQuery.data;
  const isFavorite = favoriteCheckQuery.data?.isFavorite || false;
  const cafeReviews = reviewsQuery.data?.reviews || [];

  if (cafeQuery.isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!cafe) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Café not found</Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleRatingPress = (category: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmitReview = async () => {
    if (!user || !id) return;
    
    try {
      await createReviewMutation.mutateAsync({
        cafeId: id,
        ratings: {
          coffee: ratings.coffee,
          seating: ratings.seating,
          noise: ratings.noise,
          environment: ratings.environment,
        },
        text: reviewText,
        images: [],
      });
      
      console.log("Review submitted successfully");
      setShowReviewModal(false);
      setRatings({ coffee: 0, seating: 0, noise: 0, environment: 0 });
      setReviewText("");
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!user || !id) return;
    
    try {
      if (isFavorite) {
        await removeFavoriteMutation.mutateAsync({ cafeId: id });
      } else {
        await addFavoriteMutation.mutateAsync({ cafeId: id });
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };
  
  const handleMarkVisited = async () => {
    if (!user || !id) return;
    
    try {
      await createVisitMutation.mutateAsync({ cafeId: id });
      console.log("Visit recorded");
    } catch (error) {
      console.error("Failed to record visit:", error);
    }
  };

  const renderStars = (
    category: keyof typeof ratings,
    value: number,
    interactive = false
  ) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => interactive && handleRatingPress(category, star)}
            disabled={!interactive}
          >
            <Star
              size={interactive ? 32 : 16}
              color={Colors.accent}
              fill={star <= value ? Colors.accent : "transparent"}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: cafe.image }} style={styles.headerImage} />

      <View style={styles.headerContainer}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Share2 size={24} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleToggleFavorite}
            >
              <Heart
                size={24}
                color={Colors.text}
                fill={isFavorite ? Colors.error : "transparent"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.mainInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.cafeName}>{cafe.name}</Text>
            {cafe.verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓</Text>
              </View>
            )}
          </View>

          <View style={styles.addressRow}>
            <MapPin size={16} color={Colors.textSecondary} />
            <Text style={styles.address}>{cafe.address}</Text>
          </View>

          <View style={styles.hoursRow}>
            <Clock size={16} color={Colors.textSecondary} />
            <Text style={styles.hours}>{cafe.hours || "Hours not available"}</Text>
          </View>

          <View style={styles.tags}>
            {cafe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleMarkVisited}
            >
              <Navigation size={20} color={Colors.cardBackground} />
              <Text style={styles.primaryButtonText}>Check In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setShowReviewModal(true)}
            >
              <Star size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Review</Text>
            </TouchableOpacity>
          </View>
        </View>

        {cafe.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{cafe.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings</Text>
          <View style={styles.ratingsGrid}>
            <View style={styles.ratingItem}>
              <View style={styles.ratingIcon}>
                <Coffee size={24} color={Colors.primary} />
              </View>
              <Text style={styles.ratingLabel}>Coffee</Text>
              {renderStars("coffee", Math.round(cafe.ratings.coffee))}
              <Text style={styles.ratingValue}>{cafe.ratings.coffee.toFixed(1)}</Text>
            </View>

            <View style={styles.ratingItem}>
              <View style={styles.ratingIcon}>
                <Armchair size={24} color={Colors.primary} />
              </View>
              <Text style={styles.ratingLabel}>Seating</Text>
              {renderStars("seating", Math.round(cafe.ratings.seating))}
              <Text style={styles.ratingValue}>{cafe.ratings.seating.toFixed(1)}</Text>
            </View>

            <View style={styles.ratingItem}>
              <View style={styles.ratingIcon}>
                <Volume2 size={24} color={Colors.primary} />
              </View>
              <Text style={styles.ratingLabel}>Noise</Text>
              {renderStars("noise", Math.round(cafe.ratings.noise))}
              <Text style={styles.ratingValue}>{cafe.ratings.noise.toFixed(1)}</Text>
            </View>

            <View style={styles.ratingItem}>
              <View style={styles.ratingIcon}>
                <Sparkles size={24} color={Colors.primary} />
              </View>
              <Text style={styles.ratingLabel}>Vibe</Text>
              {renderStars("environment", Math.round(cafe.ratings.environment))}
              <Text style={styles.ratingValue}>
                {cafe.ratings.environment.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.totalReviews}>
            Based on {cafe.ratings.totalReviews} reviews
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {cafeReviews.length > 0 ? (
            cafeReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Image
                    source={{ uri: review.userAvatar }}
                    style={styles.reviewAvatar}
                  />
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewUserName}>{review.userName}</Text>
                    <Text style={styles.reviewTime}>{review.createdAt}</Text>
                  </View>
                </View>
                {review.text && (
                  <Text style={styles.reviewText}>{review.text}</Text>
                )}
                <View style={styles.reviewRatings}>
                  <View style={styles.reviewRatingItem}>
                    <Text style={styles.reviewRatingLabel}>Coffee:</Text>
                    {renderStars("coffee", review.ratings.coffee)}
                  </View>
                  <View style={styles.reviewRatingItem}>
                    <Text style={styles.reviewRatingLabel}>Seating:</Text>
                    {renderStars("seating", review.ratings.seating)}
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.reviewsPlaceholder}>
              <Text style={styles.reviewsPlaceholderText}>
                Be the first to review this café
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showReviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeaderContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.ratingSection}>
              <Text style={styles.ratingCategoryTitle}>Coffee Quality</Text>
              {renderStars("coffee", ratings.coffee, true)}
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingCategoryTitle}>Seating Availability</Text>
              {renderStars("seating", ratings.seating, true)}
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingCategoryTitle}>Noise Level</Text>
              {renderStars("noise", ratings.noise, true)}
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.ratingCategoryTitle}>Environment & Vibe</Text>
              {renderStars("environment", ratings.environment, true)}
            </View>

            <View style={styles.reviewInputSection}>
              <Text style={styles.ratingCategoryTitle}>Your Review</Text>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your experience..."
                placeholderTextColor={Colors.textSecondary}
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !Object.values(ratings).every((r) => r > 0) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={!Object.values(ratings).every((r) => r > 0)}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  errorText: {
    ...typography.body,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  headerImage: {
    width: "100%",
    height: 280,
  },
  headerContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  mainInfo: {
    padding: 24,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cafeName: {
    ...typography.h1,
    color: Colors.text,
    fontSize: 28,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedText: {
    color: Colors.cardBackground,
    fontSize: 14,
    fontWeight: "700" as const,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  address: {
    ...typography.body,
    color: Colors.textSecondary,
    flex: 1,
  },
  distance: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  hoursRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  hours: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    ...typography.caption,
    color: Colors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    ...typography.button,
    color: Colors.cardBackground,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.background,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    ...typography.button,
    color: Colors.primary,
  },
  section: {
    padding: 24,
    backgroundColor: Colors.cardBackground,
    marginTop: 8,
  },
  sectionTitle: {
    ...typography.h2,
    color: Colors.text,
    marginBottom: 16,
  },
  description: {
    ...typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  ratingsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  ratingItem: {
    width: "47%",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    gap: 8,
  },
  ratingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  ratingLabel: {
    ...typography.bodySmall,
    color: Colors.text,
    fontWeight: "600" as const,
  },
  stars: {
    flexDirection: "row",
    gap: 4,
  },
  ratingValue: {
    ...typography.h3,
    color: Colors.text,
  },
  totalReviews: {
    ...typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  reviewsPlaceholder: {
    padding: 32,
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  reviewsPlaceholderText: {
    ...typography.body,
    color: Colors.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeaderContainer: {
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  modalTitle: {
    ...typography.h2,
    color: Colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  ratingSection: {
    marginBottom: 32,
  },
  ratingCategoryTitle: {
    ...typography.h3,
    color: Colors.text,
    marginBottom: 12,
  },
  reviewInputSection: {
    marginBottom: 24,
  },
  reviewInput: {
    ...typography.body,
    color: Colors.text,
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    height: 120,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalFooter: {
    padding: 24,
    paddingBottom: 40,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    ...typography.button,
    color: Colors.cardBackground,
  },
  reviewCard: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    ...typography.body,
    color: Colors.text,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  reviewTime: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
  reviewText: {
    ...typography.body,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  reviewRatings: {
    flexDirection: "row",
    gap: 16,
  },
  reviewRatingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  reviewRatingLabel: {
    ...typography.caption,
    color: Colors.textSecondary,
  },
});
