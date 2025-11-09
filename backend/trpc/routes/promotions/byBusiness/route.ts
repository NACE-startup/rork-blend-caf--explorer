import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure.query(async ({ ctx }) => {
  if (!ctx.user.is_business) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only business accounts can access this endpoint",
    });
  }

  const promotions = db.findPromotionsByBusinessId(ctx.userId);

  return promotions.map(promo => {
    const cafe = db.cafes.get(promo.cafe_id);
    return {
      id: promo.id,
      businessId: promo.business_id,
      cafeId: promo.cafe_id,
      cafeName: cafe?.name ?? "Unknown Café",
      title: promo.title,
      description: promo.description,
      image: promo.image,
      startDate: promo.start_date,
      endDate: promo.end_date,
      isActive: promo.is_active,
      createdAt: promo.created_at,
    };
  });
});
