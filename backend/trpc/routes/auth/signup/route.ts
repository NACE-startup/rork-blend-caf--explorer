import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { db } from "@/backend/db/store";
import { hashPassword, createSession } from "@/backend/utils/auth";
import { TRPCError } from "@trpc/server";

export default publicProcedure
  .input(
    z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      isBusiness: z.boolean().optional().default(false),
    })
  )
  .mutation(async ({ input }) => {
    const existingUser = db.findUserByEmail(input.email);
    
    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "User with this email already exists",
      });
    }

    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const newUser = {
      id: userId,
      name: input.name,
      email: input.email,
      password_hash: hashPassword(input.password),
      avatar: `https://i.pravatar.cc/150?u=${input.email}`,
      bio: null,
      visit_count: 0,
      review_count: 0,
      badges: [],
      is_business: input.isBusiness,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.set(userId, newUser);

    const { token, expiresAt } = createSession(userId);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
        bio: newUser.bio,
        visitCount: newUser.visit_count,
        reviewCount: newUser.review_count,
        badges: newUser.badges,
        isBusiness: newUser.is_business,
      },
      token,
      expiresAt,
    };
  });
