import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { NotificationService } from './service';
import prisma from '@/lib/prisma';
import { PAGES_DATA } from '@/data/pagesData';

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
            console.log('[tRPC] Subscribe mutation called');
            console.log('[tRPC] User ID:', ctx.session.user.id);
            console.log('[tRPC] Endpoint:', input.endpoint);

            const { id: userId } = ctx.session.user;

            try {
                // Check if subscription already exists
                const existing = await prisma.pushSubscription.findUnique({
                    where: { endpoint: input.endpoint },
                });

                console.log('[tRPC] Existing subscription:', existing ? 'Found' : 'None');

                if (existing) {
                    if (existing.userId !== userId) {
                        console.log('[tRPC] Updating subscription owner');
                        await prisma.pushSubscription.update({
                            where: { id: existing.id },
                            data: { userId },
                        });
                    }
                    console.log('[tRPC] Returning existing subscription');
                    return { success: true, id: existing.id };
                }

                console.log('[tRPC] Creating new subscription');
                const created = await prisma.pushSubscription.create({
                    data: {
                        userId,
                        endpoint: input.endpoint,
                        p256dh: input.keys.p256dh,
                        auth: input.keys.auth,
                    },
                });

                console.log('[tRPC] Subscription created:', created.id);
                return { success: true, id: created.id };
            } catch (error) {
                console.error('[tRPC] Database error:', error);
                throw new Error(`Failed to save subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
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
                url: PAGES_DATA.profile_page,
            });

            return { success: true };
        }),
});
