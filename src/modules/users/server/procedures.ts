import { createTRPCRouter, publicProcedure } from "@/trpc/init";

export const userRouter = createTRPCRouter({
    // Return Better Auth session from TRPC context (already resolved via next/headers)
    session: publicProcedure.query(({ ctx }) => ctx.session),
})