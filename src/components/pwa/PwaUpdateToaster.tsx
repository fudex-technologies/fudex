'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePopupStore } from '@/store/popup-store';

export default function PWAUpdateToast() {
	const { enqueuePopup, dequeuePopup, activePopup } = usePopupStore();

	useEffect(() => {
		const handleUpdate = () => {
			enqueuePopup('pwa_update');
		};
		window.addEventListener('sw_updated', handleUpdate);
		return () => window.removeEventListener('sw_updated', handleUpdate);
	}, [enqueuePopup]);

	useEffect(() => {
		if (activePopup === 'pwa_update') {
			toast.message('Update available 🚀', {
				id: 'pwa-update-toast',
				description: 'A new version of this app is ready.',
				action: {
					label: 'Update',
					onClick: () => window.location.reload(),
				},
				onDismiss: () => {
					dequeuePopup('pwa_update');
				},
				onAutoClose: () => {
					dequeuePopup('pwa_update');
				},
				duration: Infinity,
			});
		}
	}, [activePopup, dequeuePopup]);

	return null;
}
