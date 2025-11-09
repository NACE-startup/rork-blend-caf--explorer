import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default publicProcedure
  .input(
    z.object({
      query: z.string().min(1),
      tags: z.array(z.string()).optional(),
      limit: z.number().min(1).max(100).optional().default(20),
    })
  )
  .query(async ({ input }) => {
    const cafes = db.searchCafes(input.query, input.tags);
    const limitedCafes = cafes.slice(0, input.limit);

    return limitedCafes.map(cafe => {
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
  });
