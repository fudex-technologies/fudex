'use client';

import GoBackButton from '@/components/GoBackButton';
import { Input } from '@/components/ui/input';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { useState, useEffect, Suspense } from 'react';
import { savedAddressIcons } from '../page';
import InputField, { SelectField } from '@/components/InputComponent';
import { nigeriaStatesData } from '@/lib/staticData/nigeriaStatesData';
import { Button } from '@/components/ui/button';
import ConfirmLocationModal from './ConfirmLocationModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { useProfileActions } from '@/api-hooks/useProfileActions';

interface IFormData {
	address: string;
	city: string;
	country: string;
}
interface IFormTouchedData {
	address?: boolean;
	city?: boolean;
	country?: boolean;
	area?: boolean;
}
const initialFormData = {
	address: '',
	city: 'Ekiti',
	country: 'Nigeria',
};

function SetAddressManuallyContent() {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [selectedLabel, setSelectedabel] = useState<
		'home' | 'school' | 'work' | 'other'
	>('home');
	const [customLabel, setCustomLabel] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
	const router = useRouter();
	const searchParams = useSearchParams();
	const addressId = searchParams.get('addressId');
	const redirectTo = searchParams.get('redirectTo');

	const {
		addAddress,
		updateAddress,
		getAllAreasInEkiti,
		getAddresses,
		getAddress,
	} = useProfileActions();
	const { refetch } = getAddresses();
	const { data: listOfAreasInEkiti, isLoading: loadingAreas } =
		getAllAreasInEkiti();

	const { data: existingAddress, isLoading: loadingAddress } = getAddress(
		addressId || '',
	);

	useEffect(() => {
		if (existingAddress) {
			setForm({
				address: existingAddress.line1,
				city: existingAddress.city,
				country: existingAddress.country || 'Nigeria',
			});
			setSelectedAreaId(existingAddress.areaId);
			const label = existingAddress.label?.toLowerCase();
			if (
				label === 'home' ||
				label === 'school' ||
				label === 'work' ||
				label === 'other'
			) {
				setSelectedabel(label as any);
			} else {
				setSelectedabel('other');
				setCustomLabel(existingAddress.label || '');
			}
		}
	}, [existingAddress]);

	const { mutate: addAddressMutate, isPending: addingAddress } = addAddress({
		onSuccess: () => {
			refetch();
			setConfirmOpen(false);
			router.push(redirectTo || PAGES_DATA.profile_addresses_page);
		},
	});

	const { mutate: updateAddressMutate, isPending: updatingAddress } =
		updateAddress({
			onSuccess: () => {
				refetch();
				setConfirmOpen(false);
				router.push(redirectTo || PAGES_DATA.profile_addresses_page);
			},
		});

	const isEditing = !!addressId;
	const isPending = addingAddress || updatingAddress;

	const validate = () => {
		const newErrors: any = {};
		if (!form.address) newErrors.address = 'Address is required';
		if (!form.city) newErrors.city = 'City is required';
		if (!form.country) newErrors.country = 'Country is required';
		if (!selectedAreaId) newErrors.area = 'Area is required';

		return newErrors;
	};
	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setTouched({
			address: true,
			city: true,
			country: true,
			area: true,
		});
		if (!isFormValid) return;
		setConfirmOpen(true);
	};

	const handleChange =
		(field: string) =>
		(e: React.ChangeEvent<HTMLInputElement> | string) => {
			setForm({
				...form,
				[field]: typeof e === 'string' ? e : e.target.value,
			});
			setTouched({ ...touched, [field]: true });
		};

	return (
		<PageWrapper className='flex flex-col items-center px-5'>
			<div className='flex items-center gap-10 w-full '>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>
					{isEditing ? 'Edit Address' : 'Set Location Manually'}
				</h1>
			</div>

			<SectionWrapper className='flex flex-col items-center max-w-lg gap-5 mt-10 sm:mt-0 px-0!'>
				<form
					onSubmit={handleFormSubmit}
					className='w-full flex flex-col gap-3'>
					<InputField
						type='text'
						label='Address'
						value={form.address}
						placeholder='e.g Enoch and Daniel hostel, Road 5, Iworoko rd'
						onChange={handleChange('address')}
						error={touched.address && errorsNow.address}
						required
					/>
					<SelectField
						data={
							listOfAreasInEkiti?.map((area) => ({
								label: area.name.toLocaleUpperCase(),
								value: area.id,
							})) || []
						}
						label='Area'
						onChange={(value) => {
							setSelectedAreaId(value as string);
							setTouched({ ...touched, area: true });
						}}
						value={selectedAreaId || ''}
						error={touched.area && errorsNow.area}
						placeholder='Select your area'
						disabled={loadingAreas}
						required
					/>
					<SelectField
						data={nigeriaStatesData.map((state) => ({
							label: state,
							value: state,
						}))}
						label='City'
						onChange={handleChange('city')}
						value={form.city}
						error={touched.city && errorsNow.city}
						required
						disabled
					/>
					<InputField
						type='text'
						label='Country'
						value={form.country}
						placeholder='Country'
						onChange={handleChange('country')}
						error={touched.country && errorsNow.country}
						required
						disabled
					/>

					<div className='w-full space-y-2 my-5'>
						<p className='font-semibold'>Address Label</p>

						<div className='w-full flex gap-3 items-center justify-between font-normal'>
							<div
								onClick={() => setSelectedabel('home')}
								className={cn(
									'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
									selectedLabel === 'home' &&
										'border-primary text-primary',
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
										'border-primary text-primary',
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
										'border-primary text-primary',
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
										'border-primary text-primary',
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
								onChange={(e) => setCustomLabel(e.target.value)}
							/>
						)}
					</div>

					<Button
						variant={'game'}
						className='w-full py-5 my-3'
						disabled={!isFormValid || loadingAddress || isPending}>
						{isEditing ? 'Update Address' : 'Continue'}
					</Button>
				</form>
			</SectionWrapper>

			<ConfirmLocationModal
				open={confirmOpen}
				setOpen={setConfirmOpen}
				locationData={form}
				handleAddAddress={() => {
					if (!selectedAreaId) return;
					const addressData = {
						city: form.city,
						country: form.country,
						line1: form.address,
						label:
							selectedLabel === 'other'
								? customLabel || 'Other'
								: selectedLabel,
						areaId: selectedAreaId,
					};

					if (isEditing && addressId) {
						updateAddressMutate({
							id: addressId,
							data: addressData,
						});
					} else {
						addAddressMutate(addressData);
					}
				}}
				pending={isPending}
			/>
		</PageWrapper>
	);
}

export default function SetAddressManually() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SetAddressManuallyContent />
		</Suspense>
	);
}
