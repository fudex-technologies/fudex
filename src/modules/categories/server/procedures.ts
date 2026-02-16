import { createTRPCRouter, publicProcedure, operatorProcedure } from '@/trpc/init';
import { z } from 'zod';

export const categoryRouter = createTRPCRouter({
  list: publicProcedure
    .input(z.object({ take: z.number().optional().default(100) }).optional())
    .query(({ ctx, input }) => {
      const take = input?.take ?? 100;
      return ctx.prisma.category.findMany({
        take,
        orderBy: [{ arrangementIndex: "asc" }, { id: "asc" }]
      });
    }),

  create: operatorProcedure
    .input(z.object({ name: z.string(), slug: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.category.create({ data: input });
    }),

  // Return categories with vendor and product counts
  listWithCounts: publicProcedure
    .input(z.object({ take: z.number().optional().default(100) }).optional())
    .query(({ ctx, input }) => {
      const take = input?.take ?? 100;
      return ctx.prisma.category.findMany({
        take,
        orderBy: [{ arrangementIndex: "asc" }, { id: "asc" }],
        include: { _count: { select: { vendors: true, items: true } } },
      });
    }),

  // Assign a category to a vendor
  assignToVendor: operatorProcedure
    .input(z.object({ vendorId: z.string(), categoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.vendorCategory.upsert({
        where: { vendorId_categoryId: { vendorId: input.vendorId, categoryId: input.categoryId } as any },
        create: { vendorId: input.vendorId, categoryId: input.categoryId },
        update: {},
      });
    }),

  removeFromVendor: operatorProcedure
    .input(z.object({ vendorId: z.string(), categoryId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.vendorCategory.deleteMany({ where: { vendorId: input.vendorId, categoryId: input.categoryId } });
    }),

  // Assign a category to a product item
  assignToProductItem: operatorProcedure
    .input(z.object({ productItemId: z.string(), categoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.productItemCategory.upsert({
        where: { productItemId_categoryId: { productItemId: input.productItemId, categoryId: input.categoryId } as any },
        create: { productItemId: input.productItemId, categoryId: input.categoryId },
        update: {},
      });
    }),

  removeFromProductItem: operatorProcedure
    .input(z.object({ productItemId: z.string(), categoryId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.productItemCategory.deleteMany({ where: { productItemId: input.productItemId, categoryId: input.categoryId } });
    }),
});

export default categoryRouter;
