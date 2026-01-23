'use client';

import { useProfileActions } from '@/api-hooks/useProfileActions';
import GoBackButton from '@/components/GoBackButton';
import InputField, { SelectField } from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { validatePhoneNumberRegex } from '@/lib/commonFunctions';
import { Loader2 } from 'lucide-react';
import { useRiderRequestActions } from '@/api-hooks/useRiderRequestActions';
import { useRouter } from 'next/navigation';
import { PAGES_DATA } from '@/data/pagesData';
import { useState } from 'react';

interface ICustomerData {
	customerName: string;
	customerPhone: string;
	areaId: string;
	customerAddress: string;
}

interface IFormData {
	noOfOrders: string;
	customers: ICustomerData[];
}

const initialCustomerData: ICustomerData = {
	customerName: '',
	customerPhone: '',
	areaId: '',
	customerAddress: '',
};

const initialFormData: IFormData = {
	noOfOrders: '1',
	customers: [initialCustomerData],
};

export default function VendorDashboardRequestBikePage() {
	const router = useRouter();
	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<Record<string, boolean>>({});

	const { getAllAreasInEkiti } = useProfileActions();
	const { data: listOfAreasInEkiti, isLoading: loadingAreas } =
		getAllAreasInEkiti();

	const { requestRider } = useRiderRequestActions();
	const { mutate, isPending } = requestRider({
		onSuccess: () => {
			router.push(PAGES_DATA.vendor_dashboard_delivery_settlement_page);
		},
	});

	const validate = () => {
		const newErrors: Record<string, string> = {};

		form.customers.forEach((customer, index) => {
			if (!customer.customerName)
				newErrors[`customerName_${index}`] =
					'Customer name is required';
			if (!customer.customerPhone)
				newErrors[`customerPhone_${index}`] =
					'Customer phone number is required';
			else if (!validatePhoneNumberRegex(customer.customerPhone))
				newErrors[`customerPhone_${index}`] =
					'Invalid phone number format';

			if (!customer.areaId)
				newErrors[`areaId_${index}`] = 'Area is required';
			if (!customer.customerAddress)
				newErrors[`customerAddress_${index}`] =
					'Customer address is required';
		});

		return newErrors;
	};

	const errorsNow = validate();
	const isFormValid = Object.keys(errorsNow).length === 0;

	const handleNoOfOrdersChange = (value: string) => {
		const count = parseInt(value, 10);
		let newCustomers = [...form.customers];

		if (count > newCustomers.length) {
			const toAdd = count - newCustomers.length;
			for (let i = 0; i < toAdd; i++) {
				newCustomers.push({ ...initialCustomerData });
			}
		} else if (count < newCustomers.length) {
			newCustomers = newCustomers.slice(0, count);
		}

		setForm({
			...form,
			noOfOrders: value,
			customers: newCustomers,
		});
		setTouched({ ...touched, noOfOrders: true });
	};

	const handleCustomerChange =
		(index: number, field: keyof ICustomerData) =>
		(e: React.ChangeEvent<HTMLInputElement> | string) => {
			const newCustomers = [...form.customers];
			newCustomers[index] = {
				...newCustomers[index],
				[field]: typeof e === 'string' ? e : e.target.value,
			};
			setForm({ ...form, customers: newCustomers });
			setTouched({ ...touched, [`${field}_${index}`]: true });
		};

	return (
		<PageWrapper>
			<div className='flex items-center gap-10 w-full px-5 '>
				<GoBackButton className='!' />
				<h1 className='font-bold text-lg'>Request Delivery bike</h1>
			</div>
			<SectionWrapper className='w-full max-w-lg mx-auto'>
				<p className='my-5 text-foreground/70'>
					Kindly fill in the customer’s details correctly to help us
					locate their address easily, and ensure our rider gets
					accurate information for a smooth delivery.
				</p>
				<div className='flex flex-col gap-6'>
					<SelectField
						label='Number of orders'
						data={Array.from({ length: 10 }, (_, i) => ({
							value: (i + 1).toString(),
							label: (i + 1).toString(),
						}))}
						value={form.noOfOrders}
						onChange={handleNoOfOrdersChange}
						placeholder='Select number of orders'
						required
					/>

					{form.customers.map((customer, index) => (
						<div
							key={index}
							className='flex flex-col gap-4 p-5 border rounded-2xl bg-gray-50/50'>
							<h3 className='font-semibold text-primary/80'>
								Customer {index + 1} Details
							</h3>

							<InputField
								type='text'
								label='Name of customer'
								value={customer.customerName}
								onChange={handleCustomerChange(
									index,
									'customerName',
								)}
								placeholder='Enter customer name'
								// error={
								// 	touched[`customerName_${index}`] &&
								// 	errorsNow[`customerName_${index}`]
								// }
								required
							/>

							<InputField
								type='tel'
								label='Customer Phone number'
								value={customer.customerPhone}
								onChange={handleCustomerChange(
									index,
									'customerPhone',
								)}
								placeholder='7012345678'
								icon={
									<ImageWithFallback
										src={'/assets/nigeriaflagicon.svg'}
										className='w-5 h-5'
									/>
								}
								// error={
								// 	touched[`customerPhone_${index}`] &&
								// 	errorsNow[`customerPhone_${index}`]
								// }
								required
							/>

							{listOfAreasInEkiti &&
								listOfAreasInEkiti.length > 0 &&
								!loadingAreas && (
									<SelectField
										label='Area'
										data={listOfAreasInEkiti.map(
											(area) => ({
												value: area.id,
												label: area.name,
											}),
										)}
										value={customer.areaId}
										onChange={handleCustomerChange(
											index,
											'areaId',
										)}
										placeholder='Select area'
										// error={
										// 	touched[`areaId_${index}`] &&
										// 	errorsNow[`areaId_${index}`]
										// }
										required
									/>
								)}

							<InputField
								type='text'
								label='Customer Address'
								value={customer.customerAddress}
								onChange={handleCustomerChange(
									index,
									'customerAddress',
								)}
								placeholder='Enter customer address'
								// error={
								// 	touched[`customerAddress_${index}`] &&
								// 	errorsNow[`customerAddress_${index}`]
								// }
								required
								hint='Including Hostel name, Street, or nearest bus stop'
							/>
						</div>
					))}

					<Button
						variant='game'
						className='mt-5 w-full py-6 text-lg'
						disabled={!isFormValid || isPending}
						onClick={() => {
							mutate({ customers: form.customers });
						}}>
						{isPending ? (
							<Loader2 className='animate-spin' />
						) : (
							`Request Rider for ${form.noOfOrders} ${
								parseInt(form.noOfOrders) > 1
									? 'Orders'
									: 'Order'
							}`
						)}
					</Button>
				</div>
			</SectionWrapper>
		</PageWrapper>
	);
}
