import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure
  .input(
    z.object({
      cafeId: z.string(),
      title: z.string().min(3, "Title must be at least 3 characters"),
      description: z.string().min(10, "Description must be at least 10 characters"),
      image: z.string().optional(),
      startDate: z.string(),
      endDate: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    if (!ctx.user.is_business) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only business accounts can create promotions",
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
        message: "You can only create promotions for your own cafés",
      });
    }

    const promoId = `promo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newPromotion = {
      id: promoId,
      business_id: ctx.userId,
      cafe_id: input.cafeId,
      title: input.title,
      description: input.description,
      image: input.image ?? null,
      start_date: input.startDate,
      end_date: input.endDate,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.promotions.set(promoId, newPromotion);

    return {
      id: newPromotion.id,
      businessId: newPromotion.business_id,
      cafeId: newPromotion.cafe_id,
      title: newPromotion.title,
      description: newPromotion.description,
      image: newPromotion.image,
      startDate: newPromotion.start_date,
      endDate: newPromotion.end_date,
      isActive: newPromotion.is_active,
      createdAt: newPromotion.created_at,
    };
  });
