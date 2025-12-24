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
});
