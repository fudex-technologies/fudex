'use client';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { Switch } from '@/components/ui/switch';
import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import { Loader2 } from 'lucide-react';

export default function NotificationsPage() {
	const {
		isSupported,
		permission,
		subscription,
		subscribe,
		unsubscribe,
		isLoading,
	} = usePushNotifications();

	const isEnabled = permission === 'granted' && !!subscription;

	const handleToggle = (checked: boolean) => {
		if (checked) {
			subscribe();
		} else {
			unsubscribe();
		}
	};

	return (
		<PageWrapper className='px-5 flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full'>
				<GoBackButton />
				<p className='font-semibold text-xl'>Notifications</p>
			</div>

			<div className='py-10 space-y-5 max-w-lg w-full'>
				{!isLoading && !isSupported ? (
					<div className='p-5 border rounded-md text-red-500 bg-red-50'>
						<p>
							Web notifications are not supported by your browser,
							please try a different one.
						</p>
					</div>
				) : (
					<div className='space-y-3 w-full'>
						<p className='font-light text-foreground/50'>
							Push Notifications
						</p>
						<div className='flex items-center justify-between p-5 border rounded-md'>
							<div className='space-y-1'>
								<p className='font-medium text-foreground'>
									Enable Notifications
								</p>
								<p className='text-xs text-foreground/50'>
									Receive updates about your orders and
									activity.
								</p>
							</div>

							{isLoading ? (
								<Loader2 className='w-5 h-5 animate-spin text-primary' />
							) : (
								<Switch
									checked={isEnabled}
									onCheckedChange={handleToggle}
								/>
							)}
						</div>
						{ permission === 'denied' && (
							<p className='text-xs text-red-500 pt-2'>
								Notifications are permanently blocked in browser
								settings. Please reset permissions to enable.
							</p>
						)}
					</div>
				)}
			</div>
		</PageWrapper>
	);
}
