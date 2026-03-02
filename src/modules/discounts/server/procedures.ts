import { createTRPCRouter, adminProcedure, protectedProcedure } from '@/trpc/init';
import { z } from 'zod';
import { DiscountType } from '@prisma/client';

export const discountRouter = createTRPCRouter({
    // Create new discount
    createDiscount: adminProcedure
        .input(z.object({
            name: z.string().min(1, "Name is required"),
            description: z.string().optional(),
            type: z.nativeEnum(DiscountType),
            value: z.number().positive("Value must be greater than 0"),
            scope: z.enum(['PRODUCT_ITEM', 'VENDOR', 'PLATFORM', 'CART']),
            productItemId: z.string().optional(),
            vendorId: z.string().optional(),
            usageLimit: z.number().int().positive("Usage limit must be positive").optional(),
            startAt: z.date(),
            endAt: z.date(),
            isActive: z.boolean().default(true),
        }))
        .mutation(async ({ ctx, input }) => {
            // Validation
            if (input.endAt <= input.startAt) {
                throw new Error("End date must be after start date");
            }
            if (input.type === DiscountType.PERCENTAGE && input.value > 100) {
                throw new Error("Percentage discount cannot exceed 100%");
            }
            if (input.scope === 'PRODUCT_ITEM' && !input.productItemId) {
                throw new Error("Product Item must be selected for PRODUCT_ITEM scope");
            }
            if (input.scope === 'VENDOR' && !input.vendorId) {
                throw new Error("Vendor must be selected for VENDOR scope");
            }

            return ctx.prisma.discount.create({
                data: {
                    name: input.name,
                    description: input.description,
                    type: input.type,
                    value: input.value,
                    scope: input.scope as any,
                    productItemId: input.scope === 'PRODUCT_ITEM' ? input.productItemId : null,
                    vendorId: (input.scope === 'VENDOR' || input.scope === 'CART') ? input.vendorId : null,
                    usageLimit: input.usageLimit || null,
                    startAt: input.startAt,
                    endAt: input.endAt,
                    isActive: input.isActive,
                    createdById: ctx.user!.id,
                }
            });
        }),

    // Update existing discount
    updateDiscount: adminProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            value: z.number().positive().optional(),
            usageLimit: z.number().int().positive().optional().nullable(),
            startAt: z.date().optional(),
            endAt: z.date().optional(),
            isActive: z.boolean().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const existing = await ctx.prisma.discount.findUnique({ where: { id: input.id } });
            if (!existing) throw new Error("Discount not found");

            // Constraints checks
            const newStart = input.startAt ?? existing.startAt;
            const newEnd = input.endAt ?? existing.endAt;

            if (newEnd <= newStart) {
                throw new Error("End date must be after start date");
            }

            if (input.value !== undefined && existing.type === DiscountType.PERCENTAGE && input.value > 100) {
                throw new Error("Percentage discount cannot exceed 100%");
            }

            if (input.usageLimit !== undefined && input.usageLimit !== null && input.usageLimit < existing.usageCount) {
                throw new Error(`Cannot reduce limit below current usage count (${existing.usageCount})`);
            }

            return ctx.prisma.discount.update({
                where: { id: input.id },
                data: {
                    name: input.name,
                    description: input.description,
                    value: input.value,
                    usageLimit: input.usageLimit,
                    startAt: input.startAt,
                    endAt: input.endAt,
                    isActive: input.isActive,
                }
            });
        }),

    // Toggle active status
    toggleDiscount: adminProcedure
        .input(z.object({
            id: z.string(),
            isActive: z.boolean()
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.discount.update({
                where: { id: input.id },
                data: { isActive: input.isActive }
            });
        }),

    // Soft delete / delete
    deleteDiscount: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.discount.delete({
                where: { id: input.id }
            });
        }),

    // Get discount by ID
    getDiscountById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.prisma.discount.findUnique({
                where: { id: input.id },
                include: {
                    vendor: { select: { id: true, name: true } },
                    productItem: {
                        select: {
                            id: true,
                            name: true,
                            product: { select: { name: true } }
                        }
                    },
                }
            });
        }),

    // Get calculated cart discount based on subtotal
    getCalculatedCartDiscount: protectedProcedure
        .input(z.object({
            vendorId: z.string(),
            subTotal: z.number()
        }))
        .query(async ({ ctx, input }) => {
            const { DiscountService } = await import("./service");
            return DiscountService.getCalculatedCartDiscount(
                ctx.prisma,
                input.vendorId,
                input.subTotal
            );
        }),

    // List all discounts for admin table
    listDiscounts: adminProcedure
        .input(z.object({
            take: z.number().default(20),
            skip: z.number().default(0),
            status: z.enum(['ACTIVE', 'EXPIRED', 'EXHAUSTED', 'SCHEDULED', 'ALL']).optional().default('ALL'),
            search: z.string().optional()
        }))
        .query(async ({ ctx, input }) => {
            const now = new Date();
            const where: any = {};

            if (input.search) {
                where.name = { contains: input.search, mode: 'insensitive' };
            }

            switch (input.status) {
                case 'ACTIVE':
                    where.isActive = true;
                    where.startAt = { lte: now };
                    where.endAt = { gte: now };
                    // Complex usage limit filter handled post-fetch if needed
                    break;
                case 'SCHEDULED':
                    where.startAt = { gt: now };
                    break;
                case 'EXPIRED':
                    where.endAt = { lt: now };
                    break;
                case 'EXHAUSTED':
                    where.usageLimit = { not: null };
                    break;
            }

            let items = await ctx.prisma.discount.findMany({
                where,
                take: input.status === 'EXHAUSTED' || input.status === 'ACTIVE' ? undefined : input.take,
                skip: input.status === 'EXHAUSTED' || input.status === 'ACTIVE' ? undefined : input.skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    vendor: { select: { name: true } },
                    productItem: { select: { name: true } }
                }
            });

            // Post filter for EXHAUSTED if Prisma lacks strict cross-column compare out of the box
            if (input.status === 'EXHAUSTED') {
                items = items.filter(d => d.usageLimit !== null && d.usageCount >= d.usageLimit!);
                return items.slice(input.skip, input.skip + input.take);
            }

            // Re-apply strict ACTIVE for accuracy
            if (input.status === 'ACTIVE') {
                items = items.filter(d => d.usageLimit === null || d.usageCount < d.usageLimit!);
                return items.slice(input.skip, input.skip + input.take);
            }

            return items;
        }),
});

