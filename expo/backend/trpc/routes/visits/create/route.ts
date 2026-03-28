import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure
  .input(
    z.object({
      cafeId: z.string(),
      visitTime: z.string().optional(),
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

    const visitTime = input.visitTime ? new Date(input.visitTime) : new Date();
    const visitId = `visit-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const newVisit = {
      id: visitId,
      user_id: ctx.userId,
      cafe_id: input.cafeId,
      visit_time: visitTime.toISOString(),
      created_at: new Date().toISOString(),
    };

    db.visits.set(visitId, newVisit);

    const user = ctx.user;
    user.visit_count += 1;
    db.users.set(user.id, user);

    const dayOfWeek = visitTime.getDay();
    const hour = visitTime.getHours();
    const busyTimeId = `busy-${input.cafeId}-${dayOfWeek}-${hour}`;
    
    let busyTime = db.busyTimes.get(busyTimeId);
    if (busyTime) {
      busyTime.sample_count += 1;
      busyTime.updated_at = new Date().toISOString();
      db.busyTimes.set(busyTimeId, busyTime);
    } else {
      db.busyTimes.set(busyTimeId, {
        id: busyTimeId,
        cafe_id: input.cafeId,
        day_of_week: dayOfWeek,
        hour,
        busy_level: 50,
        sample_count: 1,
        updated_at: new Date().toISOString(),
      });
    }

    return {
      id: newVisit.id,
      cafeId: newVisit.cafe_id,
      userId: newVisit.user_id,
      visitTime: newVisit.visit_time,
      createdAt: newVisit.created_at,
    };
  });
