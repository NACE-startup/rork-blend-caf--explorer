import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default publicProcedure
  .input(z.object({ cafeId: z.string() }))
  .query(async ({ input }) => {
    const promotions = db.findPromotionsByCafeId(input.cafeId);

    const now = new Date();
    const activePromotions = promotions.filter(promo => {
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      return promo.is_active && startDate <= now && endDate >= now;
    });

    return activePromotions.map(promo => ({
      id: promo.id,
      businessId: promo.business_id,
      cafeId: promo.cafe_id,
      title: promo.title,
      description: promo.description,
      image: promo.image,
      startDate: promo.start_date,
      endDate: promo.end_date,
      isActive: promo.is_active,
      createdAt: promo.created_at,
    }));
  });
