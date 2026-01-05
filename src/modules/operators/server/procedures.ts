import { createTRPCRouter, operatorProcedure, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

export const operatorRouter = createTRPCRouter({
    // Check if user is an operator
    checkOperatorRole: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user!.id;
        const operatorRole = await ctx.prisma.userRole.findFirst({
            where: {
                userId,
                role: "OPERATOR"
            }
        });
        return !!operatorRole;
    }),

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
                include: {
                    vendor: {
                        select: {
                            id: true,
                            name: true,
                            coverImage: true,
                        }
                    },
                    address: {
                        select: {
                            id: true,
                            line1: true,
                            line2: true,
                            city: true,
                            state: true,
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        }
                    },
                    items: {
                        select: {
                            id: true,
                            quantity: true,
                        }
                    },
                    assignedRider: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                        }
                    }
                }
            });
        }),

    updateOrderStatus: operatorProcedure
        .input(z.object({
            orderId: z.string(),
            status: z.enum(Object.values(OrderStatus))
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
                data: { assignedRiderId: rider.id, status: "ASSIGNED", operatorId: operator.id }
            });
        }),

    // List categories (operators can view all categories)
    listCategories: operatorProcedure
        .input(z.object({
            take: z.number().optional().default(100),
            skip: z.number().optional().default(0)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.category.findMany({
                take: input.take,
                skip: input.skip,
                orderBy: { name: "asc" },
                include: {
                    _count: {
                        select: {
                            vendors: true,
                            items: true
                        }
                    }
                }
            });
        }),

    // Create category
    createCategory: operatorProcedure
        .input(z.object({
            name: z.string(),
            slug: z.string().optional(),
            image: z.string().optional(),
        }))
        .mutation(({ ctx, input }) => {
            const data = {
                ...input,
                slug: input.slug || input.name.toLowerCase().replace(/ /g, "-"),
            }
            return ctx.prisma.category.create({ data });
        }),

    // Update category
    updateCategory: operatorProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
            image: z.string().optional(),
        }))
        .mutation(({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.category.update({
                where: { id },
                data
            });
        }),

    // Delete category
    deleteCategory: operatorProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.category.delete({
                where: { id: input.id }
            });
        }),

    // List vendors (operators can view all vendors)
    listVendors: operatorProcedure
        .input(z.object({
            take: z.number().optional().default(50),
            skip: z.number().optional().default(0),
            q: z.string().optional()
        }))
        .query(({ ctx, input }) => {
            const where: any = {};
            if (input.q) {
                where.OR = [
                    { name: { contains: input.q, mode: "insensitive" } },
                    { description: { contains: input.q, mode: "insensitive" } }
                ];
            }
            return ctx.prisma.vendor.findMany({
                where,
                take: input.take,
                skip: input.skip,
                orderBy: { createdAt: "desc" },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    _count: {
                        select: {
                            products: true,
                            orders: true
                        }
                    }
                }
            });
        }),

    // Update vendor
    updateVendor: operatorProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
            city: z.string().optional(),
            coverImage: z.string().optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.vendor.update({
                where: { id },
                data
            });
        }),
});
