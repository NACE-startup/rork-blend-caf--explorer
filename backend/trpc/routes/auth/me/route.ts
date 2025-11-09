import { protectedProcedure } from "@/backend/trpc/create-context";

export default protectedProcedure.query(async ({ ctx }) => {
  const user = ctx.user;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    bio: user.bio,
    visitCount: user.visit_count,
    reviewCount: user.review_count,
    badges: user.badges,
    isBusiness: user.is_business,
  };
});
