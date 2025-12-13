interface Props {
	params: Promise<{ vendorId: string; productId: string }>;
}

export default async function VendorSingleProductPage({ params }: Props) {
	const { productId } = await params;

	return (
		<>
			Get this product
			{/* <MobileBottomNav /> */}
		</>
	);
}
