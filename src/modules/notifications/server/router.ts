import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { NotificationService } from './service';
import prisma from '@/lib/prisma';

export const notificationRouter = createTRPCRouter({
    subscribe: protectedProcedure
        .input(
            z.object({
                endpoint: z.string(),
                keys: z.object({
                    p256dh: z.string(),
                    auth: z.string(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.session.user;

            // Check if subscription already exists to avoid duplicates
            const existing = await prisma.pushSubscription.findUnique({
                where: { endpoint: input.endpoint },
            });

            if (existing) {
                if (existing.userId !== userId) {
                    // Update owner if endpoint exists but user changed (rare but possible)
                    await prisma.pushSubscription.update({
                        where: { id: existing.id },
                        data: { userId },
                    });
                }
                return { success: true, id: existing.id };
            }

            await prisma.pushSubscription.create({
                data: {
                    userId,
                    endpoint: input.endpoint,
                    p256dh: input.keys.p256dh,
                    auth: input.keys.auth,
                },
            });

            return { success: true };
        }),

    unsubscribe: protectedProcedure
        .input(z.object({ endpoint: z.string() }))
        .mutation(async ({ input }) => {
            await prisma.pushSubscription.deleteMany({
                where: { endpoint: input.endpoint },
            });
            return { success: true };
        }),

    // Dev/Admin tool to test notifications
    testNotification: protectedProcedure
        .input(z.object({ userId: z.string().optional() }))
        .mutation(async ({ ctx, input }) => {
            const targetUserId = input.userId || ctx.session.user.id;

            await NotificationService.sendToUser(targetUserId, {
                title: 'Test Notification',
                body: 'This is a test notification from Fudex.',
                url: '/profile',
            });

            return { success: true };
        }),
});
