# Blend Backend API Documentation

## Authentication

### Signup
```typescript
trpc.auth.signup.useMutation({
  name: string,
  email: string,
  password: string,
  isBusiness?: boolean
})
// Returns: { user, token, expiresAt }
```

### Login
```typescript
trpc.auth.login.useMutation({
  email: string,
  password: string
})
// Returns: { user, token, expiresAt }
```

### Get Current User
```typescript
trpc.auth.me.useQuery()
// Returns: User object
// Requires: Authentication
```

### Logout
```typescript
trpc.auth.logout.useMutation()
// Returns: { success: true }
// Requires: Authentication
```

## Cafés

### List All Cafés
```typescript
trpc.cafes.list.useQuery({
  limit?: number (1-100, default: 20),
  offset?: number (default: 0)
})
// Returns: { cafes, total, hasMore }
```

### Get Café by ID
```typescript
trpc.cafes.byId.useQuery({ id: string })
// Returns: Café with ratings
```

### Find Nearby Cafés
```typescript
trpc.cafes.nearby.useQuery({
  latitude: number,
  longitude: number,
  radiusMiles?: number (1-50, default: 10),
  tags?: string[],
  limit?: number (1-100, default: 20)
})
// Returns: Cafés with distance and ratings
```

### Search Cafés
```typescript
trpc.cafes.search.useQuery({
  query: string,
  tags?: string[],
  limit?: number (1-100, default: 20)
})
// Returns: Matching cafés with ratings
```

### Get Busy Times
```typescript
trpc.cafes.busyTimes.useQuery({ cafeId: string })
// Returns: { cafeId, busyTimes: Record<day, Record<hour, level>> }
```

### Get Visitor Count
```typescript
trpc.cafes.visitorCount.useQuery({
  cafeId: string,
  timeRange?: "today" | "week" | "month" | "all" (default: "all")
})
// Returns: { cafeId, totalVisits, uniqueVisitors, timeRange }
```

## Reviews

### Create Review
```typescript
trpc.reviews.create.useMutation({
  cafeId: string,
  ratings: {
    coffee: number (1-5),
    seating: number (1-5),
    noise: number (1-5),
    environment: number (1-5)
  },
  text: string (min 10 chars),
  images?: string[]
})
// Returns: Review object
// Requires: Authentication
```

### Get Reviews by Café
```typescript
trpc.reviews.byCafe.useQuery({
  cafeId: string,
  limit?: number (1-100, default: 20),
  offset?: number (default: 0)
})
// Returns: { reviews, total, hasMore }
```

### Get Reviews by User
```typescript
trpc.reviews.byUser.useQuery({
  userId: string,
  limit?: number (1-100, default: 20),
  offset?: number (default: 0)
})
// Returns: { reviews, total, hasMore }
```

## Visits

### Record Visit
```typescript
trpc.visits.create.useMutation({
  cafeId: string,
  visitTime?: string (ISO format, default: now)
})
// Returns: Visit object
// Requires: Authentication
// Side effect: Updates busy times
```

### Get User's Visits
```typescript
trpc.visits.byUser.useQuery({
  limit?: number (1-100, default: 20),
  offset?: number (default: 0)
})
// Returns: { visits, total, hasMore }
// Requires: Authentication
```

## Favorites

### Add to Favorites
```typescript
trpc.favorites.add.useMutation({ cafeId: string })
// Returns: Favorite object
// Requires: Authentication
```

### Remove from Favorites
```typescript
trpc.favorites.remove.useMutation({ cafeId: string })
// Returns: { success: true }
// Requires: Authentication
```

### List Favorites
```typescript
trpc.favorites.list.useQuery()
// Returns: Array of favorite cafés with details
// Requires: Authentication
```

### Check if Café is Favorite
```typescript
trpc.favorites.check.useQuery({ cafeId: string })
// Returns: { isFavorite: boolean }
// Requires: Authentication
```

## Promotions (Business Features)

### Create Promotion
```typescript
trpc.promotions.create.useMutation({
  cafeId: string,
  title: string (min 3 chars),
  description: string (min 10 chars),
  image?: string,
  startDate: string (ISO format),
  endDate: string (ISO format)
})
// Returns: Promotion object
// Requires: Business account authentication
```

### Get Promotions by Café
```typescript
trpc.promotions.byCafe.useQuery({ cafeId: string })
// Returns: Array of active promotions
```

### Get Business Promotions
```typescript
trpc.promotions.byBusiness.useQuery()
// Returns: Array of promotions for business's cafés
// Requires: Business account authentication
```

## Posts (Discover Feed)

### Create Post
```typescript
trpc.posts.create.useMutation({
  cafeId: string,
  mediaUrl: string,
  mediaType: "image" | "video",
  caption: string (1-500 chars)
})
// Returns: Post object
// Requires: Authentication
```

### Get Discover Feed
```typescript
trpc.posts.feed.useQuery({
  limit?: number (1-100, default: 20),
  offset?: number (default: 0)
})
// Returns: { posts, total, hasMore }
```

## Analytics (Business Features)

### Get Café Statistics
```typescript
trpc.analytics.cafeStats.useQuery({ cafeId: string })
// Returns: {
//   cafeId, cafeName, totalVisits, totalReviews,
//   averageRating, visitsThisWeek, visitsThisMonth,
//   reviewsThisWeek, reviewsThisMonth, activePromotions, totalPosts
// }
// Requires: Business account authentication (owner only)
```

## Usage Examples

### Example: Login and Fetch Nearby Cafés
```typescript
import { trpc } from "@/lib/trpc";
import { useApp } from "@/contexts/AppContext";

function MyComponent() {
  const { login } = useApp();
  
  // Login
  const handleLogin = async () => {
    await login("user@example.com", "password123");
  };
  
  // Fetch nearby cafés
  const nearbyCafes = trpc.cafes.nearby.useQuery({
    latitude: 37.7749,
    longitude: -122.4194,
    radiusMiles: 5,
    tags: ["study", "quiet"]
  });
  
  return (
    <View>
      {nearbyCafes.data?.map(cafe => (
        <Text key={cafe.id}>{cafe.name} - {cafe.distance} miles</Text>
      ))}
    </View>
  );
}
```

### Example: Create Review
```typescript
function CafeScreen({ cafeId }) {
  const createReview = trpc.reviews.create.useMutation();
  
  const handleSubmitReview = async () => {
    await createReview.mutateAsync({
      cafeId,
      ratings: {
        coffee: 5,
        seating: 4,
        noise: 5,
        environment: 5
      },
      text: "Amazing coffee and great atmosphere!",
      images: []
    });
  };
  
  return <Button onPress={handleSubmitReview}>Submit Review</Button>;
}
```

### Example: Business Analytics
```typescript
function BusinessDashboard() {
  const stats = trpc.analytics.cafeStats.useQuery({ 
    cafeId: "cafe-1" 
  });
  
  if (stats.isLoading) return <Text>Loading...</Text>;
  
  return (
    <View>
      <Text>Total Visits: {stats.data?.totalVisits}</Text>
      <Text>Average Rating: {stats.data?.averageRating}</Text>
      <Text>Visits This Week: {stats.data?.visitsThisWeek}</Text>
    </View>
  );
}
```

## Authentication Flow

1. User calls `login()` or `signup()` from `useApp()`
2. Backend returns a session token
3. Token is stored in AsyncStorage
4. All subsequent API calls include token in Authorization header
5. Backend validates token and returns user data
6. On logout, token is removed from storage

## Data Models

All endpoints return properly typed data matching the TypeScript interfaces in `types/index.ts` and `backend/db/schema.ts`.
