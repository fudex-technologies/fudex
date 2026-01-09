import { createTRPCRouter, protectedProcedure, publicProcedure, adminProcedure, vendorProcedure } from "@/trpc/init";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import { calculateDeliveryFee, getServiceFee } from "@/lib/deliveryFeeCalculator";

export const orderRouter = createTRPCRouter({
    // Create an order: supports item-level addons and optional grouping (groupKey) for "packs".
    // Input items: { productItemId, quantity, groupKey?: string, addons?: [{ addonProductItemId, quantity }] }
    createOrder: protectedProcedure
        .input(
            z.object({
                addressId: z.string(),
                items: z.array(
                    z.object({
                        productItemId: z.string(),
                        quantity: z.number().min(1),
                        groupKey: z.string().optional(),
                        addons: z.array(z.object({ addonProductItemId: z.string(), quantity: z.number().min(1) })).optional(),
                    })
                ),
                notes: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;

            // Collect all productItem ids (main items + addons) to load and validate
            const mainIds = input.items.map((i) => i.productItemId);
            const addonIds = input.items.flatMap((i) => (i.addons ?? []).map((a) => a.addonProductItemId));
            const allIds = Array.from(new Set([...mainIds, ...addonIds]));

            // Load product items from DB
            const productItems = await ctx.prisma.productItem.findMany({ where: { id: { in: allIds } } });
            const piMap: Record<string, any> = {};
            for (const pi of productItems) piMap[pi.id] = pi;

            // Ensure all referenced items exist
            for (const id of allIds) {
                if (!piMap[id]) throw new Error(`ProductItem not found: ${id}`);
            }

            // Ensure all main items belong to the same vendor (single-vendor checkout)
            const vendorIds = new Set(mainIds.map((id) => piMap[id].vendorId));
            if (vendorIds.size > 1) throw new Error("All items must belong to the same vendor");
            const vendorId = productItems.length ? productItems.find((p) => mainIds.includes(p.id))?.vendorId ?? null : null;

            // Validate availability: items must be active and inStock
            for (const id of mainIds) {
                const pi = piMap[id];
                if (!pi.isActive || !pi.inStock) throw new Error(`Item not available: ${pi.name}`);
            }

            // Addon items should also be available
            for (const id of addonIds) {
                const pi = piMap[id];
                if (!pi.isActive || !pi.inStock) throw new Error(`Addon not available: ${pi.name}`);
            }

            // Check if vendor is currently open
            if (vendorId) {
                const vendor = await ctx.prisma.vendor.findUnique({
                    where: { id: vendorId },
                    include: { openingHours: true }
                });

                if (vendor && vendor.openingHours && vendor.openingHours.length > 0) {
                    const now = new Date();
                    const dayMap: Record<number, string> = {
                        0: 'SUNDAY',
                        1: 'MONDAY',
                        2: 'TUESDAY',
                        3: 'WEDNESDAY',
                        4: 'THURSDAY',
                        5: 'FRIDAY',
                        6: 'SATURDAY',
                    };
                    const currentDay = dayMap[now.getDay()];
                    const currentTime = now.toTimeString().slice(0, 5); // "HH:mm"

                    const todayHours = vendor.openingHours.find(h => h.day === currentDay);

                    // If there are opening hours set and vendor is closed, prevent order
                    if (todayHours) {
                        if (todayHours.isClosed) {
                            throw new Error(`${vendor.name} is closed today. Please try again when they're open.`);
                        }
                        if (todayHours.openTime && todayHours.closeTime) {
                            if (currentTime < todayHours.openTime || currentTime > todayHours.closeTime) {
                                throw new Error(`${vendor.name} is currently closed. Open hours: ${todayHours.openTime} - ${todayHours.closeTime}`);
                            }
                        }
                    }
                }
            }


            // Fetch address to get areaId for delivery fee calculation
            const address = await ctx.prisma.address.findUnique({
                where: { id: input.addressId },
                select: { areaId: true }
            });

            if (!address) {
                throw new Error("Address not found");
            }

            // Calculate delivery fee based on area and current time
            const deliveryFee = await calculateDeliveryFee(ctx.prisma, address.areaId);

            // Get service fee from platform settings
            const serviceFee = await getServiceFee(ctx.prisma);

            // Build create data for order items and compute totals (include addon pricing)
            let orderSubTotal = 0;
            const orderItemsCreate: any[] = [];

            for (const it of input.items) {
                const mainPi = piMap[it.productItemId];
                const unit = mainPi.price;
                let totalPrice = unit * it.quantity;

                const addonsToCreate: any[] = [];
                if (it.addons && it.addons.length) {
                    for (const a of it.addons) {
                        const addonPi = piMap[a.addonProductItemId];
                        const addonUnit = addonPi.price;
                        const addonTotal = addonUnit * a.quantity;
                        totalPrice += addonTotal;
                        addonsToCreate.push({ addonProductItemId: a.addonProductItemId, quantity: a.quantity, unitPrice: addonUnit });
                    }
                }

                orderSubTotal += totalPrice;

                orderItemsCreate.push({
                    productItemId: it.productItemId,
                    quantity: it.quantity,
                    unitPrice: unit,
                    totalPrice,
                    groupKey: it.groupKey,
                    // addons handled after orderItem creation in transaction
                    _addons: addonsToCreate,
                });
            }

            // Calculate total amount including delivery and service fees
            const totalAmount = orderSubTotal + deliveryFee + serviceFee;

            // Persist order + items + addons in a single transaction
            const created = await ctx.prisma.$transaction(async (prisma) => {
                const order = await prisma.order.create({
                    data: {
                        userId,
                        vendorId: vendorId ?? undefined,
                        addressId: input.addressId,
                        totalAmount,
                        deliveryFee,
                        serviceFee,
                        currency: "NGN",
                        notes: input.notes,
                        productAmount: orderSubTotal
                    },
                });

                // create order items and related addons
                for (const oi of orderItemsCreate) {
                    const createdItem = await prisma.orderItem.create({
                        data: {
                            orderId: order.id,
                            productItemId: oi.productItemId,
                            quantity: oi.quantity,
                            unitPrice: oi.unitPrice,
                            totalPrice: oi.totalPrice,
                            groupKey: oi.groupKey,
                        },
                    });

                    // create addons if any
                    for (const a of oi._addons || []) {
                        await prisma.orderItemAddon.create({
                            data: {
                                orderItemId: createdItem.id,
                                addonProductItemId: a.addonProductItemId,
                                quantity: a.quantity,
                                unitPrice: a.unitPrice,
                            },
                        });
                    }
                }

                // return full order with items and addons
                return prisma.order.findUnique({ where: { id: order.id }, include: { items: { include: { productItem: true, addons: { include: { addonProductItem: true } } } }, payment: true } });
            });

            return created;
        }),

    // List orders for current user
    listMyOrders: protectedProcedure
        .input(z.object({
            take: z.number().optional().default(20),
            skip: z.number().optional().default(0),
            status: z.array(z.nativeEnum(OrderStatus)).optional(),
        }))
        .query(({ ctx, input }) => {
            const where: any = { userId: ctx.user!.id }
            if (input.status) {
                where.status = { in: input.status };
            }

            return ctx.prisma.order.findMany({
                where,
                take: input.take, skip: input.skip,
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
                        }
                    }
                }
            });
        }),

    listMyOrdersInfinite: protectedProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(20),
            cursor: z.number().default(0), // skip
            status: z.enum(Object.values(OrderStatus)).optional(),
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const skip = input.cursor;

            const where: any = { userId: ctx.user!.id }
            if (input.status) {
                where.status = input.status;
            }

            const items = await ctx.prisma.order.findMany({
                where,
                take: limit + 1, // fetch one more
                skip: skip,
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
                        }
                    }
                }
            });

            let nextCursor: number | undefined = undefined;
            if (items.length > limit) {
                items.pop();
                nextCursor = skip + limit;
            }

            return {
                items,
                nextCursor,
            };
        }),

    getOrder: protectedProcedure
        .input(z.object({
            id: z.string()
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.order.findFirst({
                where: { id: input.id, userId: ctx.user!.id },
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
                            area: {
                                select: {
                                    id: true,
                                    name: true,
                                    state: true,
                                }
                            }
                        }
                    },
                    items: {
                        include: {
                            productItem: {
                                include: {
                                    product: {
                                        select: {
                                            id: true,
                                            name: true,
                                        }
                                    }
                                }
                            },
                            addons: {
                                include: {
                                    addonProductItem: {
                                        include: {
                                            product: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    payment: true,
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

    // Get order broken down by packs (groupKey). Each pack contains main item(s) and their addons.
    // Useful for rendering the user's tray and computing payable amounts grouped as packs.
    getOrderPacks: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            // load order with items and addons (+ productItem details)
            const order = await ctx.prisma.order.findFirst({
                where: { id: input.id, userId: ctx.user!.id },
                include: {
                    items: {
                        include: {
                            productItem: true,
                            addons: { include: { addonProductItem: true } },
                        },
                    },
                },
            });
            if (!order) throw new Error("Order not found");

            // Group items by groupKey (fallback to item id when groupKey is null)
            const groups = new Map<string, any>();

            for (const it of order.items) {
                const key = it.groupKey ?? it.id;
                if (!groups.has(key)) {
                    groups.set(key, {
                        groupKey: it.groupKey ?? null,
                        items: [],
                        addons: [],
                        packTotal: 0,
                    });
                }

                const pack = groups.get(key);

                // main item representation
                pack.items.push({
                    id: it.id,
                    productItem: it.productItem,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    totalPrice: it.totalPrice,
                });

                // accumulate addons (each addon references a ProductItem)
                for (const a of it.addons ?? []) {
                    const addonEntry = {
                        id: a.id,
                        addonProductItem: a.addonProductItem,
                        quantity: a.quantity,
                        unitPrice: a.unitPrice,
                        totalPrice: a.unitPrice * a.quantity,
                    };
                    pack.addons.push(addonEntry);
                }

                // item.totalPrice already includes the item's unit price and any addon totals
                pack.packTotal += Number(it.totalPrice);
            }

            // Convert groups map to an array
            const packs = Array.from(groups.values());

            return {
                orderId: order.id,
                vendorId: order.vendorId,
                currency: order.currency,
                totalAmount: order.totalAmount,
                packs,
            };
        }),

    // Admin/restaurant update status
    updateStatus: adminProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum(Object.values(OrderStatus))
        })).mutation(({ ctx, input }) => {
            return ctx.prisma.order.update({
                where: { id: input.id },
                data: { status: input.status }
            });
        }),

    // Vendor update status for their own orders
    updateMyOrderStatus: vendorProcedure
        .input(z.object({
            id: z.string(),
            status: z.enum(Object.values(OrderStatus))
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;

            // Find vendor owned by user
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });
            if (!vendor) throw new Error("Vendor not found");

            // Verify order belongs to vendor
            const order = await ctx.prisma.order.findUnique({
                where: { id: input.id }
            });
            if (!order) throw new Error("Order not found");
            if (order.vendorId !== vendor.id) {
                throw new Error("Unauthorized: Order does not belong to your vendor");
            }

            return ctx.prisma.order.update({
                where: { id: input.id },
                data: { status: input.status }
            });
        }),
});
