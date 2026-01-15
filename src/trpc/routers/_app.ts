import { createTRPCRouter } from "../init";
import { userRouter } from "@/modules/users/server/procedures";
import { vendorRouter } from "@/modules/vendors/server/procedures";
import { categoryRouter } from "@/modules/categories/server/procedures";
import { phoneAuthRouter } from "@/modules/auth-phone/server/procedures";
import { orderRouter } from "@/modules/orders/server/procedures";
import { paymentRouter } from "@/modules/payments/server/procedures";
import { operatorRouter } from "@/modules/operators/server/procedures";
import { adminRouter } from "@/modules/admin/server/procedures";
import { payoutRouter } from "@/modules/payouts/server/procedures";

export const appRouter = createTRPCRouter({
  users: userRouter,
  vendors: vendorRouter,
  categories: categoryRouter,
  phoneAuth: phoneAuthRouter,
  orders: orderRouter,
  payments: paymentRouter,
  operators: operatorRouter,
  admin: adminRouter,
  payouts: payoutRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
