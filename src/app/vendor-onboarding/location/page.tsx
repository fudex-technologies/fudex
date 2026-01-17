"use client"

import { useProfileActions } from '@/api-hooks/useProfileActions';
import InputField, { SelectField } from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import { useState } from 'react';

interface IFormData {
	country: string;
	state: string;
	localGovernment: string;
	businessAddress: string;
}

interface IFormTouchedData {
	country?: boolean;
	state?: boolean;
	localGovernment?: boolean;
	businessAddress?: boolean;
	area?: boolean;
}

const initialFormData = {
	country: 'Nigeria',
	state: 'Ekiti',
	localGovernment: '',
	businessAddress: '',
};

export default function VendorOnboardingLocation() {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [selectedAreaId, setSelectedAreaId] = useState<string | undefined>();

	const [touched, setTouched] = useState<IFormTouchedData>({});

	const { getAllAreasInEkiti } = useProfileActions();
	const { data: listOfAreasInEkiti, isLoading: loadingAreas } =
		getAllAreasInEkiti();

	const validate = () => {
		const newErrors: any = {};
		if (!form.country) newErrors.country = 'Country is required';
		if (!form.businessAddress)
			newErrors.businessAddress = 'Address is required';
		if (!selectedAreaId) newErrors.area = 'Area is required';

		return newErrors;
	};
	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

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
		<VendorOnboardingFormsWrapper>
			<div className='w-full'>
				<div className='w-full my-3 space-y-2'>
					<p className='font-light text-foreground/50 leading-[100%]'>
						Let’s confirm your location
					</p>
				</div>
				<form className='w-full'>
					<SelectField
						disabled
						data={[
							{
								label: 'Nigeria',
								value: 'Nigeria',
							},
						]}
						type='text'
						label='Country'
						value={form.country}
						onChange={handleChange('country')}
						error={touched.country && errorsNow.country}
						required
					/>
					<SelectField
						disabled
						data={[
							{
								label: 'Ekiti',
								value: 'Ekiti',
							},
						]}
						type='text'
						label='State'
						value={form.state}
						onChange={handleChange('state')}
						error={touched.state && errorsNow.state}
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
					<InputField
						type='text'
						label='Business Address'
						value={form.businessAddress}
						onChange={handleChange('businessAddress')}
						placeholder='e.g Satelite Road, beside MFM church'
						error={
							touched.businessAddress && errorsNow.businessAddress
						}
						required
						className=''
						hint='Including Street, House No. or landmark or nearest bus stop'
					/>

					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={
							!isFormValid
							// || isPending
						}>
						{/* {isPending ? 'Sending...' : 'Continue'} */}
						Continue
					</Button>
				</form>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
