// This script listens for service worker updates
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		// Fires when a new SW activates
		window.dispatchEvent(new Event('sw_updated'));
	});
}
