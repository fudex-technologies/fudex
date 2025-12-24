import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure } from "@/trpc/init";
import { z } from "zod";

export const orderRouter = createTRPCRouter({
    // Create an order: items contain productItemId and quantity
    createOrder: protectedProcedure
        .input(
            z.object({
                addressId: z.string(),
                items: z.array(z.object({ productItemId: z.string(), quantity: z.number().min(1) })),
                notes: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            // Load product items to compute prices
            const productItemIds = input.items.map((i) => i.productItemId);
            const productItems = await ctx.prisma.productItem.findMany({ where: { id: { in: productItemIds } } });
            const priceMap: Record<string, number> = {};
            for (const pi of productItems) priceMap[pi.id] = pi.price;

            let total = 0;
            const orderItemsData = input.items.map((it) => {
                const unit = priceMap[it.productItemId] ?? 0;
                const totalPrice = unit * it.quantity;
                total += totalPrice;
                return {
                    productItemId: it.productItemId,
                    quantity: it.quantity,
                    unitPrice: unit,
                    totalPrice,
                };
            });

            const order = await ctx.prisma.order.create({
                data: {
                    userId,
                    addressId: input.addressId,
                    totalAmount: total,
                    currency: "NGN",
                    notes: input.notes,
                    items: { create: orderItemsData },
                },
                include: { items: true },
            });

            return order;
        }),

    // List orders for current user
    listMyOrders: protectedProcedure
        .input(z.object({
            take: z.number().optional().default(20),
            skip: z.number().optional().default(0)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.order.findMany({
                where: { userId: ctx.user!.id },
                take: input.take, skip: input.skip,
                orderBy: { createdAt: "desc" }
            });
        }),

    getOrder: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.order.findFirst({
                where: { id: input.id, userId: ctx.user!.id },
                include: { items: { include: { productItem: true } }, payment: true }
            });
        }),

    // Admin/restaurant update status
    updateStatus: adminProcedure
        .input(z.object({
            id: z.string(),
            status: z.nativeEnum(require("@prisma/client").OrderStatus)
        })).mutation(({ ctx, input }) => {
            return ctx.prisma.order.update({
                where: { id: input.id },
                data: { status: input.status }
            });
        }),
});
