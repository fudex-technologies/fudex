import { createTRPCRouter } from "../init";
import { userRouter } from "@/modules/users/server/procedures";
import { vendorRouter } from "@/modules/vendors/server/procedures";
import { categoryRouter } from "@/modules/categories/server/procedures";
import { orderRouter } from "@/modules/orders/server/procedures";
import { paymentRouter } from "@/modules/payments/server/procedures";
import { operatorRouter } from "@/modules/operators/server/procedures";
import { adminRouter } from "@/modules/admin/server/procedures";

export const appRouter = createTRPCRouter({
  users: userRouter,
  vendors: vendorRouter,
  categories: categoryRouter,
  orders: orderRouter,
  payments: paymentRouter,
  operators: operatorRouter,
  admin: adminRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
