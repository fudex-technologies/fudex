'use client';

import { useEffect } from 'react';
import { usePackageCartStore } from '@/store/package-cart-store';

interface PackageCartInitializerProps {
	packageId: string;
}

/**
 * Component to initialize the package cart with the current package ID
 * This ensures items are only added to the correct package
 */
const PackageCartInitializer = ({ packageId }: PackageCartInitializerProps) => {
	const { packageId: currentPackageId, setPackage } = usePackageCartStore();

	useEffect(() => {
		// Only set package if it's different from current
		if (currentPackageId !== packageId) {
			setPackage(packageId);
		}
	}, [packageId, currentPackageId, setPackage]);

	return null;
};

export default PackageCartInitializer;
