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
import { notificationRouter } from "@/modules/notifications/server/router";
import { riderRequestRouter } from "@/modules/rider-requests/server/procedures";
import { packageRouter } from "@/modules/packages/server/procedures";
import { walletRouter } from "@/modules/wallet/server/procedures";
import { discountRouter } from "@/modules/discounts/server/procedures";

export const appRouter = createTRPCRouter({
  users: userRouter,
  vendors: vendorRouter,
  categories: categoryRouter,
  phoneAuth: phoneAuthRouter,
  orders: orderRouter,
  riderRequests: riderRequestRouter,
  payments: paymentRouter,
  operators: operatorRouter,
  admin: adminRouter,
  payouts: payoutRouter,
  notifications: notificationRouter,
  packages: packageRouter,
  wallet: walletRouter,
  discounts: discountRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
