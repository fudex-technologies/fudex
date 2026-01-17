import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

async function generateQRCode() {
	try {
		const qrCodeUrl = 'https://fudex.ng/q';
		const publicDir = path.join(process.cwd(), 'public');
		const qrCodePath = path.join(publicDir, 'qrcode-simple.png');

		// Ensure public directory exists
		if (!fs.existsSync(publicDir)) {
			fs.mkdirSync(publicDir, { recursive: true });
		}

		// Generate QR code as PNG without logo overlay (test)
		await QRCode.toFile(qrCodePath, qrCodeUrl, {
			errorCorrectionLevel: 'H',
			type: 'image/png',
			width: 1200,
			margin: 4,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});

		console.log(`✓ Simple QR code generated at: ${qrCodePath}`);
		console.log(`✓ URL: ${qrCodeUrl}`);
	} catch (err) {
		console.error('Error generating QR code:', err);
		process.exit(1);
	}
}

generateQRCode();
