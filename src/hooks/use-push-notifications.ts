'use client';

import { useState, useEffect } from 'react';
import { useNotificationActions } from '@/api-hooks/useNotificationActions';
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [permission, setPermission] = useState<NotificationPermission>('default');

    const { subscribeToPush, unsubscribeFromPush } = useNotificationActions();
    const subscribeMutation = subscribeToPush();
    const unsubscribeMutation = unsubscribeFromPush();

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);

            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.getSubscription().then((sub) => {
                    setSubscription(sub);
                });
            });
        }
    }, []);

    const subscribe = async () => {
        if (!isSupported) {
            toast.error('Push notifications are not supported in this browser.');
            return;
        };

        try {
            const result = await Notification.requestPermission();
            setPermission(result);

            if (result === 'granted') {
                const registration = await navigator.serviceWorker.ready;

                // Ensure we have the public key
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!vapidPublicKey) {
                    console.error('VAPID public key not found');
                    toast.error("Configuration Error: VAPID Public Key not found");
                    return;
                }

                const sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                });

                setSubscription(sub);

                // Send to backend
                const jsonSub = sub.toJSON();
                if (jsonSub.endpoint && jsonSub.keys?.p256dh && jsonSub.keys?.auth) {
                    await subscribeMutation.mutateAsync({
                        endpoint: jsonSub.endpoint,
                        keys: {
                            p256dh: jsonSub.keys.p256dh,
                            auth: jsonSub.keys.auth,
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to subscribe to push notifications:', error);
        }
    };

    const unsubscribe = async () => {
        if (!subscription) return;

        try {
            await subscription.unsubscribe();

            // Cleanup backend
            if (subscription.endpoint) {
                await unsubscribeMutation.mutateAsync({ endpoint: subscription.endpoint });
            }

            setSubscription(null);
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
        }
    };

    return {
        isSupported,
        permission,
        subscription,
        subscribe,
        unsubscribe,
        isLoading: subscribeMutation.isPending || unsubscribeMutation.isPending,
    };
}
