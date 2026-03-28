import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const cafe = db.cafes.get(input.id);

    if (!cafe) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Café not found",
      });
    }

    const reviews = db.findReviewsByCafeId(cafe.id);
    const totalReviews = reviews.length;
    
    let avgCoffee = 0;
    let avgSeating = 0;
    let avgNoise = 0;
    let avgEnvironment = 0;
    
    if (totalReviews > 0) {
      avgCoffee = reviews.reduce((sum, r) => sum + r.rating_coffee, 0) / totalReviews;
      avgSeating = reviews.reduce((sum, r) => sum + r.rating_seating, 0) / totalReviews;
      avgNoise = reviews.reduce((sum, r) => sum + r.rating_noise, 0) / totalReviews;
      avgEnvironment = reviews.reduce((sum, r) => sum + r.rating_environment, 0) / totalReviews;
    }
    
    const overall = totalReviews > 0 
      ? (avgCoffee + avgSeating + avgNoise + avgEnvironment) / 4 
      : 0;

    return {
      id: cafe.id,
      name: cafe.name,
      address: cafe.address,
      latitude: cafe.latitude,
      longitude: cafe.longitude,
      description: cafe.description,
      hours: cafe.hours,
      image: cafe.image,
      tags: cafe.tags,
      verified: cafe.verified,
      ratings: {
        overall: Math.round(overall * 10) / 10,
        coffee: Math.round(avgCoffee * 10) / 10,
        seating: Math.round(avgSeating * 10) / 10,
        noise: Math.round(avgNoise * 10) / 10,
        environment: Math.round(avgEnvironment * 10) / 10,
        totalReviews,
      },
    };
  });
