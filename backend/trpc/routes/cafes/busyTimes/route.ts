import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default publicProcedure
  .input(z.object({ cafeId: z.string() }))
  .query(async ({ input }) => {
    const busyTimes = db.findBusyTimesByCafeId(input.cafeId);

    const formattedData: Record<number, Record<number, number>> = {};
    
    for (let day = 0; day < 7; day++) {
      formattedData[day] = {};
      for (let hour = 0; hour < 24; hour++) {
        formattedData[day][hour] = 0;
      }
    }

    busyTimes.forEach(bt => {
      formattedData[bt.day_of_week][bt.hour] = bt.busy_level;
    });

    return {
      cafeId: input.cafeId,
      busyTimes: formattedData,
    };
  });
