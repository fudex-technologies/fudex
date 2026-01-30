// public/sw-custom.js
console.log('[Custom SW] Push notification handlers loaded');

// ============================================
// SERVICE WORKER LIFECYCLE
// ============================================

// Skip waiting to activate new service worker immediately
self.addEventListener('install', (event) => {
	console.log('[Custom SW] Installing...');
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	console.log('[Custom SW] Activating...');
	event.waitUntil(clients.claim());
});

// ============================================
// PUSH NOTIFICATION HANDLERS
// ============================================

self.addEventListener('push', function (event) {
	console.log('[Service Worker] Push received');

	if (!event.data) {
		console.log('[Service Worker] Push event has no data');
		return;
	}

	try {
		const data = event.data.json();
		console.log('[Service Worker] Push data:', data);

		const options = {
			body: data.body,
			icon: data.icon || '/icons/android-chrome-192x192.png',
			badge: '/icons/android-chrome-192x192.png',
			vibrate: [200, 100, 200],
			tag: data.tag || 'fudex-notification',
			requireInteraction: false,
			data: {
				url: data.url || '/',
				dateOfArrival: Date.now(),
				...data.data,
			},
		};

		event.waitUntil(
			self.registration.showNotification(
				data.title || 'New Notification',
				options,
			),
		);
	} catch (error) {
		console.error('[Service Worker] Error handling push event:', error);
	}
});

self.addEventListener('notificationclick', function (event) {
	console.log('[Service Worker] Notification clicked');
	event.notification.close();

	const urlToOpen = event.notification.data?.url || '/';

	event.waitUntil(
		clients
			.matchAll({ type: 'window', includeUncontrolled: true })
			.then((windowClients) => {
				for (const client of windowClients) {
					if (client.url === urlToOpen && 'focus' in client) {
						return client.focus();
					}
				}
				if (clients.openWindow) {
					return clients.openWindow(urlToOpen);
				}
			}),
	);
});

console.log('[Custom SW] Push notification handlers registered');
