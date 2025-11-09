import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure
  .input(z.object({ cafeId: z.string() }))
  .query(async ({ input, ctx }) => {
    if (!ctx.user.is_business) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only business accounts can access analytics",
      });
    }

    const cafe = db.cafes.get(input.cafeId);
    
    if (!cafe) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Café not found",
      });
    }

    if (cafe.owner_id !== ctx.userId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You can only view analytics for your own cafés",
      });
    }

    const reviews = db.findReviewsByCafeId(input.cafeId);
    const visits = Array.from(db.visits.values()).filter(v => v.cafe_id === input.cafeId);
    const promotions = db.findPromotionsByCafeId(input.cafeId);
    const posts = db.findPostsByCafeId(input.cafeId);

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const visitsThisWeek = visits.filter(v => new Date(v.visit_time) >= weekAgo).length;
    const visitsThisMonth = visits.filter(v => new Date(v.visit_time) >= monthAgo).length;
    const reviewsThisWeek = reviews.filter(r => new Date(r.created_at) >= weekAgo).length;
    const reviewsThisMonth = reviews.filter(r => new Date(r.created_at) >= monthAgo).length;

    let avgRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => {
        return sum + (r.rating_coffee + r.rating_seating + r.rating_noise + r.rating_environment) / 4;
      }, 0);
      avgRating = totalRating / reviews.length;
    }

    return {
      cafeId: input.cafeId,
      cafeName: cafe.name,
      totalVisits: visits.length,
      totalReviews: reviews.length,
      averageRating: Math.round(avgRating * 10) / 10,
      visitsThisWeek,
      visitsThisMonth,
      reviewsThisWeek,
      reviewsThisMonth,
      activePromotions: promotions.length,
      totalPosts: posts.length,
    };
  });
