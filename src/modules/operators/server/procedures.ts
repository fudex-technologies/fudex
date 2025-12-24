import { createTRPCRouter, operatorProcedure } from "@/trpc/init";
import { z } from "zod";

export const operatorRouter = createTRPCRouter({
    // List orders within the operator's area (operatorProcedure ensures role)
    listOrdersInArea: operatorProcedure
        .input(z.object({
            take: z.number().optional().default(50),
            skip: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            // find operator record
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
            if (!operator || !operator.areaId) return [];

            // Find orders whose vendor.city matches area's state/name could be refined; here we filter by vendor.city === area.name for simplicity
            const area = await ctx.prisma.area.findUnique({ where: { id: operator.areaId } });
            if (!area) return [];

            return ctx.prisma.order.findMany({
                where: {
                    // naive geo filter: vendor.city == area.name OR address.city == area.name
                    OR: [
                        { vendor: { city: area.name } },
                        { address: { city: area.name } }
                    ],
                },
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" },
            });
        }),

    updateOrderStatus: operatorProcedure
        .input(z.object({
            orderId: z.string(),
            status: z.nativeEnum(require("@prisma/client").OrderStatus)
        }))
        .mutation(async ({ ctx, input }) => {
            // ensure operator can access the order (simplified check: same area)
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
            if (!operator) throw new Error("Operator record not found");

            const order = await ctx.prisma.order.findUnique({
                where: { id: input.orderId }, include: { vendor: true, address: true }
            });
            if (!order) throw new Error("Order not found");

            // permit if vendor.city or address.city matches operator area (simple)
            const area = operator.areaId ? await ctx.prisma.area.findUnique({ where: { id: operator.areaId } }) : null;
            if (area && !(order.vendor?.city === area.name || order.address?.city === area.name)) {
                throw new Error("Forbidden: order outside operator area");
            }

            return ctx.prisma.order.update({ where: { id: input.orderId }, data: { status: input.status } });
        }),

    listRiders: operatorProcedure.query(async ({ ctx }) => {
        const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
        if (!operator) return [];
        return ctx.prisma.rider.findMany({ where: { operatorId: operator.id } });
    }),

    createRider: operatorProcedure
        .input(z.object({
            name: z.string(),
            phone: z.string().optional(),
            notes: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
            if (!operator) throw new Error("Operator record not found");
            return ctx.prisma.rider.create({ data: { ...input, operatorId: operator.id } });
        }),

    updateRider: operatorProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                name: z.string().optional(),
                phone: z.string().optional(),
                isActive: z.boolean().optional(),
                notes: z.string().optional()
            })
        }))
        .mutation(async ({ ctx, input }) => {
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
            if (!operator) throw new Error("Operator record not found");

            // ensure rider belongs to operator
            const rider = await ctx.prisma.rider.findUnique({ where: { id: input.id } });
            if (!rider || rider.operatorId !== operator.id) throw new Error("Forbidden");

            return ctx.prisma.rider.update({ where: { id: input.id }, data: input.data });
        }),

    assignRiderToOrder: operatorProcedure
        .input(z.object({
            orderId: z.string(),
            riderId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
            if (!operator) throw new Error("Operator record not found");

            const rider = await ctx.prisma.rider.findUnique({ where: { id: input.riderId } });
            if (!rider || rider.operatorId !== operator.id) throw new Error("Forbidden: rider not managed by operator");

            // simple assign
            return ctx.prisma.order.update({
                where: { id: input.orderId },
                data: { assignedRiderId: rider.id, status: "ASSIGNED" }
            });
        }),
});
