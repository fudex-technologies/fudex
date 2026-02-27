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
                    // Check all registrations for debugging
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    console.log('[Push] Currently registered service workers:', registrations.length);
                    registrations.forEach((reg, i) => {
                        console.log(`[Push] SW ${i}:`, {
                            scriptURL: reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL,
                            state: reg.active ? 'active' : reg.installing ? 'installing' : reg.waiting ? 'waiting' : 'unknown'
                        });
                    });

                    console.log('[Push] Waiting for service worker (with 5s timeout)...');

                    // Race the ready promise against a timeout to prevent endless loading
                    const swReadyPromise = navigator.serviceWorker.ready;
                    const timeoutPromise = new Promise<null>((_, reject) =>
                        setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
                    );

                    let registration;
                    try {
                        registration = await Promise.race([swReadyPromise, timeoutPromise]) as ServiceWorkerRegistration;
                        console.log('[Push] Service worker ready:', registration);
                    } catch (raceError) {
                        console.warn('[Push] serviceWorker.ready timed out or failed:', raceError);

                        // If no registration was found, try to see if we can find any active one
                        if (registrations.length > 0) {
                            registration = registrations[0];
                            console.log('[Push] Falling back to first found registration:', registration);
                        }
                    }

                    if (registration) {
                        const existingSub = await registration.pushManager.getSubscription();
                        console.log('[Push] Existing subscription:', existingSub ? 'Found' : 'None');

                        if (existingSub) {
                            console.log('[Push] Subscription endpoint:', existingSub.endpoint);
                        }

                        setSubscription(existingSub);
                    } else {
                        console.log('[Push] No active registration found, attempting manual registration with /sw-custom.js...');
                        try {
                            const manualReg = await navigator.serviceWorker.register('/sw-custom.js', { scope: '/' });
                            console.log('[Push] Manual registration successful:', manualReg);

                            // Check for subscription on the new registration
                            const existingSub = await manualReg.pushManager.getSubscription();
                            setSubscription(existingSub);
                        } catch (regError) {
                            console.error('[Push] Manual registration failed:', regError);
                        }
                    }
                } catch (error) {
                    console.error('[Push] Error during initialization:', error);
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
            console.log('[Push] Waiting for service worker (with 5s timeout)...');
            const swReadyPromise = navigator.serviceWorker.ready;
            const timeoutPromise = new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error('Service worker ready timeout')), 5000)
            );

            let registration;
            try {
                registration = await Promise.race([swReadyPromise, timeoutPromise]) as ServiceWorkerRegistration;
                console.log('[Push] Service worker ready:', registration);
            } catch (raceError) {
                console.warn('[Push] serviceWorker.ready timed out or failed, checking for existing or manual registration:', raceError);

                const registrations = await navigator.serviceWorker.getRegistrations();
                if (registrations.length > 0) {
                    registration = registrations[0];
                    console.log('[Push] Using existing registration fallback:', registration);
                } else {
                    console.log('[Push] No registration found, attempting manual registration with /sw-custom.js before subscribing...');
                    try {
                        registration = await navigator.serviceWorker.register('/sw-custom.js', { scope: '/' });
                        console.log('[Push] Manual registration successful during subscribe:', registration);
                    } catch (regError) {
                        console.error('[Push] Manual registration failed during subscribe:', regError);
                        toast.error('Could not register service worker. Push notifications unavailable.');
                        setIsSubscribing(false);
                        return;
                    }
                }
            }

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