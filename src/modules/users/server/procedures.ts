import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/trpc/init";
import { z } from "zod";

export const userRouter = createTRPCRouter({
    // Return resolved session (null if unauthenticated)
    session: publicProcedure.query(({ ctx }) => ctx.session),

    // Profile: read own profile and compute DiceBear avatar URL (no upload)
    profile: protectedProcedure.query(({ ctx }) => {
        const user = ctx.user!;
        // DiceBear avatar URL using user id as seed (no image upload)
        const avatarUrl = `https://api.dicebear.com/8.x/identicon/svg?seed=${encodeURIComponent(user.id)}`;
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image ?? avatarUrl,
            avatarUrl,
        };
    }),

    updateProfile: protectedProcedure
        .input(
            z.object({
                name: z.string().min(1).optional(),
                image: z.string().url().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;
            const data: any = {};
            if (input.name) data.name = input.name;
            if (input.image) data.image = input.image;
            const updated = await ctx.prisma.user.update({ where: { id: userId }, data });
            return updated;
        }),

    // Addresses CRUD for the authenticated user
    listAddresses: protectedProcedure.query(({ ctx }) => {
        return ctx.prisma.address.findMany({ where: { userId: ctx.user!.id }, orderBy: { createdAt: "desc" } });
    }),

    createAddress: protectedProcedure
        .input(
            z.object({
                label: z.string().optional(),
                line1: z.string(),
                line2: z.string().optional(),
                city: z.string(),
                state: z.string().optional(),
                postalCode: z.string().optional(),
                country: z.string().optional(),
                lat: z.number().optional(),
                lng: z.number().optional(),
                isDefault: z.boolean().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (input.isDefault) {
                // unset previous defaults
                await ctx.prisma.address.updateMany({ where: { userId: ctx.user!.id, isDefault: true }, data: { isDefault: false } });
            }
            const created = await ctx.prisma.address.create({ data: { ...input, userId: ctx.user!.id } });
            return created;
        }),

    updateAddress: protectedProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                label: z.string().optional(),
                line1: z.string().optional(),
                line2: z.string().optional(),
                city: z.string().optional(),
                state: z.string().optional(),
                postalCode: z.string().optional(),
                country: z.string().optional(),
                lat: z.number().optional(),
                lng: z.number().optional(),
                isDefault: z.boolean().optional()
            })
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.data.isDefault) {
                await ctx.prisma.address.updateMany({
                    where: { userId: ctx.user!.id, isDefault: true },
                    data: { isDefault: false }
                });
            }
            const updated = await ctx.prisma.address.update({
                where: { id: input.id },
                data: input.data
            });
            return updated;
        }),

    deleteAddress: protectedProcedure.input(z.object({ id: z.string() })).mutation(({ ctx, input }) => {
        return ctx.prisma.address.delete({ where: { id: input.id } });
    }),
});