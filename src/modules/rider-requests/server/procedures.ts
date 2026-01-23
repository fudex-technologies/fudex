import { createTRPCRouter, protectedProcedure, adminProcedure, vendorProcedure } from "@/trpc/init";
import { z } from "zod";
import { RiderRequestStatus, SettlementStatus } from "@prisma/client";
import { calculateDeliveryFee } from "@/lib/deliveryFeeCalculator";
import { TRPCError } from "@trpc/server";

export const riderRequestRouter = createTRPCRouter({
    requestRider: vendorProcedure
        .input(
            z.object({
                customers: z.array(
                    z.object({
                        customerName: z.string(),
                        customerPhone: z.string(),
                        areaId: z.string(),
                        customerAddress: z.string(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.user!.id;

            // Find vendor owned by user
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: userId }
            });

            if (!vendor) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Vendor not found",
                });
            }

            // Calculate fees and prepare items
            const itemsWithFees = await Promise.all(
                input.customers.map(async (customer) => {
                    const deliveryFee = await calculateDeliveryFee(ctx.prisma, customer.areaId);
                    return {
                        ...customer,
                        deliveryFee,
                    };
                })
            );

            const totalFee = itemsWithFees.reduce((sum, item) => sum + item.deliveryFee, 0);

            // Create RiderRequest and RiderRequestItems in a transaction
            const riderRequest = await ctx.prisma.$transaction(async (prisma) => {
                const request = await prisma.riderRequest.create({
                    data: {
                        vendorId: vendor.id,
                        totalFee,
                        status: "PENDING",
                        settlementStatus: "UNSETTLED",
                        items: {
                            create: itemsWithFees.map((item) => ({
                                customerName: item.customerName,
                                customerPhone: item.customerPhone,
                                customerAddress: item.customerAddress,
                                areaId: item.areaId,
                                deliveryFee: item.deliveryFee,
                            })),
                        },
                    },
                    include: {
                        items: true,
                    },
                });
                return request;
            });

            return riderRequest;
        }),

    listMyRiderRequests: vendorProcedure
        .input(z.object({
            settlementStatus: z.array(z.nativeEnum(SettlementStatus)).optional(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: ctx.user!.id }
            });
            if (!vendor) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" });

            const where: any = { vendorId: vendor.id };
            if (input?.settlementStatus) {
                where.settlementStatus = { in: input.settlementStatus };
            }

            return ctx.prisma.riderRequest.findMany({
                where,
                include: {
                    items: {
                        include: {
                            area: true
                        }
                    },
                    assignedRider: true,
                },
                orderBy: { createdAt: "desc" },
            });
        }),

    notifySettlementPayment: vendorProcedure
        .input(z.object({
            requestIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            const vendor = await ctx.prisma.vendor.findFirst({
                where: { ownerId: ctx.user!.id }
            });
            if (!vendor) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" });

            // Update status to PENDING_VERIFICATION
            await ctx.prisma.riderRequest.updateMany({
                where: {
                    id: { in: input.requestIds },
                    vendorId: vendor.id,
                    settlementStatus: "UNSETTLED",
                },
                data: {
                    settlementStatus: "PENDING_VERIFICATION",
                },
            });

            // TODO: In a real app, send an email to admin here.
            // sendAdminSettlementNotification(vendor.name, input.requestIds.length);

            return { success: true };
        }),

    listAdminSettlements: adminProcedure
        .input(z.object({
            settlementStatus: z.nativeEnum(SettlementStatus).optional(),
        }).optional())
        .query(async ({ ctx, input }) => {
            const where: any = {};
            if (input?.settlementStatus) {
                where.settlementStatus = input.settlementStatus;
            } else {
                where.settlementStatus = { in: ["UNSETTLED", "PENDING_VERIFICATION"] };
            }

            return ctx.prisma.riderRequest.findMany({
                where,
                include: {
                    vendor: true,
                    items: true,
                },
                orderBy: { createdAt: "desc" },
            });
        }),

    approveSettlements: adminProcedure
        .input(z.object({
            requestIds: z.array(z.string()),
        }))
        .mutation(async ({ ctx, input }) => {
            await ctx.prisma.riderRequest.updateMany({
                where: {
                    id: { in: input.requestIds },
                },
                data: {
                    settlementStatus: "SETTLED",
                },
            });

            return { success: true };
        }),

    updateRequestStatus: adminProcedure
        .input(z.object({
            requestId: z.string(),
            status: z.nativeEnum(RiderRequestStatus),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.riderRequest.update({
                where: { id: input.requestId },
                data: { status: input.status },
            });
        }),

    assignRider: adminProcedure
        .input(z.object({
            requestId: z.string(),
            riderId: z.string(),
        }))
        .mutation(async ({ ctx, input }) => {
            return ctx.prisma.riderRequest.update({
                where: { id: input.requestId },
                data: {
                    assignedRiderId: input.riderId,
                    status: "ASSIGNED",
                },
            });
        }),
});
