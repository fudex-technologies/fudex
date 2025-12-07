'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export default function PWAUpdateToast() {
	useEffect(() => {
		const showUpdateToast = () => {
			toast.message('Update available 🚀', {
				description: 'A new version of this app is ready.',
				action: {
					label: 'Update',
					onClick: () => window.location.reload(),
				},
			});
		};
		window.addEventListener('sw_updated', showUpdateToast);
		return () => window.removeEventListener('sw_updated', showUpdateToast);
	}, [toast]);

	return null;
}
