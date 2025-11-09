import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default protectedProcedure.query(async ({ ctx }) => {
  const favorites = db.findFavoritesByUserId(ctx.userId);

  return favorites.map(fav => {
    const cafe = db.cafes.get(fav.cafe_id);
    
    if (!cafe) {
      return null;
    }

    const reviews = db.findReviewsByCafeId(cafe.id);
    const totalReviews = reviews.length;
    
    let avgRating = 0;
    if (totalReviews > 0) {
      avgRating = reviews.reduce((sum, r) => {
        return sum + (r.rating_coffee + r.rating_seating + r.rating_noise + r.rating_environment) / 4;
      }, 0) / totalReviews;
    }

    return {
      id: fav.id,
      cafeId: cafe.id,
      cafeName: cafe.name,
      cafeAddress: cafe.address,
      cafeImage: cafe.image,
      cafeTags: cafe.tags,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews,
      createdAt: fav.created_at,
    };
  }).filter(Boolean);
});
