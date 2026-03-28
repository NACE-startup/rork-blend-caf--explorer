import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure
  .input(z.object({ cafeId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const favorite = db.findFavorite(ctx.userId, input.cafeId);
    
    if (!favorite) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Favorite not found",
      });
    }

    db.favorites.delete(favorite.id);

    return { success: true };
  });
