'use client';

import GoBackButton from '@/components/GoBackButton';
import SearchInput, { SearchInputSkeleton } from '@/components/SearchInput';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { ClassNameValue } from 'tailwind-merge';
import { GiHouse } from 'react-icons/gi';
import { IoSchoolSharp } from 'react-icons/io5';
import { GiSuitcase } from 'react-icons/gi';
import { PiMapPinAreaFill } from 'react-icons/pi';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import UseCurentAddressDrawer from './UseCurentAddressDrawer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { useProfileActions } from '@/api-hooks/useProfileActions';
import { Skeleton } from '@/components/ui/skeleton';
import { shortenText } from '@/lib/commonFunctions';
import { Suspense, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import ConfirmationAlertDialogue from '@/components/ConfirmationAlertDialogue';

type IAddressLabel = 'home' | 'school' | 'work' | 'other';
export const savedAddressIcons = {
	home: {
		name: 'Home',
		icon: <GiHouse />,
	},
	school: {
		name: 'School',
		icon: <IoSchoolSharp />,
	},
	work: {
		name: 'Work',
		icon: <GiSuitcase />,
	},
	other: {
		name: 'Other',
		icon: <PiMapPinAreaFill />,
	},
};

function ProfileAddressesContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get('redirectTo');

	const { getAddresses, deleteAddress } = useProfileActions();
	const {
		data: addresses,
		isLoading: addressesLoading,
		refetch,
	} = getAddresses();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

	const { mutate: deleteAddressMutate, isPending: isDeleting } =
		deleteAddress({
			onSuccess: () => {
				refetch();
				setIsDeleteModalOpen(false);
				setAddressToDelete(null);
			},
		});

	const handleDelete = (id: string) => {
		setAddressToDelete(id);
		setIsDeleteModalOpen(true);
	};

	const isEmpty = addresses && addresses?.length === 0 && !addressesLoading;

	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Delivery address</h1>
			</div>
			<SectionWrapper className='flex flex-col items-center max-w-lg px-0!'>
				<div className='w-full space-y-5'>
					<div className='w-full px-5'>
						<Link
							href={`${PAGES_DATA.profile_set_address_manually}${redirectTo ? `?redirectTo=${redirectTo}` : ''}`}
							className='w-full'>
							<Suspense
								fallback={
									<SearchInputSkeleton placeholder='Enter new address' />
								}>
								<SearchInput
									placeholder='Enter new address'
									disabled={true}
								/>
							</Suspense>
						</Link>
					</div>

					{/* <UseCurentAddressDrawer
						addAddressEffect={() => refetch()}
					/> */}
				</div>
			</SectionWrapper>

			<SectionWrapper className='flex flex-col items-center max-w-lg gap-5 px-0!'>
				<p className='text-foreground/50 text-lg w-full text-start px-5'>
					Saved locations
				</p>

				{addressesLoading && (
					<div className='w-full flex flex-col'>
						<AddressListItemSkeleton />
						<AddressListItemSkeleton className='bg-foreground/5' />
						<AddressListItemSkeleton />
					</div>
				)}

				{!addressesLoading && isEmpty && (
					<div className='w-full p-5 flex flex-col gap-5 items-center justify-center'>
						<ImageWithFallback
							src={'/assets/cityillustration.png'}
							className='max-w-xs'
						/>
						<div className='text-center'>
							<h3 className='font-bold text-xl'>
								No saved addresses
							</h3>
							<p className='text-sm font-light'>
								Your saved address will appear here
							</p>
						</div>
					</div>
				)}

				{!addressesLoading && !isEmpty && (
					<div className='w-full flex flex-col'>
						{addresses?.map((address, index) => {
							return (
								<AddressListItem
									key={address.id}
									addressType={
										address?.label as IAddressLabel
									}
									line1={address?.line1}
									line2={address?.line2}
									className={
										index % 2 !== 0 && 'bg-foreground/5'
									}
									onEdit={() => {
										// Navigate to set-manually with addressId
										router.push(
											`${PAGES_DATA.profile_set_address_manually}?addressId=${address.id}${redirectTo ? `&redirectTo=${redirectTo}` : ''}`,
										);
									}}
									onDelete={() => handleDelete(address.id)}
								/>
							);
						})}
					</div>
				)}
			</SectionWrapper>

			<ConfirmationAlertDialogue
				open={isDeleteModalOpen}
				setOpen={setIsDeleteModalOpen}
				title='Delete Address'
				subtitle='Are you sure you want to delete this address? This action cannot be undone.'
				buttonActionLabel={isDeleting ? 'Deleting...' : 'Delete'}
				buttonVariant='destructive'
				action={() => {
					if (addressToDelete) {
						deleteAddressMutate({ id: addressToDelete });
					}
				}}
			/>
		</PageWrapper>
	);
}

export default function ProfileAddressesPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ProfileAddressesContent />
		</Suspense>
	);
}

const AddressListItem = ({
	className,
	addressType,
	line1,
	line2,
	onEdit,
	onDelete,
}: {
	className?: ClassNameValue;
	addressType?: IAddressLabel;
	line1: string;
	line2?: string | null;
	onEdit?: () => void;
	onDelete?: () => void;
}) => {
	return (
		<div
			className={cn(
				'px-5 py-3 bg-background flex items-center justify-between text-start text-foreground border-b',
				className,
			)}>
			<div className='flex flex-col gap-1 overflow-hidden text-nowrap whitespace-nowrap'>
				<div className='flex gap-2 items-center'>
					{addressType === 'home' ||
					addressType === 'school' ||
					addressType === 'work' ? (
						<>
							{savedAddressIcons[addressType].icon}{' '}
							<p className='font-semibold'>
								{savedAddressIcons[addressType].name}
							</p>
						</>
					) : (
						<>
							{savedAddressIcons['other'].icon}{' '}
							<p className='font-semibold'>
								{shortenText(addressType || 'Other', 30)}
							</p>
						</>
					)}
				</div>
				<p className='text-sm w-full overflow-hidden text-ellipsis'>
					{line1}
				</p>
				<p className='text-xs text-foreground/50 w-full overflow-hidden text-ellipsis'>
					{line2 || line1}
				</p>
			</div>

			<div className='flex gap-4 items-center pl-2'>
				<button
					onClick={(e) => {
						e.preventDefault();
						onEdit?.();
					}}
					className='p-2 hover:bg-foreground/10 rounded-full transition-colors'
					aria-label='Edit address'>
					<FiEdit2 className='w-4 h-4 text-foreground/60' />
				</button>
				<button
					onClick={(e) => {
						e.preventDefault();
						onDelete?.();
					}}
					className='p-2 hover:bg-destructive/10 rounded-full transition-colors'
					aria-label='Delete address'>
					<FiTrash2 className='w-4 h-4 text-destructive' />
				</button>
			</div>
		</div>
	);
};

const AddressListItemSkeleton = ({
	className,
}: {
	className?: ClassNameValue;
}) => {
	return (
		<div
			className={cn(
				'px-5 py-2 bg-background flex flex-col gap-2 text-start text-foreground overflow-hidden text-nowrap whitespace-nowrap border-b',
				className,
			)}>
			<div className='flex gap-2 items-center'>
				<Skeleton className='h-5 w-5 rounded-sm' />
				<Skeleton className='h-4 w-20' />
			</div>
			<Skeleton className='h-4 w-full' />
			<Skeleton className='h-3 w-1/2' />
		</div>
	);
};
