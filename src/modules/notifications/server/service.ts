import prisma from '@/lib/prisma';
import webpush from 'web-push';

// Initialize web-push with VAPID keys
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        `mailto:${process.env.VAPID_SUBJECT || 'fudextechnologies@gmail.com'}`,
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn('VAPID keys are missing. Push notifications will not work.');
}

export type NotificationPayload = {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    data?: Record<string, unknown>;
};

export class NotificationService {
    /**
     * Send a push notification to a specific user
     */
    static async sendToUser(userId: string, payload: NotificationPayload) {
        try {
            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId },
            });

            if (subscriptions.length === 0) {
                return { success: false, message: 'No subscriptions found for user' };
            }

            const notifications = subscriptions.map(async (sub) => {
                try {
                    const pushSubscription = {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth,
                        },
                    };

                    await webpush.sendNotification(
                        pushSubscription,
                        JSON.stringify(payload)
                    );

                    return { success: true, subscriptionId: sub.id };
                } catch (error: any) {
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        // Subscription is invalid or expired, remove it
                        console.log(`Removing invalid subscription: ${sub.id}`);
                        await prisma.pushSubscription.delete({
                            where: { id: sub.id },
                        });
                    } else {
                        console.error('Error sending push notification:', error);
                    }
                    return { success: false, error };
                }
            });

            await Promise.all(notifications);
            return { success: true };
        } catch (error) {
            console.error('Error in sendToUser:', error);
            return { success: false, error };
        }
    }

    /**
     * Send a push notification to users with a specific role
     */
    static async sendToRole(role: 'VENDOR' | 'CUSTOMER' | 'OPERATOR' | 'ADMIN', payload: NotificationPayload) {
        // This might be expensive if there are many users, use with caution or pagination
        // For now, finding users with the role and their subscriptions

        // OPTIMIZATION: In a real large scale app, this should be a job queue.
        // Here we will do a direct query for simplicity as per requirements.

        const usersWithRole = await prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        role: role as any
                        // Casting to any to avoid generic Role enum import issues if not perfectly aligned, 
                        // but ideally we import { Role } from '@prisma/client'
                    }
                }
            },
            select: { id: true }
        });

        const userIds = usersWithRole.map(u => u.id);

        // Process in chunks or just Promise.all if small scale
        const promises = userIds.map(id => this.sendToUser(id, payload));
        await Promise.all(promises);
    }
}
