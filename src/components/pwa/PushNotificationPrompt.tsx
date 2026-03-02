'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePopupStore } from '@/store/popup-store';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useSession } from '@/lib/auth-client';
import { Button } from '../ui/button';
import { Bell, X } from 'lucide-react';

export default function PushNotificationPrompt() {
	const { data: session } = useSession();
	const { enqueuePopup, dequeuePopup, activePopup } = usePopupStore();
	const { isSupported, permission, subscribe, isLoading } =
		usePushNotifications();

	useEffect(() => {
		// Only show to logged in users who haven't granted permission yet
		// and the browser actually supports it.
		if (
			!session?.user ||
			!isSupported ||
			permission === 'granted' ||
			permission === 'denied'
		) {
			return;
		}

		const lastDismissed = localStorage.getItem(
			'push_notification_prompt_dismissed',
		);
		const now = Date.now();
		// Show again after 3 days if dismissed
		const threeDays = 3 * 24 * 60 * 60 * 1000;
		const shouldShow =
			!lastDismissed || now - parseInt(lastDismissed) > threeDays;

		if (shouldShow) {
			enqueuePopup('push_notification');
		}
	}, [session, isSupported, permission, enqueuePopup]);

	useEffect(() => {
		if (activePopup === 'push_notification') {
			toast.custom(
				(t) => (
					<div className='bg-background border border-border rounded-lg shadow-lg p-4 flex flex-col gap-3 w-full max-w-sm pointer-events-auto'>
						<div className='flex justify-between items-start'>
							<div className='flex gap-3 items-center'>
								<div className='bg-primary/10 p-2 rounded-full text-primary'>
									<Bell size={20} />
								</div>
								<div>
									<h3 className='font-semibold text-foreground'>
										Enable Notifications
									</h3>
									<p className='text-sm text-muted-foreground'>
										Get instant updates on your orders and
										account activity.
									</p>
								</div>
							</div>
							<button
								onClick={() => {
									localStorage.setItem(
										'push_notification_prompt_dismissed',
										Date.now().toString(),
									);
									toast.dismiss(t);
									dequeuePopup('push_notification');
								}}
								className='text-muted-foreground hover:text-foreground shrink-0'>
								<X size={16} />
							</button>
						</div>
						<div className='flex gap-2 w-full mt-2'>
							<Button
								variant='outline'
								className='flex-1'
								onClick={async () => {
									await subscribe();
									localStorage.setItem(
										'push_notification_prompt_dismissed',
										Date.now().toString(),
									);
									toast.dismiss(t);
									dequeuePopup('push_notification');
								}}>
								{isLoading ? 'Loading...' : 'Not Now'}
							</Button>
							<Button
								className='flex-1'
								disabled={isLoading}
								onClick={async () => {
									await subscribe();
									localStorage.setItem(
										'push_notification_prompt_dismissed',
										Date.now().toString(),
									);
									toast.dismiss(t);
									dequeuePopup('push_notification');
								}}>
								{isLoading ? 'Enabling...' : 'Enable'}
							</Button>
						</div>
					</div>
				),
				{
					duration: Infinity,
					position: 'bottom-center',
					id: 'push-notification-prompt-toast',
				},
			);
		}
	}, [activePopup, dequeuePopup, subscribe, isLoading]);

	return null;
}
