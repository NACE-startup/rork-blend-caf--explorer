import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default publicProcedure
  .input(
    z.object({
      cafeId: z.string(),
      timeRange: z.enum(["today", "week", "month", "all"]).optional().default("all"),
    })
  )
  .query(async ({ input }) => {
    const allVisits = Array.from(db.visits.values()).filter(
      v => v.cafe_id === input.cafeId
    );

    let filteredVisits = allVisits;
    const now = new Date();

    switch (input.timeRange) {
      case "today":
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredVisits = allVisits.filter(
          v => new Date(v.visit_time) >= startOfDay
        );
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredVisits = allVisits.filter(
          v => new Date(v.visit_time) >= weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filteredVisits = allVisits.filter(
          v => new Date(v.visit_time) >= monthAgo
        );
        break;
    }

    const uniqueVisitors = new Set(filteredVisits.map(v => v.user_id)).size;

    return {
      cafeId: input.cafeId,
      totalVisits: filteredVisits.length,
      uniqueVisitors,
      timeRange: input.timeRange,
    };
  });
