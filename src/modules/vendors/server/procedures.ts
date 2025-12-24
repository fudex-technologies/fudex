import { VendorWhereInput } from "@/generated/prisma/models";
import { createTRPCRouter, publicProcedure, adminProcedure, operatorProcedure } from "@/trpc/init";
import { z } from "zod";

export const vendorRouter = createTRPCRouter({
    // Public listings with optional search / pagination
    list: publicProcedure
        .input(z.object({
            q: z.string().optional(),
            take: z.number().optional().default(20),
            skip: z.number().optional().default(0)
        }))
        .query(({ ctx, input }) => {
            const where: VendorWhereInput = input.q ? {
                OR: [{
                    name: { contains: input.q, mode: "insensitive" }
                },
                { description: { contains: input.q, mode: "insensitive" } }
                ]
            } : {};

            return ctx.prisma.vendor.findMany({ where, take: input.take, skip: input.skip, orderBy: { createdAt: "desc" } });
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.vendor.findUnique({ where: { id: input.id }, include: { products: true } });
        }),

    getBySlug: publicProcedure
        .input(z.object({ slug: z.string() }))
        .query(({ ctx, input }) => {
            return ctx.prisma.vendor.findUnique({ where: { slug: input.slug }, include: { products: true } });
        }),

    // Product item listing for a vendor
    listProductItems: publicProcedure
        .input(z.object({
            vendorId: z.string(),
            take: z.number().optional().default(50)
        }))
        .query(({ ctx, input }) => {
            return ctx.prisma.productItem.findMany({ where: { vendorId: input.vendorId, isActive: true }, take: input.take, orderBy: { createdAt: "desc" } });
        }),

    // Create vendor - restricted (admin or vendors). Kept simple for now.
    createVendor: operatorProcedure
        .input(z.object({
            name: z.string(),
            slug: z.string(),
            description: z.string().optional(),
            phone: z.string().optional(),
            email: z.string().optional(),
            address: z.string().optional(),
            city: z.string().optional(),
            coverImage: z.string().optional()
        }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.vendor.create({ data: input });
        }),

    // Create/Update product items (admin/vendor)
    createProductItem: operatorProcedure
        .input(
            z.object({
                vendorId: z.string(),
                productId: z.string().optional(),
                name: z.string(),
                slug: z.string(),
                description: z.string().optional(),
                price: z.number(),
                currency: z.string().optional().default("NGN"),
                images: z.array(z.string()).optional(),
                isActive: z.boolean().optional().default(true),
            })
        )
        .mutation(({ ctx, input }) => {
            return ctx.prisma.productItem.create({ data: { ...input } });
        }),
});
