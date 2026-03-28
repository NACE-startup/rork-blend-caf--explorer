import { DbUser, DbCafe, DbReview, DbPromotion, DbPost, DbVisit, DbFavorite, DbBusyTime, DbSession } from "./schema";
import { mockUsers, mockCafes, mockReviews, mockPromotions, mockPosts, mockVisits, mockFavorites, mockBusyTimes } from "./mock-data";

class InMemoryDatabase {
  users: Map<string, DbUser> = new Map();
  cafes: Map<string, DbCafe> = new Map();
  reviews: Map<string, DbReview> = new Map();
  promotions: Map<string, DbPromotion> = new Map();
  posts: Map<string, DbPost> = new Map();
  visits: Map<string, DbVisit> = new Map();
  favorites: Map<string, DbFavorite> = new Map();
  busyTimes: Map<string, DbBusyTime> = new Map();
  sessions: Map<string, DbSession> = new Map();

  constructor() {
    mockUsers.forEach(user => this.users.set(user.id, user));
    mockCafes.forEach(cafe => this.cafes.set(cafe.id, cafe));
    mockReviews.forEach(review => this.reviews.set(review.id, review));
    mockPromotions.forEach(promo => this.promotions.set(promo.id, promo));
    mockPosts.forEach(post => this.posts.set(post.id, post));
    mockVisits.forEach(visit => this.visits.set(visit.id, visit));
    mockFavorites.forEach(fav => this.favorites.set(fav.id, fav));
    mockBusyTimes.forEach(bt => this.busyTimes.set(bt.id, bt));
  }

  findUserByEmail(email: string): DbUser | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  findReviewsByCafeId(cafeId: string): DbReview[] {
    return Array.from(this.reviews.values()).filter(r => r.cafe_id === cafeId);
  }

  findReviewsByUserId(userId: string): DbReview[] {
    return Array.from(this.reviews.values()).filter(r => r.user_id === userId);
  }

  findVisitsByUserId(userId: string): DbVisit[] {
    return Array.from(this.visits.values()).filter(v => v.user_id === userId);
  }

  findFavoritesByUserId(userId: string): DbFavorite[] {
    return Array.from(this.favorites.values()).filter(f => f.user_id === userId);
  }

  findFavorite(userId: string, cafeId: string): DbFavorite | undefined {
    return Array.from(this.favorites.values()).find(
      f => f.user_id === userId && f.cafe_id === cafeId
    );
  }

  findPromotionsByCafeId(cafeId: string): DbPromotion[] {
    return Array.from(this.promotions.values()).filter(
      p => p.cafe_id === cafeId && p.is_active
    );
  }

  findPromotionsByBusinessId(businessId: string): DbPromotion[] {
    return Array.from(this.promotions.values()).filter(
      p => p.business_id === businessId
    );
  }

  findPostsByCafeId(cafeId: string): DbPost[] {
    return Array.from(this.posts.values()).filter(p => p.cafe_id === cafeId);
  }

  findPostsByUserId(userId: string): DbPost[] {
    return Array.from(this.posts.values()).filter(p => p.user_id === userId);
  }

  findBusyTimesByCafeId(cafeId: string): DbBusyTime[] {
    return Array.from(this.busyTimes.values()).filter(bt => bt.cafe_id === cafeId);
  }

  findSessionByToken(token: string): DbSession | undefined {
    return Array.from(this.sessions.values()).find(s => s.token === token);
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  findCafesNearby(lat: number, lng: number, radiusMiles: number): DbCafe[] {
    return Array.from(this.cafes.values())
      .filter(cafe => {
        const distance = this.calculateDistance(lat, lng, cafe.latitude, cafe.longitude);
        return distance <= radiusMiles;
      })
      .sort((a, b) => {
        const distA = this.calculateDistance(lat, lng, a.latitude, a.longitude);
        const distB = this.calculateDistance(lat, lng, b.latitude, b.longitude);
        return distA - distB;
      });
  }

  searchCafes(query: string, tags?: string[]): DbCafe[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.cafes.values()).filter(cafe => {
      const matchesQuery = 
        cafe.name.toLowerCase().includes(lowerQuery) ||
        cafe.address.toLowerCase().includes(lowerQuery) ||
        cafe.description?.toLowerCase().includes(lowerQuery) ||
        cafe.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

      const matchesTags = tags && tags.length > 0
        ? tags.some(tag => cafe.tags.includes(tag))
        : true;

      return matchesQuery && matchesTags;
    });
  }
}

export const db = new InMemoryDatabase();
