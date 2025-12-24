import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/trpc/init";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

export const paymentRouter = createTRPCRouter({
    // Create a payment record for an order and return a checkout URL + provider reference
    createPayment: protectedProcedure
        .input(z.object({ orderId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const order = await ctx.prisma.order.findUnique({ where: { id: input.orderId } });
            if (!order) throw new Error("Order not found");
            if (order.userId !== userId) throw new Error("Unauthorized");

            const providerRef = uuidv4();

            const payment = await ctx.prisma.payment.create({
                data: {
                    orderId: order.id,
                    userId,
                    amount: order.totalAmount,
                    currency: order.currency,
                    provider: "paystack",
                    providerRef,
                    status: "PENDING",
                }
            });

            // In a real integration we would call Paystack to obtain a checkout URL.
            // Here we return a placeholder URL the frontend can use to redirect.
            const checkoutUrl = `https://paystack.com/pay/${providerRef}`;

            return { payment, checkoutUrl };
        }),

    // Verify payment by providerRef (this would normally call Paystack verify endpoint)
    verifyPayment: protectedProcedure
        .input(z.object({
            providerRef: z.string(),
            status: z.nativeEnum(require("@prisma/client").PaymentStatus).optional()
        })).mutation(async ({ ctx, input }) => {
            const payment = await ctx.prisma.payment.findFirst({
                where: { providerRef: input.providerRef }
            });
            if (!payment) throw new Error("Payment not found");

            // For now accept optional status or mark completed
            const newStatus = input.status ?? ("COMPLETED" as any);
            const updated = await ctx.prisma.payment.update({ where: { id: payment.id }, data: { status: newStatus, paidAt: new Date() } });

            // mark order as PAID
            await ctx.prisma.order.update({ where: { id: payment.orderId }, data: { status: "PAID" } });
            return updated;
        }),
});
