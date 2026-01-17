import Image from 'next/image';

export default function QRCodePage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<div className="text-center">
				<h1 className="text-3xl font-bold mb-4">FUDEX QR Code</h1>
				<p className="text-gray-600 mb-8">Scan the QR code below or use the direct link</p>

				<div className="bg-white p-8 rounded-lg shadow-lg inline-block mb-8">
					<Image
						src="/qrcode.png"
						alt="FUDEX QR Code"
						width={400}
						height={400}
						priority
						quality={100}
					/>
				</div>

				<div className="mt-8">
					<p className="text-lg font-semibold mb-2">QR Code Details:</p>
					<ul className="text-left inline-block text-gray-700">
						<li>
							<strong>URL:</strong> <a href="https://fudex.ng/q" className="text-blue-600 hover:underline">https://fudex.ng/q</a>
						</li>
						<li>
							<strong>Size:</strong> 1200x1200px
						</li>
						<li>
							<strong>Error Correction:</strong> Level H (30% damage tolerance)
						</li>
						<li>
							<strong>Redirects to:</strong> <a href="/" className="text-blue-600 hover:underline">Home Page</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
