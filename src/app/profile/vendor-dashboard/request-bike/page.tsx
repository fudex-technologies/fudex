'use client';

import { useProfileActions } from '@/api-hooks/useProfileActions';
import GoBackButton from '@/components/GoBackButton';
import InputField, {
	SelectField,
	TextAreaField,
} from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';
import { useState } from 'react';

interface IFormData {
	noOfOrders: string;
	customerName: string;
	customerPhone: string;
	areaId: string;
	customerAddress: string;
}

interface IFormTouchedData {
	noOfOrders?: boolean;
	customerName?: boolean;
	customerPhone?: boolean;
	areaId?: boolean;
	customerAddress?: boolean;
}

const initialFormData = {
	noOfOrders: '',
	customerName: '',
	customerPhone: '',
	areaId: '',
	customerAddress: '',
};

export default function VendorDashboardRequestBikePage() {
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});

	const { getAllAreasInEkiti } = useProfileActions();
	const { data: listOfAreasInEkiti, isLoading: loadingAreas } =
		getAllAreasInEkiti();

	const validate = () => {
		const newErrors: any = {};
		if (!form.areaId) newErrors.areaId = 'Area is required';
		if (!form.customerName)
			newErrors.customerName = 'Customer name is required';
		if (!form.noOfOrders)
			newErrors.noOfOrders = 'Number of orders is required';
		if (!form.customerAddress)
			newErrors.customerAddress = 'Customer address is required';
		if (!form.customerPhone)
			newErrors.customerPhone = 'Customer phone number is required';
		else if (!validatePhoneNumberRegex(form.customerPhone))
			newErrors.customerPhone = 'Invalid customer phone number format';

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
		<PageWrapper>
			<div className='flex items-center gap-10 w-full px-5 '>
				<GoBackButton className='!' />
				<h1 className='font-bold text-lg'>Request Delivery bike</h1>
			</div>
			<SectionWrapper className='w-full max-w-lg mx-auto'>
				<p className='my-5'>
					Kindly fill in the customer’s details correctly to help us
					locate their address easily, and ensure our rider gets
					accurate information for a smooth delivery.
				</p>
				<form action=''>
					<InputField
						type='number'
						label='Number of orders'
						value={form.noOfOrders}
						onChange={handleChange('noOfOrders')}
						placeholder='7012345678'
						error={touched.noOfOrders && errorsNow.noOfOrders}
						required
					/>
					<InputField
						type='text'
						label='Name of customer'
						value={form.customerName}
						onChange={handleChange('customerName')}
						placeholder='Enter customer name'
						error={touched.customerName && errorsNow.customerName}
						required
					/>
					<InputField
						type='tel'
						label='customerPhone number'
						value={form.customerPhone}
						onChange={handleChange('customerPhone')}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						error={touched.customerPhone && errorsNow.customerPhone}
						required
					/>

					{listOfAreasInEkiti &&
						listOfAreasInEkiti.length > 0 &&
						!loadingAreas && (
							<SelectField
								label='Area'
								data={listOfAreasInEkiti?.map((area) => ({
									value: area.id,
									label: area.name,
								}))}
								value={form.areaId}
								onChange={handleChange('areaId')}
								placeholder='Select area'
								error={touched.areaId && errorsNow.areaId}
								required
							/>
						)}

					<InputField
						type='text'
						label='Customer Address'
						value={form.customerAddress}
						onChange={handleChange('customerAddress')}
						placeholder='Enter customer address'
						error={
							touched.customerAddress && errorsNow.customerAddress
						}
						required
						hint='Including Hostel name, Street, or nearest bus stop'
					/>

					<Button
						variant='game'
						className='mt-5 w-full'
						disabled={!isFormValid}
						type='submit'>
						Request Rider
					</Button>
				</form>
			</SectionWrapper>
		</PageWrapper>
	);
}
