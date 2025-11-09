import { protectedProcedure } from "@/backend/trpc/create-context";
import { deleteSession } from "@/backend/utils/auth";

export default protectedProcedure.mutation(async ({ ctx }) => {
  if (ctx.token) {
    deleteSession(ctx.token);
  }

  return { success: true };
});
