import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure
  .input(
    z.object({
      cafeId: z.string(),
      ratings: z.object({
        coffee: z.number().min(1).max(5),
        seating: z.number().min(1).max(5),
        noise: z.number().min(1).max(5),
        environment: z.number().min(1).max(5),
      }),
      text: z.string().min(10, "Review must be at least 10 characters"),
      images: z.array(z.string()).optional().default([]),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const cafe = db.cafes.get(input.cafeId);
    
    if (!cafe) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Café not found",
      });
    }

    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newReview = {
      id: reviewId,
      cafe_id: input.cafeId,
      user_id: ctx.userId,
      rating_coffee: input.ratings.coffee,
      rating_seating: input.ratings.seating,
      rating_noise: input.ratings.noise,
      rating_environment: input.ratings.environment,
      text: input.text,
      images: input.images,
      helpful: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.reviews.set(reviewId, newReview);

    const user = ctx.user;
    user.review_count += 1;
    db.users.set(user.id, user);

    return {
      id: newReview.id,
      cafeId: newReview.cafe_id,
      userId: newReview.user_id,
      userName: user.name,
      userAvatar: user.avatar ?? "",
      ratings: {
        coffee: newReview.rating_coffee,
        seating: newReview.rating_seating,
        noise: newReview.rating_noise,
        environment: newReview.rating_environment,
      },
      text: newReview.text,
      images: newReview.images,
      helpful: newReview.helpful,
      createdAt: newReview.created_at,
    };
  });
