import { DbUser, DbCafe, DbReview, DbPromotion, DbPost, DbVisit, DbFavorite, DbBusyTime } from "./schema";

export const mockUsers: DbUser[] = [
  {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    password_hash: "$2a$10$mockpasswordhash1",
    avatar: "https://i.pravatar.cc/150?u=sarah@example.com",
    bio: "Coffee enthusiast and digital nomad",
    visit_count: 24,
    review_count: 18,
    badges: ["Explorer", "Reviewer"],
    is_business: false,
    created_at: new Date("2024-01-15").toISOString(),
    updated_at: new Date("2024-10-25").toISOString(),
  },
  {
    id: "user-2",
    name: "Java House",
    email: "contact@javahouse.com",
    password_hash: "$2a$10$mockpasswordhash2",
    avatar: "https://i.pravatar.cc/150?u=javahouse",
    bio: "Premium coffee roasters serving the community since 2015",
    visit_count: 0,
    review_count: 0,
    badges: ["Verified Business"],
    is_business: true,
    created_at: new Date("2024-02-01").toISOString(),
    updated_at: new Date("2024-10-28").toISOString(),
  },
];

export const mockCafes: DbCafe[] = [
  {
    id: "cafe-1",
    name: "The Brew Lab",
    address: "123 Main St, San Francisco, CA 94102",
    latitude: 37.7749,
    longitude: -122.4194,
    description: "Artisan coffee shop with great WiFi and quiet study spaces. Perfect for remote workers and students.",
    hours: "7am - 9pm daily",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop",
    tags: ["study", "quiet", "wifi", "coffee", "laptop-friendly"],
    verified: true,
    owner_id: "user-2",
    created_at: new Date("2024-01-10").toISOString(),
    updated_at: new Date("2024-10-28").toISOString(),
  },
  {
    id: "cafe-2",
    name: "Java House",
    address: "456 Market St, San Francisco, CA 94103",
    latitude: 37.7849,
    longitude: -122.4094,
    description: "Cozy neighborhood café with amazing pastries and specialty drinks.",
    hours: "6am - 8pm daily",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop",
    tags: ["cozy", "pastries", "coffee", "breakfast"],
    verified: true,
    owner_id: "user-2",
    created_at: new Date("2024-01-12").toISOString(),
    updated_at: new Date("2024-10-27").toISOString(),
  },
  {
    id: "cafe-3",
    name: "Roast & Toast",
    address: "789 Valencia St, San Francisco, CA 94110",
    latitude: 37.7649,
    longitude: -122.4214,
    description: "Hip coffee spot with live music on weekends. Great for casual meetings.",
    hours: "8am - 10pm daily",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&h=600&fit=crop",
    tags: ["music", "social", "coffee", "vibrant"],
    verified: false,
    owner_id: null,
    created_at: new Date("2024-02-05").toISOString(),
    updated_at: new Date("2024-10-26").toISOString(),
  },
  {
    id: "cafe-4",
    name: "Quiet Corner",
    address: "321 Clement St, San Francisco, CA 94118",
    latitude: 37.7829,
    longitude: -122.4664,
    description: "Minimalist café perfect for focused work. Strictly no-phone policy.",
    hours: "7am - 7pm daily",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=600&fit=crop",
    tags: ["quiet", "study", "minimal", "focus"],
    verified: false,
    owner_id: null,
    created_at: new Date("2024-03-10").toISOString(),
    updated_at: new Date("2024-10-25").toISOString(),
  },
];

export const mockReviews: DbReview[] = [
  {
    id: "review-1",
    cafe_id: "cafe-1",
    user_id: "user-1",
    rating_coffee: 5,
    rating_seating: 4,
    rating_noise: 5,
    rating_environment: 5,
    text: "Perfect place for studying! The WiFi is fast and there's plenty of seating. Coffee is excellent too.",
    images: ["https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop"],
    helpful: 12,
    created_at: new Date("2024-10-20").toISOString(),
    updated_at: new Date("2024-10-20").toISOString(),
  },
  {
    id: "review-2",
    cafe_id: "cafe-2",
    user_id: "user-1",
    rating_coffee: 4,
    rating_seating: 3,
    rating_noise: 3,
    rating_environment: 4,
    text: "Great pastries and friendly staff. Can get a bit crowded in the mornings.",
    images: [],
    helpful: 8,
    created_at: new Date("2024-10-18").toISOString(),
    updated_at: new Date("2024-10-18").toISOString(),
  },
];

export const mockPromotions: DbPromotion[] = [
  {
    id: "promo-1",
    business_id: "user-2",
    cafe_id: "cafe-2",
    title: "Happy Hour Special",
    description: "50% off all drinks from 3-5pm weekdays",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
    start_date: new Date("2024-10-28").toISOString(),
    end_date: new Date("2024-11-28").toISOString(),
    is_active: true,
    created_at: new Date("2024-10-25").toISOString(),
    updated_at: new Date("2024-10-25").toISOString(),
  },
];

export const mockPosts: DbPost[] = [
  {
    id: "post-1",
    user_id: "user-1",
    cafe_id: "cafe-1",
    media_url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800&fit=crop",
    media_type: "image",
    caption: "Perfect latte art at The Brew Lab ☕️",
    likes: 45,
    created_at: new Date("2024-10-27").toISOString(),
    updated_at: new Date("2024-10-27").toISOString(),
  },
];

export const mockVisits: DbVisit[] = [
  {
    id: "visit-1",
    user_id: "user-1",
    cafe_id: "cafe-1",
    visit_time: new Date("2024-10-27T09:30:00").toISOString(),
    created_at: new Date("2024-10-27T09:30:00").toISOString(),
  },
  {
    id: "visit-2",
    user_id: "user-1",
    cafe_id: "cafe-2",
    visit_time: new Date("2024-10-26T14:15:00").toISOString(),
    created_at: new Date("2024-10-26T14:15:00").toISOString(),
  },
];

export const mockFavorites: DbFavorite[] = [
  {
    id: "fav-1",
    user_id: "user-1",
    cafe_id: "cafe-1",
    created_at: new Date("2024-10-15").toISOString(),
  },
];

export const mockBusyTimes: DbBusyTime[] = [];

for (let cafeIndex = 1; cafeIndex <= 4; cafeIndex++) {
  for (let day = 0; day < 7; day++) {
    for (let hour = 7; hour < 22; hour++) {
      const peakHours = [8, 9, 12, 13, 17, 18];
      const busyLevel = peakHours.includes(hour) 
        ? Math.floor(Math.random() * 30) + 70
        : Math.floor(Math.random() * 50) + 20;

      mockBusyTimes.push({
        id: `busy-${cafeIndex}-${day}-${hour}`,
        cafe_id: `cafe-${cafeIndex}`,
        day_of_week: day,
        hour,
        busy_level: busyLevel,
        sample_count: Math.floor(Math.random() * 50) + 10,
        updated_at: new Date().toISOString(),
      });
    }
  }
}
