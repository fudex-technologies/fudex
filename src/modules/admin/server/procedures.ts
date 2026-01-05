import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
    // List users (admin only)
    listUsers: adminProcedure
        .input(z.object({
            take: z.number().optional().default(50),
            skip: z.number().optional().default(0)
        })).query(({ ctx, input }) => {
            return ctx.prisma.user.findMany({ take: input.take, skip: input.skip, orderBy: { createdAt: "desc" } });
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
                    city: input.city,
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
                        city: input.city,
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
});
