import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure
  .input(z.object({ cafeId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const cafe = db.cafes.get(input.cafeId);
    
    if (!cafe) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Café not found",
      });
    }

    const existingFavorite = db.findFavorite(ctx.userId, input.cafeId);
    
    if (existingFavorite) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Café is already in favorites",
      });
    }

    const favoriteId = `fav-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newFavorite = {
      id: favoriteId,
      user_id: ctx.userId,
      cafe_id: input.cafeId,
      created_at: new Date().toISOString(),
    };

    db.favorites.set(favoriteId, newFavorite);

    return {
      id: newFavorite.id,
      userId: newFavorite.user_id,
      cafeId: newFavorite.cafe_id,
      createdAt: newFavorite.created_at,
    };
  });
