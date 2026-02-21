import { createTRPCRouter, operatorProcedure, protectedProcedure } from "@/trpc/init";
import { z } from "zod";
import { OrderStatus, RiderRequestStatus } from "@prisma/client";
import { normalizePhoneNumber } from "@/lib/commonFunctions";
import { RefundService } from '@/modules/wallet/server/refund.service';
import { sendOrderOutForDeliveryEmail } from '@/lib/email';
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

    // List orders (infinite scroll support, area-aware but default to all)
    listOrders: operatorProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(), // orderId
            status: z.nativeEnum(OrderStatus).nullish(),
            areaId: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 50;
            const { cursor, status, areaId } = input;

            const where: any = {};
            if (status) where.status = status;

            // Area-aware logic: if areaId is provided, filter by it. 
            // If the user wants to enforce operator-area confinement later, 
            // we can uncomment the logic to fetch operator's area here.
            if (areaId) {
                const area = await ctx.prisma.area.findUnique({ where: { id: areaId } });
                if (area) {
                    where.OR = [
                        { vendor: { city: area.name } },
                        { address: { city: area.name } }
                    ];
                }
            }

            const items = await ctx.prisma.order.findMany({
                take: limit + 1,
                where,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    vendor: {
                        select: {
                            id: true,
                            name: true,
                            coverImage: true,
                            addresses: true,
                            phone: true,
                        }
                    },
                    address: {
                        select: {
                            id: true,
                            line1: true,
                            line2: true,
                            city: true,
                            state: true,
                            customArea: true,
                            area: {
                                select: {
                                    id: true,
                                    name: true,
                                    state: true,
                                }
                            }
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
                        include: {
                            productItem: {
                                include: {
                                    product: true
                                }
                            },
                            addons: {
                                include: {
                                    addonProductItem: {
                                        include: {
                                            product: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            provider: true,
                            providerRef: true,
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

            // Fetch wallet deductions for these orders to compute paymentMethod
            const orderIds = items.map(item => item.id);
            const walletDebits = await ctx.prisma.walletTransaction.groupBy({
                by: ['sourceId'],
                where: {
                    sourceId: { in: orderIds },
                    sourceType: 'ORDER_PAYMENT',
                    type: 'DEBIT',
                },
                _sum: { amount: true }
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }
            // return {
            //     items,
            //     nextCursor,
            // };

            return {
                items: items.map(item => {
                    const debit = walletDebits.find(wd => wd.sourceId === item.id);
                    const walletUsed = debit?._sum.amount?.toNumber() || 0;
                    let paymentMethod = item.payment?.provider === 'wallet' ? 'Wallet' : 'Paystack';

                    if (item.payment?.provider === 'paystack' && walletUsed > 0) {
                        paymentMethod = 'Wallet + Paystack';
                    } else if (item.payment?.provider === 'paystack') {
                        paymentMethod = 'Paystack';
                    } else if (item.payment?.provider === 'wallet') {
                        paymentMethod = 'Wallet';
                    }

                    return {
                        ...item,
                        paymentMethod
                    };
                }),
                nextCursor,
            }
        }),

    // Legacy method for backward compatibility
    listOrdersInArea: operatorProcedure
        .input(z.object({
            take: z.number().optional().default(50),
            skip: z.number().optional().default(0)
        }))
        .query(async ({ ctx, input }) => {
            // find operator record
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });

            const where: any = {};
            if (operator && operator.areaId) {
                const area = await ctx.prisma.area.findUnique({ where: { id: operator.areaId } });
                if (area) {
                    where.OR = [
                        { vendor: { city: area.name } },
                        { address: { city: area.name } }
                    ];
                }
            }

            const rawItems = await ctx.prisma.order.findMany({
                where,
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
                            customArea: true,
                            area: {
                                select: {
                                    id: true,
                                    name: true,
                                    state: true,
                                }
                            }
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
                    payment: {
                        select: {
                            id: true,
                            amount: true,
                            status: true,
                            provider: true,
                            providerRef: true,
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

            // Fetch wallet deductions for these orders to compute paymentMethod
            const orderIds = rawItems.map(item => item.id);
            const walletDebits = await ctx.prisma.walletTransaction.groupBy({
                by: ['sourceId'],
                where: {
                    sourceId: { in: orderIds },
                    sourceType: 'ORDER_PAYMENT',
                    type: 'DEBIT',
                },
                _sum: { amount: true }
            });

            return rawItems.map(item => {
                const debit = walletDebits.find(wd => wd.sourceId === item.id);
                const walletUsed = debit?._sum.amount?.toNumber() || 0;
                let paymentMethod = item.payment?.provider === 'wallet' ? 'Wallet' : 'Paystack';

                if (item.payment?.provider === 'paystack' && walletUsed > 0) {
                    paymentMethod = 'Wallet + Paystack';
                } else if (item.payment?.provider === 'paystack') {
                    paymentMethod = 'Paystack';
                } else if (item.payment?.provider === 'wallet') {
                    paymentMethod = 'Wallet';
                }

                return {
                    ...item,
                    paymentMethod
                };
            });
        }),

    updateOrderStatus: operatorProcedure
        .input(z.object({
            currentStatus: z.nativeEnum(OrderStatus),
            orderId: z.string(),
            status: z.nativeEnum(OrderStatus)
        }))
        .mutation(async ({ ctx, input }) => {
            const updated = await ctx.prisma.order.update({
                where: { id: input.orderId },
                data: { status: input.status },
                include: {
                    user: { select: { name: true, email: true } },
                    vendor: { select: { name: true } }
                }
            });

            // Notify Customer if Out for Delivery
            if (input.status === "OUT_FOR_DELIVERY" && updated.user?.email) {
                sendOrderOutForDeliveryEmail(
                    updated.user.email,
                    updated.user.name || "Customer",
                    updated.id,
                    updated.vendor?.name || "the vendor",
                    "order@fudex.ng"
                ).catch(err => {
                    console.error(`[Email] Error sending out-for-delivery email for order ${updated.id}:`, err);
                });
            }

            // Handle Refund if cancelled
            if (input.status === "CANCELLED" && input.currentStatus !== "PENDING") {
                await RefundService.refundOrder(input.orderId).catch(err => {
                    console.error(`[Refund] Error refunding operator cancelled order ${input.orderId}:`, err);
                });
            }

            return updated;
        }),

    listRiders: operatorProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(), // riderId
            areaId: z.string().optional(),
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 50;
            const { cursor, areaId } = input;

            const where: any = {};
            // If areaId is provided, we could filter riders by their operator's area
            // For now, return all riders as requested
            if (areaId) {
                where.operator = { areaId };
            }

            const items = await ctx.prisma.rider.findMany({
                take: limit + 1,
                where,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    operator: {
                        select: {
                            id: true,
                            area: true,
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }
            return {
                items,
                nextCursor,
            };
        }),

    createRider: operatorProcedure
        .input(z.object({
            name: z.string(),
            phone: z.string().optional(),
            notes: z.string().optional(),
            areaId: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
            if (!operator) throw new Error("Operator record not found");
            const phone = input.phone ? normalizePhoneNumber(input.phone) : undefined;
            // Use the operator's ID as the manager by default
            return ctx.prisma.rider.create({
                data: {
                    name: input.name,
                    phone,
                    notes: input.notes,
                    operatorId: operator.id
                }
            });
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
            // Operators can update any rider for now
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

            // Simple assign - allow assigning ANY rider to ANY order
            return ctx.prisma.order.update({
                where: { id: input.orderId },
                data: { assignedRiderId: input.riderId, status: "ASSIGNED", operatorId: operator.id }
            });
        }),

    // List categories (operators can view all categories)
    listCategories: operatorProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(), // categoryId
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 100;
            const { cursor } = input;

            const items = await ctx.prisma.category.findMany({
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
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

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }
            return {
                items,
                nextCursor,
            };
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
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(), // vendorId
            q: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 50;
            const { cursor, q } = input;

            const where: any = {};
            if (q) {
                where.OR = [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } }
                ];
            }

            const items = await ctx.prisma.vendor.findMany({
                where,
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    addresses: true,
                    _count: {
                        select: {
                            products: true,
                            orders: true
                        }
                    }
                }
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }
            return {
                items,
                nextCursor,
            };
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
        .mutation(async ({ ctx, input }) => {
            const { id, city, ...rest } = input;

            // Handle city field - update or create address
            if (city) {
                const existingAddress = await ctx.prisma.address.findFirst({
                    where: {
                        vendorId: id,
                        isDefault: true,
                    }
                });

                if (existingAddress) {
                    await ctx.prisma.address.update({
                        where: { id: existingAddress.id },
                        data: { city }
                    });
                } else {
                    // Create a new address with basic info
                    const vendor = await ctx.prisma.vendor.findUnique({
                        where: { id },
                        select: { ownerId: true }
                    });

                    if (vendor?.ownerId) {
                        await ctx.prisma.address.create({
                            data: {
                                userId: vendor.ownerId,
                                vendorId: id,
                                line1: '',
                                city: city,
                                country: 'NG',
                                isDefault: true,
                            }
                        });
                    }
                }
            }

            return ctx.prisma.vendor.update({
                where: { id },
                data: rest
            });
        }),

    // List rider requests (operators can view all rider requests)
    listRiderRequests: operatorProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(), // requestId
            status: z.nativeEnum(RiderRequestStatus).nullish(),
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit ?? 50;
            const { cursor, status } = input;

            const where: any = {};
            if (status) where.status = status;

            const items = await ctx.prisma.riderRequest.findMany({
                take: limit + 1,
                where,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    vendor: true,
                    items: {
                        include: {
                            area: true
                        }
                    },
                    assignedRider: true,
                }
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }
            return {
                items,
                nextCursor,
            };
        }),

    assignRiderToRequest: operatorProcedure
        .input(z.object({
            requestId: z.string(),
            riderId: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const operator = await ctx.prisma.operator.findUnique({ where: { userId: ctx.user!.id } });
            if (!operator) throw new Error("Operator record not found");

            return ctx.prisma.riderRequest.update({
                where: { id: input.requestId },
                data: {
                    assignedRiderId: input.riderId,
                    status: "ASSIGNED",
                    operatorId: operator.id
                }
            });
        }),
});
