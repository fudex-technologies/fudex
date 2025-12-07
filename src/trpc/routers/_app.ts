import { createTRPCRouter } from "../init";
import { userRouter } from "@/modules/users/server/procedures";

export const appRouter = createTRPCRouter({
  users: userRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
