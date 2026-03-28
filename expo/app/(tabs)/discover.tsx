import { useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Heart, MessageCircle } from "lucide-react-native";

import Colors from "@/constants/colors";
import { typography } from "@/constants/typography";
import { mockPosts } from "@/mocks/cafes";
import { Post } from "@/types";

const { height } = Dimensions.get("window");

export default function DiscoverScreen() {
  const router = useRouter();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCafePress = (cafeId: string) => {
    router.push(`/cafe/${cafeId}`);
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postContainer}>
      <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />

      <View style={styles.postOverlay}>
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
            activeOpacity={0.8}
          >
            <Heart
              size={32}
              color={Colors.cardBackground}
              fill={likedPosts.has(item.id) ? Colors.error : "transparent"}
            />
            <Text style={styles.actionText}>
              {item.likes + (likedPosts.has(item.id) ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <MessageCircle size={32} color={Colors.cardBackground} />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postInfo}>
          <View style={styles.userInfo}>
            <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
            <View style={styles.userText}>
              <Text style={styles.userName}>{item.userName}</Text>
              <TouchableOpacity onPress={() => handleCafePress(item.cafeId)}>
                <Text style={styles.cafeName}>{item.cafeName}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.text,
  },
  postContainer: {
    width: "100%",
    height: height,
    position: "relative",
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  postOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 100,
  },
  postActions: {
    position: "absolute",
    right: 20,
    bottom: 200,
    alignItems: "center",
    gap: 24,
  },
  actionButton: {
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    ...typography.caption,
    color: Colors.cardBackground,
    fontWeight: "600" as const,
  },
  postInfo: {
    gap: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  userText: {
    flex: 1,
    gap: 2,
  },
  userName: {
    ...typography.body,
    color: Colors.cardBackground,
    fontWeight: "600" as const,
  },
  cafeName: {
    ...typography.bodySmall,
    color: Colors.cardBackground,
    opacity: 0.8,
  },
  caption: {
    ...typography.body,
    color: Colors.cardBackground,
    lineHeight: 22,
  },
});
