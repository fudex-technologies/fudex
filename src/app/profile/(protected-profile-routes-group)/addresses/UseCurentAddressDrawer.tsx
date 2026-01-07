'use client';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { FaLocationArrow } from 'react-icons/fa';
import { savedAddressIcons } from './page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import {
	GeoResult,
	reverseGeocode,
} from '../../../../lib/location/reverseGeocode';
import { Loader2 } from 'lucide-react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface AddressPayload {
	label: string;
	line1: string;
	line2?: string;
	city: string;
	state?: string;
	postalCode?: string;
	country?: string;
	lat: number;
	lng: number;
	areaId: string;
}

const UseCurentAddressDrawer = ({
	addAddressEffect,
}: {
	addAddressEffect?: () => void;
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedLabel, setSelectedabel] = useState<
		'home' | 'school' | 'work' | 'other'
	>('home');
	const [customLabel, setCustomLabel] = useState('');
	const [geoLoading, setGeoLoading] = useState(false);
	const [geoError, setGeoError] = useState<string | null>(null);
	const [resolvedAddress, setResolvedAddress] = useState<GeoResult | null>(
		null
	);
	const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>();

	const { addAddress, getAllAreasInEkiti } = useProfileActions();
	const { mutate: addMutate, isPending: adding } = addAddress({
		onSuccess: () => {
			setIsOpen(false);
			addAddressEffect && addAddressEffect();
		},
	});

	const { data: listOfAreasInEkiti, isLoading: loadingAreas } =
		getAllAreasInEkiti();

	const handleFetchCurrentLocation = useCallback(() => {
		setGeoLoading(true);
		setGeoError(null);
		setResolvedAddress(null);

		if (!('geolocation' in navigator)) {
			setGeoError('Geolocation not available in this browser');
			setGeoLoading(false);
			return;
		}

		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				const { latitude, longitude } = pos.coords;
				try {
					const address = await reverseGeocode(latitude, longitude);
					setResolvedAddress(address);
				} catch (err: any) {
					setGeoError(err?.message || String(err));
				} finally {
					setGeoLoading(false);
				}
			},
			(err) => {
				setGeoError(err.message || 'Failed to get location');
				setGeoLoading(false);
			},
			{
				enableHighAccuracy: true,
				timeout: 20000,
				maximumAge: 30000, // Cache location for 30 seconds
			}
		);
	}, []);

	useEffect(() => {
		if (isOpen) {
			handleFetchCurrentLocation();
		}
	}, [isOpen, handleFetchCurrentLocation]);

	const handleSaveAddress = () => {
		if (!resolvedAddress || !selectedAreaId) return;

		const data: AddressPayload = {
			label:
				selectedLabel === 'other'
					? customLabel || 'Other'
					: selectedLabel,
			line1: resolvedAddress.formattedAddress,
			city: resolvedAddress.city as string,
			state: resolvedAddress.state,
			postalCode: resolvedAddress.postalCode,
			country: resolvedAddress.country,
			lat: resolvedAddress.lat,
			lng: resolvedAddress.lng,
			areaId: selectedAreaId,
		};
		addMutate(data);
	};

	return (
		<Drawer open={isOpen} onOpenChange={setIsOpen}>
			<DrawerTrigger asChild>
				<div className='p-5 w-full border-t border-b border-foreground/50 flex items-center justify-between cursor-pointer'>
					<div className='flex gap-2 items-center text-primary'>
						<FaLocationArrow className='' />
						<p className=''>Use your current location</p>
					</div>
					<ChevronRight className='text-foreground/50' />
				</div>
			</DrawerTrigger>
			<DrawerContent className='rounded-t-[50px]'>
				<div className='my-10 pt-5 pb-10 px-5 flex justify-center '>
					<div className='w-full max-w-lg space-y-3'>
						<div className='flex gap-2 items-center text-primary'>
							<FaLocationArrow className='' />
							<p className=''>Use your current location</p>
						</div>
						<div className='w-full'>
							{geoLoading && (
								<div className='flex items-center text-sm text-foreground/50'>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Detecting location...
								</div>
							)}
							{geoError && (
								<p className='text-sm text-red-500'>
									Error detecting location: {geoError}
								</p>
							)}

							{resolvedAddress && (
								<>
									<p className='font-semibold'>
										{resolvedAddress.formattedAddress}
									</p>
									<p className='text-sm text-foreground/50'>
										{resolvedAddress.city},{' '}
										{resolvedAddress.state},{' '}
										{resolvedAddress.country}
									</p>
								</>
							)}
						</div>

						{resolvedAddress && (
							<div className='space-y-2'>
								<p className='font-semibold'>Select Area</p>
								<Select
									onValueChange={setSelectedAreaId}
									defaultValue={selectedAreaId}>
									<SelectTrigger>
										<SelectValue placeholder='Select your area' />
									</SelectTrigger>
									<SelectContent>
										{loadingAreas ? (
											<div className='p-2'>
												Loading areas...
											</div>
										) : (
											listOfAreasInEkiti?.map((area) => (
												<SelectItem
													key={area.id}
													value={area.id}>
													{area.name}
												</SelectItem>
											))
										)}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className='w-full space-y-2 my-5'>
							<p className='font-semibold'>Address Label</p>

							<div className='w-full flex gap-3 items-center justify-between font-normal'>
								<div
									onClick={() => setSelectedabel('home')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'home' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['home'].icon}
									<p className=''>
										{savedAddressIcons['home'].name}
									</p>
								</div>
								<div
									onClick={() => setSelectedabel('school')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'school' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['school'].icon}
									<p className=''>
										{savedAddressIcons['school'].name}
									</p>
								</div>
								<div
									onClick={() => setSelectedabel('work')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'work' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['work'].icon}
									<p className=''>
										{savedAddressIcons['work'].name}
									</p>
								</div>
								<div
									onClick={() => setSelectedabel('other')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'other' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['other'].icon}
									<p className=''>
										{savedAddressIcons['other'].name}
									</p>
								</div>
							</div>

							{selectedLabel === 'other' && (
								<Input
									className='w-full my-2'
									placeholder='Enter label'
									value={customLabel}
									onChange={(e) =>
										setCustomLabel(e.target.value)
									}
								/>
							)}
						</div>

						<Button
							variant={'game'}
							className='w-full py-5 my-3'
							disabled={
								!resolvedAddress ||
								!selectedAreaId ||
								adding ||
								geoLoading
							}
							onClick={handleSaveAddress}>
							{adding ? 'Saving...' : 'Select this address'}
						</Button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default UseCurentAddressDrawer;
