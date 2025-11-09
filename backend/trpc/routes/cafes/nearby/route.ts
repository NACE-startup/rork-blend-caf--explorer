import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { GOOGLE_MAPS_API_KEY } from "@/constants/maps";

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: {
    photo_reference: string;
  }[];
  business_status?: string;
}

interface GooglePlacesResponse {
  results: GooglePlaceResult[];
  status: string;
}

async function fetchRealCafes(
  latitude: number,
  longitude: number,
  radiusMeters: number
): Promise<GooglePlaceResult[]> {
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.append("location", `${latitude},${longitude}`);
    url.searchParams.append("radius", radiusMeters.toString());
    url.searchParams.append("type", "cafe");
    url.searchParams.append("key", GOOGLE_MAPS_API_KEY);

    console.log("Fetching real cafes from Google Places API:", url.toString());

    const response = await fetch(url.toString());
    const data: GooglePlacesResponse = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status);
      return [];
    }

    console.log(`Found ${data.results.length} real cafes from Google Places`);
    return data.results.filter(place => place.business_status !== "CLOSED_PERMANENTLY");
  } catch (error) {
    console.error("Error fetching real cafes:", error);
    return [];
  }
}

function generateCafeTags(place: GooglePlaceResult): string[] {
  const tags: string[] = [];
  const types = place.types || [];

  if (types.includes("cafe")) tags.push("Coffee");
  if (types.includes("restaurant")) tags.push("Food");
  if (types.includes("bakery")) tags.push("Pastries");
  if (types.includes("bar")) tags.push("Social");

  if (place.rating && place.rating >= 4.5) {
    tags.push("Popular");
  }

  if ((place.user_ratings_total || 0) > 100) {
    tags.push("WiFi", "Seating");
  }

  if (tags.length === 0) {
    tags.push("Coffee", "Chill");
  }

  return tags;
}

export default publicProcedure
  .input(
    z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      radiusMiles: z.number().min(1).max(50).optional().default(10),
      tags: z.array(z.string()).optional(),
      limit: z.number().min(1).max(100).optional().default(20),
    })
  )
  .query(async ({ input }) => {
    const radiusMeters = input.radiusMiles * 1609.34;

    const realCafes = await fetchRealCafes(
      input.latitude,
      input.longitude,
      radiusMeters
    );

    let cafes = realCafes.map(place => {
      const distance = db.calculateDistance(
        input.latitude,
        input.longitude,
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      const tags = generateCafeTags(place);
      const photoUrl = place.photos?.[0]
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        : "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800";

      return {
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        distance: Math.round(distance * 10) / 10,
        description: `A cozy café located at ${place.vicinity}`,
        hours: "Mon-Sun: 7:00 AM - 7:00 PM",
        image: photoUrl,
        tags,
        verified: (place.user_ratings_total || 0) > 50,
        ratings: {
          overall: Math.round((place.rating || 4.0) * 10) / 10,
          coffee: Math.round((place.rating || 4.0) * 10) / 10,
          seating: Math.round((place.rating || 4.0) * 10) / 10,
          noise: Math.round((place.rating || 4.0) * 10) / 10,
          environment: Math.round((place.rating || 4.0) * 10) / 10,
          totalReviews: place.user_ratings_total || 0,
        },
      };
    });

    if (input.tags && input.tags.length > 0) {
      cafes = cafes.filter(cafe =>
        input.tags!.some(tag => 
          cafe.tags.some(cafeTag => 
            cafeTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      );
    }

    cafes = cafes.slice(0, input.limit);

    console.log(`Returning ${cafes.length} cafes after filtering`);
    return cafes;
  });
