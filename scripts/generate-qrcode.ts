import QRCode from 'qrcode';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateQRCode() {
	try {
		const qrCodeUrl = 'https://fudex.ng/q';
		const publicDir = path.join(process.cwd(), 'public');
		const qrCodeWithLogoPath = path.join(publicDir, 'qrcode.png');
		const logoPath = path.join(publicDir, 'icons', 'FUDEX_2t.png');

		// Ensure public directory exists
		if (!fs.existsSync(publicDir)) {
			fs.mkdirSync(publicDir, { recursive: true });
		}

		const QR_SIZE = 1200;
		const tempQRPath = path.join(publicDir, 'temp-qrcode.png');

		// Step 1: Generate pure QR code without any modifications
		console.log('Generating QR code...');
		await QRCode.toFile(tempQRPath, qrCodeUrl, {
			errorCorrectionLevel: 'H',
			type: 'image/png',
			width: QR_SIZE,
			margin: 4,
			color: {
				dark: '#000000',
				light: '#FFFFFF',
			},
		});

		console.log('QR code generated. Adding logo...');

		// Step 2: Get logo and resize it
		const logoSize = Math.floor(QR_SIZE * 0.12); // Smaller - 12% instead of 10%
		const logoMetadata = await sharp(logoPath).metadata();
		const logoAspectRatio = (logoMetadata.width || 1) / (logoMetadata.height || 1);

		let finalLogoWidth = logoSize;
		let finalLogoHeight = logoSize / logoAspectRatio;

		if (finalLogoHeight > logoSize) {
			finalLogoHeight = logoSize;
			finalLogoWidth = logoSize * logoAspectRatio;
		}

		// Step 3: Create white square for logo background
		const squareSize = Math.ceil(Math.max(finalLogoWidth, finalLogoHeight)) + 30;
		const whiteSquareBuffer = Buffer.from(
			`<svg width="${squareSize}" height="${squareSize}" xmlns="http://www.w3.org/2000/svg">
				<rect width="${squareSize}" height="${squareSize}" fill="#FFFFFF"/>
			</svg>`
		);

		// Step 4: Resize logo to fit in white square
		const resizedLogo = await sharp(logoPath)
			.resize(Math.floor(finalLogoWidth), Math.floor(finalLogoHeight), {
				fit: 'contain',
				background: { r: 255, g: 255, b: 255, alpha: 1 },
			})
			.toBuffer();

		// Step 5: Composite logo onto white square
		const logoOnWhite = await sharp(whiteSquareBuffer)
			.composite([
				{
					input: resizedLogo,
					left: Math.floor((squareSize - finalLogoWidth) / 2),
					top: Math.floor((squareSize - finalLogoHeight) / 2),
				},
			])
			.toBuffer();

		// Step 6: Composite white square + logo onto QR code (centered)
		await sharp(tempQRPath)
			.composite([
				{
					input: logoOnWhite,
					left: Math.floor((QR_SIZE - squareSize) / 2),
					top: Math.floor((QR_SIZE - squareSize) / 2),
				},
			])
			.png({ quality: 100, progressive: false })
			.toFile(qrCodeWithLogoPath);

		// Cleanup
		fs.unlinkSync(tempQRPath);

		console.log(`✓ QR code generated successfully`);
		console.log(`✓ File: ${qrCodeWithLogoPath}`);
		console.log(`✓ URL: ${qrCodeUrl}`);
		console.log(`✓ Size: ${QR_SIZE}x${QR_SIZE}px`);
		console.log(`✓ Error Correction: Level H`);
		console.log(`✓ Logo: Centered, minimal coverage`);
	} catch (err) {
		console.error('Error generating QR code:', err);
		process.exit(1);
	}
}

generateQRCode();
