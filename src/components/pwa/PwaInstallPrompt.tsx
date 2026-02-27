'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePopupStore } from '@/store/popup-store';

const PwaInstallPrompt = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [isIos, setIsIos] = useState(false);
	const { enqueuePopup, dequeuePopup, activePopup } = usePopupStore();

	useEffect(() => {
		const handleBeforeInstallPrompt = (e: any) => {
			e.preventDefault();
			setDeferredPrompt(e);
		};

		window.addEventListener(
			'beforeinstallprompt',
			handleBeforeInstallPrompt,
		);

		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
		setIsIos(isIosDevice);

		return () => {
			window.removeEventListener(
				'beforeinstallprompt',
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	useEffect(() => {
		const isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			(window.navigator as any).standalone ||
			document.referrer.includes('android-app://');

		if (isStandalone) return;

		const lastDismissed = localStorage.getItem(
			'pwa_install_toast_dismissed',
		);
		const now = Date.now();
		const oneDay = 24 * 60 * 60 * 1000;
		const shouldShow =
			!lastDismissed || now - parseInt(lastDismissed) > oneDay;

		if (!shouldShow) return;

		if (isIos || deferredPrompt) {
			const timer = setTimeout(() => {
				enqueuePopup('pwa_install');
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [isIos, deferredPrompt, enqueuePopup]);

	useEffect(() => {
		if (activePopup === 'pwa_install') {
			showInstallToast();
		}
	}, [activePopup]);

	const dismissToast = () => {
		localStorage.setItem(
			'pwa_install_toast_dismissed',
			Date.now().toString(),
		);
		dequeuePopup('pwa_install');
	};

	const handleInstallClick = () => {
		if (isIos) {
			setIsOpen(true);
		} else if (deferredPrompt) {
			deferredPrompt.prompt();
			deferredPrompt.userChoice.then((choiceResult: any) => {
				if (choiceResult.outcome === 'accepted') {
					console.log('User accepted the install prompt');
				} else {
					console.log('User dismissed the install prompt');
					dismissToast();
				}
				setDeferredPrompt(null);
			});
		}
	};

	const showInstallToast = () => {
		toast.custom(
			(t) => (
				<div className='bg-background border border-border rounded-lg shadow-lg p-4 flex flex-col gap-3 w-full max-w-sm pointer-events-auto'>
					<div className='flex justify-between items-start'>
						<div>
							<h3 className='font-semibold text-foreground'>
								Install App
							</h3>
							<p className='text-sm text-muted-foreground'>
								Install our app for a better experience and
								easier access.
							</p>
						</div>
						<button
							onClick={() => {
								toast.dismiss(t);
								dismissToast();
							}}
							className='text-muted-foreground hover:text-foreground'>
							<X size={16} />
						</button>
					</div>
					<Button
						onClick={() => {
							toast.dismiss(t);
							handleInstallClick();
						}}
						className='w-full'>
						{isIos ? 'Install Instructions' : 'Install Now'}
					</Button>
				</div>
			),
			{
				duration: Infinity,
				position: 'bottom-center',
				id: 'pwa-install-toast',
			},
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Install FUDEX</DialogTitle>
					<DialogDescription>
						Install our app on your iPhone for the best experience.
					</DialogDescription>
				</DialogHeader>
				<div className='flex flex-col gap-4 py-4'>
					<div className='flex items-center gap-4'>
						<div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
							<Share className='h-5 w-5' />
						</div>
						<div className='flex-1'>
							<p className='text-sm font-medium'>
								1. Tap the Share button
							</p>
							<p className='text-xs text-muted-foreground'>
								Look for the share icon at the bottom of your
								browser.
							</p>
						</div>
					</div>
					<div className='flex items-center gap-4'>
						<div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
							<Plus className='h-5 w-5' />
						</div>
						<div className='flex-1'>
							<p className='text-sm font-medium'>
								2. Add to Home Screen
							</p>
							<p className='text-xs text-muted-foreground'>
								Scroll down and tap "Add to Home Screen".
							</p>
						</div>
					</div>
				</div>
				<div className='flex justify-end'>
					<Button
						variant='game'
						onClick={() => {
							setIsOpen(false);
							dequeuePopup('pwa_install');
						}}>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PwaInstallPrompt;
