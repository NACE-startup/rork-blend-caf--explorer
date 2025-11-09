import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";

export default publicProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).optional().default(20),
      offset: z.number().min(0).optional().default(0),
    })
  )
  .query(async ({ input }) => {
    const allPosts = Array.from(db.posts.values());
    const sortedPosts = allPosts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const posts = sortedPosts.slice(input.offset, input.offset + input.limit);

    return {
      posts: posts.map(post => {
        const user = db.users.get(post.user_id);
        const cafe = db.cafes.get(post.cafe_id);
        return {
          id: post.id,
          userId: post.user_id,
          userName: user?.name ?? "Unknown User",
          userAvatar: user?.avatar ?? "",
          cafeId: post.cafe_id,
          cafeName: cafe?.name ?? "Unknown Café",
          mediaUrl: post.media_url,
          mediaType: post.media_type,
          caption: post.caption,
          likes: post.likes,
          createdAt: post.created_at,
        };
      }),
      total: allPosts.length,
      hasMore: input.offset + input.limit < allPosts.length,
    };
  });
