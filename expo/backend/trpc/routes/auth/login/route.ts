import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { verifyPassword, createSession } from "@/backend/utils/auth";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    })
  )
  .mutation(async ({ input }) => {
    const user = db.findUserByEmail(input.email);

    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const isValidPassword = verifyPassword(input.password, user.password_hash);
    
    if (!isValidPassword) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid email or password",
      });
    }

    const { token, expiresAt } = createSession(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        visitCount: user.visit_count,
        reviewCount: user.review_count,
        badges: user.badges,
        isBusiness: user.is_business,
      },
      token,
      expiresAt,
    };
  });
