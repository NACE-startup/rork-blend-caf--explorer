import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default publicProcedure
  .input(
    z.object({
      cafeId: z.string(),
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ input }) => {
    const allReviews = db.findReviewsByCafeId(input.cafeId);
    const sortedReviews = allReviews.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const reviews = sortedReviews.slice(input.offset, input.offset + input.limit);

    return {
      reviews: reviews.map(review => {
        const user = db.users.get(review.user_id);
        return {
          id: review.id,
          cafeId: review.cafe_id,
          userId: review.user_id,
          userName: user?.name ?? "Unknown User",
          userAvatar: user?.avatar ?? "",
          ratings: {
            coffee: review.rating_coffee,
            seating: review.rating_seating,
            noise: review.rating_noise,
            environment: review.rating_environment,
          },
          text: review.text,
          images: review.images,
          helpful: review.helpful,
          createdAt: review.created_at,
        };
      }),
      total: allReviews.length,
      hasMore: input.offset + input.limit < allReviews.length,
    };
  });
