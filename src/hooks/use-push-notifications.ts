'use client';

import { useState, useEffect, useCallback } from 'react';
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
    const [isInitializing, setIsInitializing] = useState(true);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [isUnsubscribing, setIsUnsubscribing] = useState(false);

    const { subscribeToPush, unsubscribeFromPush } = useNotificationActions();
    const subscribeMutation = subscribeToPush({ silent: true });
    const unsubscribeMutation = unsubscribeFromPush({ silent: true });

    // Initialize - check support and get current subscription
    useEffect(() => {
        const initialize = async () => {
            console.log('[Push] Initializing...');

            if (typeof window === 'undefined') {
                console.log('[Push] Window undefined, skipping initialization');
                setIsInitializing(false);
                return;
            }

            const supported = 'serviceWorker' in navigator && 'PushManager' in window;
            console.log('[Push] Support check:', { supported });
            setIsSupported(supported);

            if (supported) {
                const currentPermission = Notification.permission;
                console.log('[Push] Current permission:', currentPermission);
                setPermission(currentPermission);

                try {
                    console.log('[Push] Waiting for service worker...');
                    const registration = await navigator.serviceWorker.ready;
                    console.log('[Push] Service worker ready:', registration);

                    const existingSub = await registration.pushManager.getSubscription();
                    console.log('[Push] Existing subscription:', existingSub ? 'Found' : 'None');

                    if (existingSub) {
                        console.log('[Push] Subscription endpoint:', existingSub.endpoint);
                    }

                    setSubscription(existingSub);
                } catch (error) {
                    console.error('[Push] Error checking existing subscription:', error);
                }
            }

            setIsInitializing(false);
            console.log('[Push] Initialization complete');
        };

        initialize();
    }, []);

    const subscribe = useCallback(async () => {
        console.log('[Push] Subscribe called');

        if (!isSupported) {
            console.error('[Push] Not supported');
            toast.error('Push notifications are not supported in this browser.');
            return;
        }

        if (isSubscribing) {
            console.log('[Push] Already subscribing, skipping');
            return;
        }

        setIsSubscribing(true);

        try {
            // Step 1: Request permission
            console.log('[Push] Requesting permission...');
            const permissionResult = await Notification.requestPermission();
            console.log('[Push] Permission result:', permissionResult);
            setPermission(permissionResult);

            if (permissionResult !== 'granted') {
                console.error('[Push] Permission denied');
                toast.error('Notification permission denied');
                setIsSubscribing(false);
                return;
            }

            // Step 2: Wait for service worker
            console.log('[Push] Waiting for service worker...');
            const registration = await navigator.serviceWorker.ready;
            console.log('[Push] Service worker ready:', registration);

            // Step 3: Check for existing subscription
            let sub = await registration.pushManager.getSubscription();
            console.log('[Push] Existing subscription check:', sub ? 'Found' : 'None');

            if (sub) {
                console.log('[Push] Using existing subscription');
                // Already subscribed, just update backend
                const jsonSub = sub.toJSON();
                console.log('[Push] Subscription JSON:', jsonSub);

                if (jsonSub.endpoint && jsonSub.keys?.p256dh && jsonSub.keys?.auth) {
                    console.log('[Push] Sending to backend...');
                    try {
                        await subscribeMutation.mutateAsync({
                            endpoint: jsonSub.endpoint,
                            keys: {
                                p256dh: jsonSub.keys.p256dh,
                                auth: jsonSub.keys.auth,
                            }
                        });
                        console.log('[Push] Backend response received');
                        setSubscription(sub);
                        toast.success('Notifications enabled successfully!');
                    } catch (backendError) {
                        console.error('[Push] Backend error:', backendError);
                        toast.error('Failed to save subscription to server');
                    } finally {
                        setIsSubscribing(false);
                    }
                } else {
                    setIsSubscribing(false);
                }
                return;
            }

            // Step 4: Get VAPID key
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            console.log('[Push] VAPID key available:', !!vapidPublicKey);
            console.log('[Push] VAPID key (first 20 chars):', vapidPublicKey?.substring(0, 20));

            if (!vapidPublicKey) {
                console.error('[Push] VAPID public key not found in environment');
                toast.error("Configuration Error: VAPID Public Key not found");
                setIsSubscribing(false);
                return;
            }

            // Step 5: Subscribe to push
            console.log('[Push] Creating new subscription...');
            try {
                const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
                console.log('[Push] Application server key created, length:', applicationServerKey.length);

                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerKey,
                });
                console.log('[Push] Subscription created:', sub);
            } catch (subscribeError) {
                console.error('[Push] Subscribe error:', subscribeError);
                toast.error('Failed to subscribe to push notifications');
                setIsSubscribing(false);
                return;
            }

            // Step 6: Send to backend
            const jsonSub = sub.toJSON();
            console.log('[Push] Subscription JSON:', jsonSub);

            if (jsonSub.endpoint && jsonSub.keys?.p256dh && jsonSub.keys?.auth) {
                console.log('[Push] Sending to backend...');
                try {
                    await subscribeMutation.mutateAsync({
                        endpoint: jsonSub.endpoint,
                        keys: {
                            p256dh: jsonSub.keys.p256dh,
                            auth: jsonSub.keys.auth,
                        }
                    });
                    console.log('[Push] Backend response received');
                    setSubscription(sub);
                    toast.success('Notifications enabled successfully!');
                } catch (backendError) {
                    console.error('[Push] Backend error:', backendError);
                    toast.error('Failed to save subscription to server');
                    // Unsubscribe from push manager if backend save failed
                    try {
                        await sub.unsubscribe();
                    } catch (unsubError) {
                        console.error('[Push] Error unsubscribing after backend failure:', unsubError);
                    }
                } finally {
                    setIsSubscribing(false);
                }
            } else {
                console.error('[Push] Invalid subscription JSON:', jsonSub);
                toast.error('Invalid subscription data');
                setIsSubscribing(false);
            }

        } catch (error) {
            console.error('[Push] Failed to subscribe to push notifications:', error);
            toast.error('Failed to enable notifications');
            setIsSubscribing(false);
        }
    }, [isSupported, isSubscribing, subscribeMutation]);

    const unsubscribe = useCallback(async () => {
        console.log('[Push] Unsubscribe called');

        if (!subscription) {
            console.log('[Push] No subscription to unsubscribe');
            return;
        }

        if (isUnsubscribing) {
            console.log('[Push] Already unsubscribing, skipping');
            return;
        }

        setIsUnsubscribing(true);

        try {
            const endpoint = subscription.endpoint;
            
            console.log('[Push] Unsubscribing from push...');
            await subscription.unsubscribe();
            console.log('[Push] Unsubscribed from push manager');

            if (endpoint) {
                console.log('[Push] Removing from backend...');
                try {
                    await unsubscribeMutation.mutateAsync({
                        endpoint: endpoint
                    });
                    console.log('[Push] Removed from backend');
                } catch (backendError) {
                    console.error('[Push] Backend removal error:', backendError);
                    // Still update local state even if backend fails
                }
            }

            setSubscription(null);
            toast.success('Notifications disabled');
        } catch (error) {
            console.error('[Push] Failed to unsubscribe:', error);
            toast.error('Failed to disable notifications');
        } finally {
            setIsUnsubscribing(false);
        }
    }, [subscription, isUnsubscribing, unsubscribeMutation]);

    return {
        isSupported,
        permission,
        subscription,
        subscribe,
        unsubscribe,
        isLoading: isInitializing || isSubscribing || isUnsubscribing,
    };
}