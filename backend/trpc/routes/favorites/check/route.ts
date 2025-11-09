import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default protectedProcedure
  .input(z.object({ cafeId: z.string() }))
  .query(async ({ input, ctx }) => {
    const favorite = db.findFavorite(ctx.userId, input.cafeId);
    
    return {
      isFavorite: !!favorite,
    };
  });
