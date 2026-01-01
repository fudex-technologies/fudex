'use client';

import GoBackButton from '@/components/GoBackButton';
import { Input } from '@/components/ui/input';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { savedAddressIcons } from '../page';
import InputField, { SelectField } from '@/components/InputComponent';
import { nigeriaStatesData } from '@/lib/staticData/nigeriaStatesData';
import { Button } from '@/components/ui/button';
import ConfirmLocationModal from './ConfirmLocationModal';
import { usePRofileActions } from '@/api-hooks/useProfileActions';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';

interface IFormData {
	address: string;
	city: string;
	country: string;
}
interface IFormTouchedData {
	address?: boolean;
	city?: boolean;
	country?: boolean;
}
const initialFormData = {
	address: '',
	city: 'Ekiti',
	country: 'Nigeria',
};

export default function SetAddressManually() {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [selectedLabel, setSelectedabel] = useState<
		'home' | 'school' | 'work' | 'other'
	>('home');
	const [customLabel, setCustomLabel] = useState('');
	const [confirmOpen, setConfirmOpen] = useState(false);
	const router = useRouter();

	const { addAddress } = usePRofileActions();
	const { mutate: addAddressMutate, isPending: addingAddress } = addAddress({
		onSuccess: () => {
			setConfirmOpen(false);
			router.push(PAGES_DATA.profile_addresses_page);
		},
	});

	const validate = () => {
		const newErrors: any = {};
		if (!form.address) newErrors.address = 'Address is required';
		if (!form.city) newErrors.city = 'City is required';
		if (!form.country) newErrors.country = 'Country is required';

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
				<h1 className='font-semibold text-xl'>Set Location Manually</h1>
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
						data={nigeriaStatesData.map((state) => ({
							label: state,
							value: state,
						}))}
						label='City'
						onChange={handleChange('city')}
						value={form.city}
						error={touched.address && errorsNow.address}
						required
					/>
					<InputField
						type='text'
						label='Country'
						value={form.country}
						placeholder='Country'
						onChange={handleChange('country')}
						error={touched.country && errorsNow.country}
						required
					/>

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
								onChange={(e) => setCustomLabel(e.target.value)}
							/>
						)}
					</div>

					<Button
						variant={'game'}
						className='w-full py-5 my-3'
						disabled={!isFormValid}>
						Continue
					</Button>
				</form>
			</SectionWrapper>

			<ConfirmLocationModal
				open={confirmOpen}
				setOpen={setConfirmOpen}
				locationData={form}
				handleAddAddress={() => {
					addAddressMutate({
						city: form.city,
						country: form.country,
						line1: form.address,
						label:
							selectedLabel === 'other'
								? customLabel || 'Other'
								: selectedLabel,
					});
				}}
				pending={addingAddress}
			/>
		</PageWrapper>
	);
}
