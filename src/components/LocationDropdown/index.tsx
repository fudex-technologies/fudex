'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { ClassNameValue } from 'tailwind-merge';
import { cn } from '@/lib/utils';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { shortenText } from '@/lib/commonFunctions';
import { useProfileActions } from '@/api-hooks/useProfileActions';

const LocationDropdown = ({ className }: { className?: ClassNameValue }) => {
	const { data: session } = useSession();
	const { getAddresses, updateAddress } = useProfileActions();
	const { data: addresses, isLoading: addressesLoading } = getAddresses();
	const { mutate } = updateAddress({
		silent: true,
	});
	const defaultAddress = addresses?.find((address) => address.isDefault);
	const router = useRouter();
	return (
		<Select
			onValueChange={(value) => {
				session &&
					mutate({
						id: value,
						data: {
							isDefault: true,
						},
					});
			}}>
			<SelectTrigger
				onClick={() => {
					if (!session) {
						router.push(PAGES_DATA.onboarding_last_step_page);
						return;
					}
					if (session && addresses?.length === 0) {
						router.push(PAGES_DATA.onboarding_set_address_page);
						return;
					}
				}}
				className={cn(
					'min-w-[180px] max-w-sm w-full border-0 shadow-none p-0',
					className
				)}
				disabled={!session || addressesLoading}>
				<div className='flex items-center justify-start gap-2'>
					<ImageWithFallback
						src={'/assets/locationIcon.svg'}
						width={20}
						height={20}
						alt='Location'
					/>
					{!session && <SelectValue placeholder='Explore Mode' />}
					{session && addresses?.length === 0 && (
						<SelectValue placeholder='Add Address' />
					)}
					{session && defaultAddress && (
						<SelectValue
							onClick={() =>
								router.push(
									PAGES_DATA.onboarding_set_address_page
								)
							}
							placeholder={shortenText(
								`${defaultAddress?.label?.toUpperCase()} - ${
									defaultAddress.line1
								}`,
								30
							)}
						/>
					)}
					{session &&
						!defaultAddress &&
						addresses &&
						addresses.length > 0 && (
							<SelectValue
								onClick={() =>
									router.push(
										PAGES_DATA.onboarding_set_address_page
									)
								}
								placeholder={shortenText(
									`${addresses?.[0]?.label?.toUpperCase()} - ${
										addresses?.[0]?.line1
									}`,
									30
								)}
							/>
						)}
				</div>
			</SelectTrigger>
			<SelectContent>
				{session &&
					addresses?.map((address) => {
						return (
							<SelectItem key={address.id} value={address.id}>
								{shortenText(
									`${address?.label?.toUpperCase()} - ${
										address.line1
									} `,
									55
								)}
							</SelectItem>
						);
					})}
			</SelectContent>
		</Select>
	);
};

export default LocationDropdown;
