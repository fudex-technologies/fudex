import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";
import { WalletTransactionSource } from "@prisma/client";
import { WalletService } from "./service";
import prisma from "@/lib/prisma";

export const walletRouter = createTRPCRouter({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;
        const wallet = await WalletService.getOrCreateWallet(userId);
        return {
            balance: wallet.balance.toNumber(),
            isActive: wallet.isActive,
        };
    }),

    getTransactions: protectedProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(20),
                cursor: z.string().nullish(),
                sourceType: z.nativeEnum(WalletTransactionSource).optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { limit, cursor, sourceType } = input;
            const userId = ctx.user.id;

            const wallet = await WalletService.getOrCreateWallet(userId);

            const items = await prisma.walletTransaction.findMany({
                take: limit + 1,
                where: {
                    walletId: wallet.id,
                    ...(sourceType ? { sourceType } : {}),
                },
                cursor: cursor ? { id: cursor } : undefined,
                orderBy: {
                    createdAt: "desc",
                },
            });

            let nextCursor: typeof cursor | undefined = undefined;
            if (items.length > limit) {
                const nextItem = items.pop();
                nextCursor = nextItem!.id;
            }

            return {
                items: items.map((item) => ({
                    ...item,
                    amount: item.amount.toNumber(),
                })),
                nextCursor,
            };
        }),

    initializeFunding: protectedProcedure
        .input(
            z.object({
                amount: z.number().positive(),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const { amount } = input;
            const userId = ctx.user.id;

            // Generate a unique provider reference
            const providerRef = `WF-${userId}-${Date.now()}`;

            await WalletService.initializeFunding({
                userId,
                amount,
                providerRef,
            });

            return {
                providerRef,
                amount,
                email: ctx.user.email,
            };
        }),

    adminCredit: adminProcedure
        .input(
            z.object({
                userId: z.string(),
                amount: z.number().positive(),
                reason: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const { userId, amount, reason } = input;
            return WalletService.creditWallet({
                userId,
                amount,
                sourceType: WalletTransactionSource.ADMIN_ADJUSTMENT,
                reference: `ADMIN-${userId}-${Date.now()}`,
            });
        }),
});
