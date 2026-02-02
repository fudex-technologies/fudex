import prisma from '@/lib/prisma';
import webpush from 'web-push';

// Initialize web-push with VAPID keys
let vapidInitialized = false;
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        webpush.setVapidDetails(
            `mailto:${process.env.VAPID_SUBJECT || 'fudextechnologies@gmail.com'}`,
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
            process.env.VAPID_PRIVATE_KEY
        );
        vapidInitialized = true;
        console.log('[NotificationService] VAPID keys initialized successfully');
    } catch (error) {
        console.error('[NotificationService] Failed to initialize VAPID keys:', error);
    }
} else {
    console.warn('[NotificationService] VAPID keys are missing. Push notifications will not work.');
    console.warn('[NotificationService] NEXT_PUBLIC_VAPID_PUBLIC_KEY:', !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
    console.warn('[NotificationService] VAPID_PRIVATE_KEY:', !!process.env.VAPID_PRIVATE_KEY);
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
            if (!vapidInitialized) {
                console.warn('[NotificationService] Cannot send notification: VAPID keys not initialized');
                return { success: false, message: 'VAPID keys not configured' };
            }

            const subscriptions = await prisma.pushSubscription.findMany({
                where: { userId },
            });

            if (subscriptions.length === 0) {
                console.log(`[NotificationService] No subscriptions found for user ${userId}`);
                return { success: false, message: 'No subscriptions found for user' };
            }

            console.log(`[NotificationService] Sending notification to user ${userId} (${subscriptions.length} subscription(s))`);

            const notificationResults = await Promise.allSettled(
                subscriptions.map(async (sub) => {
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

                        console.log(`[NotificationService] Notification sent successfully to subscription ${sub.id}`);
                        return { success: true, subscriptionId: sub.id };
                    } catch (error: any) {
                        if (error.statusCode === 410 || error.statusCode === 404) {
                            // Subscription is invalid or expired, remove it
                            console.log(`[NotificationService] Removing invalid subscription: ${sub.id} (status: ${error.statusCode})`);
                            await prisma.pushSubscription.delete({
                                where: { id: sub.id },
                            }).catch(deleteError => {
                                console.error(`[NotificationService] Failed to delete invalid subscription ${sub.id}:`, deleteError);
                            });
                        } else {
                            console.error(`[NotificationService] Error sending push notification to subscription ${sub.id}:`, error);
                        }
                        return { success: false, error: error.message || 'Unknown error' };
                    }
                })
            );

            const successful = notificationResults.filter(r => r.status === 'fulfilled' && r.value.success).length;
            const failed = notificationResults.length - successful;

            console.log(`[NotificationService] Notification results: ${successful} successful, ${failed} failed`);

            return { 
                success: successful > 0, 
                successful,
                failed,
                total: subscriptions.length
            };
        } catch (error) {
            console.error('[NotificationService] Error in sendToUser:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    /**
     * Send a push notification to users with a specific role
     */
    static async sendToRole(role: 'VENDOR' | 'CUSTOMER' | 'OPERATOR' | 'ADMIN', payload: NotificationPayload) {
        try {
            if (!vapidInitialized) {
                console.warn('[NotificationService] Cannot send notification: VAPID keys not initialized');
                return { success: false, message: 'VAPID keys not configured' };
            }

            console.log(`[NotificationService] Sending notification to role: ${role}`);

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

            console.log(`[NotificationService] Found ${userIds.length} users with role ${role}`);

            if (userIds.length === 0) {
                return { success: false, message: `No users found with role ${role}` };
            }

            // Process in chunks or just Promise.allSettled if small scale
            const results = await Promise.allSettled(
                userIds.map(id => this.sendToUser(id, payload))
            );

            const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
            const failed = results.length - successful;

            console.log(`[NotificationService] Role notification results: ${successful} successful, ${failed} failed`);

            return { 
                success: successful > 0, 
                successful,
                failed,
                total: userIds.length
            };
        } catch (error) {
            console.error(`[NotificationService] Error in sendToRole for ${role}:`, error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
