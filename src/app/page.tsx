import PwaInstallPrompt from '@/components/pwa/PwaInstallPrompt';
import PwaPushNotificationManager from '@/components/pwa/PwaPushNotificationManager';

export default function Home() {
	return (
		<div className=''>
			FUDEX App
			<PwaPushNotificationManager />
			<PwaInstallPrompt />
		</div>
	);
}
