import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ input, ctx }) => {
    const allVisits = db.findVisitsByUserId(ctx.userId);
    const sortedVisits = allVisits.sort(
      (a, b) => new Date(b.visit_time).getTime() - new Date(a.visit_time).getTime()
    );
    const visits = sortedVisits.slice(input.offset, input.offset + input.limit);

    return {
      visits: visits.map(visit => {
        const cafe = db.cafes.get(visit.cafe_id);
        return {
          id: visit.id,
          cafeId: visit.cafe_id,
          cafeName: cafe?.name ?? "Unknown Café",
          cafeImage: cafe?.image ?? "",
          visitTime: visit.visit_time,
          createdAt: visit.created_at,
        };
      }),
      total: allVisits.length,
      hasMore: input.offset + input.limit < allVisits.length,
    };
  });
