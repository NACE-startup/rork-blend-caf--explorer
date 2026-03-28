import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { TRPCError } from "@trpc/server";

export default protectedProcedure
  .input(
    z.object({
      cafeId: z.string(),
      mediaUrl: z.string(),
      mediaType: z.enum(["image", "video"]),
      caption: z.string().min(1).max(500),
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

    const postId = `post-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newPost = {
      id: postId,
      user_id: ctx.userId,
      cafe_id: input.cafeId,
      media_url: input.mediaUrl,
      media_type: input.mediaType,
      caption: input.caption,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.posts.set(postId, newPost);

    return {
      id: newPost.id,
      userId: newPost.user_id,
      userName: ctx.user.name,
      userAvatar: ctx.user.avatar ?? "",
      cafeId: newPost.cafe_id,
      cafeName: cafe.name,
      mediaUrl: newPost.media_url,
      mediaType: newPost.media_type,
      caption: newPost.caption,
      likes: newPost.likes,
      createdAt: newPost.created_at,
    };
  });
