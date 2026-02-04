import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
    // ========== USER MANAGEMENT ==========

    // List users with infinite scroll and search
    listUsersInfinite: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(),
            q: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const { cursor, q } = input;

            const where: any = {};
            if (q) {
                where.OR = [
                    { name: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                    { phone: { contains: q, mode: "insensitive" } },
                    { firstName: { contains: q, mode: "insensitive" } },
                    { lastName: { contains: q, mode: "insensitive" } }
                ];
            }

            const items = await ctx.prisma.user.findMany({
                where,
                take: limit + 1,
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    roles: true,
                    vendors: {
                        select: {
                            id: true,
                            name: true,
                            approvalStatus: true
                        }
                    },
                    _count: {
                        select: {
                            orders: true,
                            reviews: true
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

    // Get detailed user information
    getUserDetails: adminProcedure
        .input(z.object({ userId: z.string() }))
        .query(async ({ ctx, input }) => {
            const user = await ctx.prisma.user.findUnique({
                where: { id: input.userId },
                include: {
                    roles: true,
                    vendors: {
                        include: {
                            _count: {
                                select: {
                                    products: true,
                                    orders: true
                                }
                            }
                        }
                    },
                    orders: {
                        take: 5,
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            totalAmount: true,
                            status: true,
                            createdAt: true
                        }
                    },
                    reviews: {
                        take: 5,
                        orderBy: { createdAt: "desc" }
                    },
                    _count: {
                        select: {
                            orders: true,
                            reviews: true,
                            addresses: true
                        }
                    }
                }
            });

            if (!user) {
                throw new Error("User not found");
            }

            return user;
        }),

    // Update user information
    updateUser: adminProcedure
        .input(z.object({
            userId: z.string(),
            name: z.string().optional(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const { userId, ...data } = input;

            // Check if email is being changed and if it's already in use
            if (data.email) {
                const existing = await ctx.prisma.user.findFirst({
                    where: {
                        email: data.email,
                        NOT: { id: userId }
                    }
                });
                if (existing) {
                    throw new Error("Email already in use by another user");
                }
            }

            return ctx.prisma.user.update({
                where: { id: userId },
                data
            });
        }),

    // Deactivate/Delete user (soft delete)
    deactivateUser: adminProcedure
        .input(z.object({ userId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // For now, we'll just mark email as null or add a deleted flag
            // You might want to add a 'deletedAt' or 'isActive' field to your schema
            return ctx.prisma.user.update({
                where: { id: input.userId },
                data: {
                    // Add your deactivation logic here
                    // For example: isActive: false, deletedAt: new Date()
                }
            });
        }),

    // Assign role to a user
    assignRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.enum(["CUSTOMER", "VENDOR", "OPERATOR", "RIDER", "SUPER_ADMIN"])
        })).mutation(({ ctx, input }) => {
            return ctx.prisma.userRole.create({ data: { userId: input.userId, role: input.role } });
        }),

    // Remove role
    removeRole: adminProcedure
        .input(z.object({
            userId: z.string(),
            role: z.enum(["CUSTOMER", "VENDOR", "OPERATOR", "RIDER", "SUPER_ADMIN"])
        })).mutation(async ({ ctx, input }) => {
            return ctx.prisma.userRole.deleteMany({ where: { userId: input.userId, role: input.role } });
        }),

    // Create vendor
    createVendor: adminProcedure
        .input(z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            ownerId: z.string().optional(),
            city: z.string().optional(),
            coverImage: z.string().optional()
        })).mutation(({ ctx, input }) => {
            return ctx.prisma.vendor.create({
                data: {
                    name: input.name,
                    slug: input.slug,
                    description: input.description,
                    ownerId: input.ownerId,
                    // city: input.city,
                    coverImage: input.coverImage
                }
            });
        }),

    // Assign vendor role and create vendor profile by email
    assignVendorRoleAndCreateProfile: adminProcedure
        .input(z.object({
            email: z.string().email(),
            vendorName: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            city: z.string().optional(),
            coverImage: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            // Find user by email
            const user = await ctx.prisma.user.findUnique({
                where: { email: input.email }
            });

            if (!user) {
                throw new Error("User not found with this email");
            }

            // Check if user already has vendor role
            const existingVendorRole = await ctx.prisma.userRole.findFirst({
                where: {
                    userId: user.id,
                    role: "VENDOR"
                }
            });

            if (existingVendorRole) {
                throw new Error("User already has vendor role");
            }

            // Check if user already owns a vendor
            const existingVendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: user.id }
            });

            if (existingVendor) {
                throw new Error("User already owns a vendor");
            }

            // Create vendor and assign role in a transaction
            return ctx.prisma.$transaction(async (prisma) => {
                // Assign vendor role
                await prisma.userRole.create({
                    data: {
                        userId: user.id,
                        role: "VENDOR"
                    }
                });

                // Create vendor profile
                const vendor = await prisma.vendor.create({
                    data: {
                        name: input.vendorName,
                        slug: input.slug,
                        description: input.description,
                        ownerId: user.id,
                        // city: input.city,
                        coverImage: input.coverImage
                    }
                });

                return vendor;
            });
        }),

    // Assign operator to area
    assignOperatorToArea: adminProcedure
        .input(z.object({
            operatorId: z.string(),
            areaId: z.string()
        })).mutation(async ({ ctx, input }) => {
            return ctx.prisma.operator.update({
                where: { id: input.operatorId }, data: { areaId: input.areaId }
            });
        }),

    // ========== AREA MANAGEMENT ==========

    // List all areas
    listAreas: adminProcedure
        .input(z.object({
            take: z.number().optional().default(100),
            skip: z.number().optional().default(0),
            state: z.string().optional()
        })).query(({ ctx, input }) => {
            const where: any = {};
            if (input.state) {
                where.state = input.state;
            }
            return ctx.prisma.area.findMany({
                where,
                take: input.take,
                skip: input.skip,
                include: {
                    _count: {
                        select: {
                            deliveryFees: true,
                            addresses: true
                        }
                    }
                },
                orderBy: [{ state: "asc" }, { name: "asc" }]
            });
        }),

    // Get area by ID
    getAreaById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.area.findUnique({
                where: { id: input.id },
                include: {
                    deliveryFees: {
                        orderBy: { startTime: "asc" }
                    }
                }
            });
        }),

    // Create area
    createArea: adminProcedure
        .input(z.object({
            name: z.string(),
            state: z.string(),
            meta: z.any().optional()
        })).mutation(async ({ ctx, input }) => {
            return ctx.prisma.area.create({
                data: {
                    name: input.name,
                    state: input.state,
                    meta: input.meta
                }
            });
        }),

    // Update area
    updateArea: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            state: z.string().optional(),
            meta: z.any().optional()
        })).mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.area.update({
                where: { id },
                data
            });
        }),

    // Delete area
    deleteArea: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.area.delete({
                where: { id: input.id }
            });
        }),

    // ========== DELIVERY FEE RULES MANAGEMENT ==========

    // List delivery fee rules for an area
    listDeliveryFeeRules: adminProcedure
        .input(z.object({
            areaId: z.string()
        })).query(({ ctx, input }) => {
            return ctx.prisma.deliveryFeeRule.findMany({
                where: { areaId: input.areaId },
                orderBy: { startTime: "asc" },
                include: {
                    area: {
                        select: {
                            id: true,
                            name: true,
                            state: true
                        }
                    }
                }
            });
        }),

    // Create delivery fee rule
    createDeliveryFeeRule: adminProcedure
        .input(z.object({
            areaId: z.string(),
            startTime: z.string(), // "08:00"
            endTime: z.string(), // "18:00"
            fee: z.number().min(0)
        })).mutation(async ({ ctx, input }) => {
            return ctx.prisma.deliveryFeeRule.create({
                data: input
            });
        }),

    // Update delivery fee rule
    updateDeliveryFeeRule: adminProcedure
        .input(z.object({
            id: z.string(),
            startTime: z.string().optional(),
            endTime: z.string().optional(),
            fee: z.number().min(0).optional()
        })).mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.deliveryFeeRule.update({
                where: { id },
                data
            });
        }),

    // Delete delivery fee rule
    deleteDeliveryFeeRule: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.deliveryFeeRule.delete({
                where: { id: input.id }
            });
        }),

    // ========== PLATFORM SETTINGS MANAGEMENT ==========

    // Get platform setting
    getPlatformSetting: adminProcedure
        .input(z.object({ key: z.string() }))
        .query(async ({ ctx, input }) => {
            const setting = await ctx.prisma.platformSetting.findUnique({
                where: { key: input.key }
            });
            return setting;
        }),

    // Get all platform settings
    listPlatformSettings: adminProcedure
        .query(async ({ ctx }) => {
            return ctx.prisma.platformSetting.findMany({
                orderBy: { key: "asc" }
            });
        }),

    // Set platform setting
    setPlatformSetting: adminProcedure
        .input(z.object({
            key: z.string(),
            value: z.any() // JSON value
        })).mutation(async ({ ctx, input }) => {
            return ctx.prisma.platformSetting.upsert({
                where: { key: input.key },
                update: { value: input.value },
                create: {
                    key: input.key,
                    value: input.value
                }
            });
        }),

    // Delete platform setting
    deletePlatformSetting: adminProcedure
        .input(z.object({ key: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.platformSetting.delete({
                where: { key: input.key }
            });
        }),

    // ========== DASHBOARD STATISTICS ==========

    // Get overview statistics
    getDashboardOverview: adminProcedure
        .query(async ({ ctx }) => {
            const [
                totalRevenue,
                totalOrders,
                totalUsers,
                totalVendors,
                activeVendors,
                totalRiders,
                pendingVendorRequests,
                confirmedReferrals
            ] = await Promise.all([
                ctx.prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: { status: "COMPLETED" }
                }),
                ctx.prisma.order.count(),
                ctx.prisma.user.count(),
                ctx.prisma.vendor.count(),
                ctx.prisma.vendor.count({ where: { approvalStatus: "APPROVED" } }),
                ctx.prisma.rider.count(),
                ctx.prisma.vendor.count({ where: { approvalStatus: "PENDING", submittedForApproval: true } }),
                ctx.prisma.referral.count({ where: { status: "CONFIRMED" } })
            ]);

            // Get revenue for last 30 days vs previous 30 days for trend
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            const [currentMonthRevenue, previousMonthRevenue] = await Promise.all([
                ctx.prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: { status: "COMPLETED", createdAt: { gte: thirtyDaysAgo } }
                }),
                ctx.prisma.payment.aggregate({
                    _sum: { amount: true },
                    where: { status: "COMPLETED", createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } }
                })
            ]);

            const revChange = previousMonthRevenue._sum.amount
                ? ((currentMonthRevenue._sum.amount || 0) - previousMonthRevenue._sum.amount) / previousMonthRevenue._sum.amount * 100
                : 0;

            return {
                totalRevenue: totalRevenue._sum.amount || 0,
                revenueTrend: revChange,
                totalOrders,
                totalUsers,
                totalVendors,
                activeVendors,
                totalRiders,
                pendingVendorRequests,
                confirmedReferrals
            };
        }),

    // Get data for charts
    getDashboardCharts: adminProcedure
        .input(z.object({
            period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d")
        }))
        .query(async ({ ctx, input }) => {
            const now = new Date();
            let startDate = new Date();
            let interval: "day" | "week" | "month" = "day";

            if (input.period === "7d") startDate.setDate(now.getDate() - 7);
            else if (input.period === "30d") startDate.setDate(now.getDate() - 30);
            else if (input.period === "90d") {
                startDate.setDate(now.getDate() - 90);
                interval = "week";
            }
            else if (input.period === "1y") {
                startDate.setFullYear(now.getFullYear() - 1);
                interval = "month";
            }
            else {
                startDate = new Date(0); // All time
                interval = "month";
            }

            const orders = await ctx.prisma.order.findMany({
                where: { createdAt: { gte: startDate } },
                select: {
                    createdAt: true,
                    totalAmount: true,
                    status: true,
                    payment: {
                        select: {
                            status: true
                        }
                    }
                },
                orderBy: { createdAt: "asc" }
            });

            // Process data for charts (grouping by date)
            const chartData: Record<string, { date: string, orders: number, revenue: number }> = {};

            orders.forEach(order => {
                let key = "";
                const d = new Date(order.createdAt);
                if (interval === "day") {
                    key = d.toISOString().split('T')[0];
                } else if (interval === "week") {
                    // Start of week
                    const first = d.getDate() - d.getDay();
                    const startOfWeek = new Date(d.setDate(first));
                    key = startOfWeek.toISOString().split('T')[0];
                } else {
                    key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
                }

                if (!chartData[key]) {
                    chartData[key] = { date: key, orders: 0, revenue: 0 };
                }
                chartData[key].orders++;
                // Only count revenue for COMPLETED payments
                if (order.status !== "CANCELLED" && order.payment?.status === "COMPLETED") {
                    chartData[key].revenue += order.totalAmount;
                }
            });

            return Object.values(chartData);
        }),

    // Get top performing vendors
    getTopVendors: adminProcedure
        .input(z.object({ limit: z.number().default(5) }))
        .query(async ({ ctx, input }) => {
            const vendors = await ctx.prisma.vendor.findMany({
                take: input.limit,
                include: {
                    _count: { select: { orders: true } },
                },
                orderBy: { orders: { _count: "desc" } }
            });

            // Also get revenue per vendor (simplified, might need more complex aggregation if many orders)
            const vendorsWithRevenue = await Promise.all(vendors.map(async (v) => {
                const revenue = await ctx.prisma.order.aggregate({
                    _sum: { totalAmount: true },
                    where: {
                        vendorId: v.id,
                        status: { not: "CANCELLED" },
                        payment: { status: "COMPLETED" }
                    }
                });
                return {
                    ...v,
                    revenue: revenue._sum.totalAmount || 0,
                    orderCount: v._count.orders
                };
            }));

            return vendorsWithRevenue.sort((a, b) => b.revenue - a.revenue);
        }),

    // Get recent activity
    getRecentActivity: adminProcedure
        .query(async ({ ctx }) => {
            const [recentOrders, recentUsers, recentVendors] = await Promise.all([
                ctx.prisma.order.findMany({
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: { user: { select: { name: true } }, vendor: { select: { name: true } } }
                }),
                ctx.prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
                ctx.prisma.vendor.findMany({ take: 5, orderBy: { createdAt: "desc" } })
            ]);

            return {
                recentOrders,
                recentUsers,
                recentVendors
            };
        }),

    // ========== VENDOR & MENU MANAGEMENT ==========

    // List all vendors with infinite scroll (paginated)
    listVendorsInfinite: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish(), // vendorId
            q: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const { cursor, q } = input;

            const where: any = {};
            if (q) {
                where.OR = [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    { slug: { contains: q, mode: "insensitive" } }
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

    // Update vendor (Full admin power)
    updateVendorByAdmin: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().email().optional(),
            approvalStatus: z.enum(["PENDING", "APPROVED", "DECLINED"]).optional(),
            coverImage: z.string().optional(),
            areaId: z.string().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.vendor.update({
                where: { id },
                data
            });
        }),

    // List categories for a vendor
    listVendorCategories: adminProcedure
        .input(z.object({ vendorId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.vendorCategory.findMany({
                where: { vendorId: input.vendorId },
                include: { category: true }
            });
        }),

    // List products for a vendor
    listVendorProducts: adminProcedure
        .input(z.object({
            vendorId: z.string(),
            limit: z.number().min(1).max(100).default(50),
            cursor: z.string().nullish()
        }))
        .query(async ({ ctx, input }) => {
            const limit = input.limit;
            const items = await ctx.prisma.product.findMany({
                where: { vendorId: input.vendorId },
                take: limit + 1,
                cursor: input.cursor ? { id: input.cursor } : undefined,
                orderBy: { createdAt: "desc" },
                include: {
                    items: {
                        where: { isActive: true },
                        include: {
                            categories: { include: { category: true } }
                        }
                    }
                }
            });

            let nextCursor: string | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }
            return {
                items,
                nextCursor,
            };
        }),

    // Manage Product Item (Admin power)
    updateProductItemByAdmin: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
            price: z.number().optional(),
            inStock: z.boolean().optional(),
            isActive: z.boolean().optional(),
            images: z.array(z.string()).optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;
            return ctx.prisma.productItem.update({
                where: { id },
                data
            });
        }),

    // Manage Category for Product Item
    toggleProductItemCategory: adminProcedure
        .input(z.object({
            productItemId: z.string(),
            categoryId: z.string(),
            action: z.enum(["add", "remove"])
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.action === "add") {
                return ctx.prisma.productItemCategory.upsert({
                    where: { productItemId_categoryId: { productItemId: input.productItemId, categoryId: input.categoryId } },
                    update: {},
                    create: { productItemId: input.productItemId, categoryId: input.categoryId }
                });
            } else {
                return ctx.prisma.productItemCategory.deleteMany({
                    where: { productItemId: input.productItemId, categoryId: input.categoryId }
                });
            }
        }),

    // Manage Vendor Category
    toggleVendorCategory: adminProcedure
        .input(z.object({
            vendorId: z.string(),
            categoryId: z.string(),
            action: z.enum(["add", "remove"])
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.action === "add") {
                return ctx.prisma.vendorCategory.upsert({
                    where: { vendorId_categoryId: { vendorId: input.vendorId, categoryId: input.categoryId } },
                    update: {},
                    create: { vendorId: input.vendorId, categoryId: input.categoryId }
                });
            } else {
                return ctx.prisma.vendorCategory.deleteMany({
                    where: { vendorId: input.vendorId, categoryId: input.categoryId }
                });
            }
        }),

    // Global Category Management
    listCategories: adminProcedure
        .input(z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(),
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

    createCategory: adminProcedure
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

    updateCategory: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            slug: z.string().optional(),
            image: z.string().optional(),
        }))
        .mutation(({ ctx, input }) => {
            const { id, ...data } = input;
            if (data.name && !data.slug) {
                data.slug = data.name.toLowerCase().replace(/ /g, "-");
            }
            return ctx.prisma.category.update({
                where: { id },
                data
            });
        }),

    deleteCategory: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.category.delete({
                where: { id: input.id }
            });
        }),
});
