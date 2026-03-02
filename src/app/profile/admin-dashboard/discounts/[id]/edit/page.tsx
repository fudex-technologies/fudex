'use client';

import React, { useState, useEffect } from 'react';
import { DiscountType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { use } from 'react';
import { useDiscountActions } from '@/api-hooks/useDiscountActions';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import GoBackButton from '@/components/GoBackButton';
import { PAGES_DATA } from '@/data/pagesData';
import { Button } from '@/components/ui/button';

export default function EditDiscountPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const router = useRouter();
	const { id } = use(params);
	const { useGetDiscountById, updateDiscount: updateDiscountAction } =
		useDiscountActions();

	const { data: discount, isLoading } = useGetDiscountById({ id });

	const [formData, setFormData] = useState({
		name: '',
		description: '',
		value: '' as string | number,
		usageLimit: '' as string | number,
		startAt: '',
		endAt: '',
		isActive: true,
	});

	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		if (discount && !isInitialized) {
			const d = discount as any;
			setFormData({
				name: d.name,
				description: d.description || '',
				value: d.value,
				usageLimit: d.usageLimit || '',
				startAt: format(new Date(d.startAt), "yyyy-MM-dd'T'HH:mm"),
				endAt: format(new Date(d.endAt), "yyyy-MM-dd'T'HH:mm"),
				isActive: d.isActive,
			});
			setIsInitialized(true);
		}
	}, [discount, isInitialized]);

	const updateMutation = updateDiscountAction({
		onSuccess: () => {
			router.push('/profile/admin-dashboard/discounts');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name) return toast.error('Name is required');
		if (!formData.value || Number(formData.value) <= 0)
			return toast.error('Valid value is required');

		updateMutation.mutate({
			id,
			name: formData.name,
			description: formData.description,
			value: Number(formData.value),
			usageLimit: formData.usageLimit
				? Number(formData.usageLimit)
				: null,
			startAt: new Date(formData.startAt),
			endAt: new Date(formData.endAt),
			isActive: formData.isActive,
		});
	};

	if (isLoading) return <div className='p-8'>Loading...</div>;
	if (!discount) return <div className='p-8'>Discount not found</div>;

	const d = discount as any;

	return (
		<SectionWrapper className='p-5 max-w-4xl mx-auto space-y-8'>
			<div className='flex items-center gap-3 mb-5'>
				<GoBackButton
					link={PAGES_DATA.admin_dashboard_discounts_page}
				/>
				<h2 className='text-xl font-semibold'>Edit Discount</h2>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2'>
					<form
						onSubmit={handleSubmit}
						className='bg-background p-6 md:p-8 rounded-xl shadow-sm border space-y-6'>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div className='col-span-1 md:col-span-2 space-y-2'>
								<label className='text-sm font-medium text-foreground/70'>
									Discount Name *
								</label>
								<input
									required
									type='text'
									value={formData.name}
									onChange={(e) =>
										setFormData((f) => ({
											...f,
											name: e.target.value,
										}))
									}
									className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'
								/>
							</div>

							<div className='col-span-1 md:col-span-2 space-y-2'>
								<label className='text-sm font-medium text-foreground/70'>
									Description
								</label>
								<textarea
									value={formData.description}
									onChange={(e) =>
										setFormData((f) => ({
											...f,
											description: e.target.value,
										}))
									}
									className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none min-h-[80px] bg-background'
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium text-foreground/70'>
									Value ({d.type === 'PERCENTAGE' ? '%' : '₦'}
									) *
								</label>
								<input
									required
									type='number'
									value={formData.value}
									onChange={(e) =>
										setFormData((f) => ({
											...f,
											value: e.target.value,
										}))
									}
									className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium text-foreground/70'>
									Usage Limit (Optional)
								</label>
								<input
									type='number'
									value={formData.usageLimit}
									onChange={(e) =>
										setFormData((f) => ({
											...f,
											usageLimit: e.target.value,
										}))
									}
									placeholder='Unlimited if empty'
									className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium text-foreground/70'>
									Start Date *
								</label>
								<input
									required
									type='datetime-local'
									value={formData.startAt}
									onChange={(e) =>
										setFormData((f) => ({
											...f,
											startAt: e.target.value,
										}))
									}
									className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'
								/>
							</div>

							<div className='space-y-2'>
								<label className='text-sm font-medium text-foreground/70'>
									End Date *
								</label>
								<input
									required
									type='datetime-local'
									value={formData.endAt}
									onChange={(e) =>
										setFormData((f) => ({
											...f,
											endAt: e.target.value,
										}))
									}
									className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'
								/>
							</div>

							<div className='flex items-center gap-2'>
								<input
									type='checkbox'
									id='isActive'
									checked={formData.isActive}
									onChange={(e) =>
										setFormData((f) => ({
											...f,
											isActive: e.target.checked,
										}))
									}
									className='w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded'
								/>
								<label
									htmlFor='isActive'
									className='text-sm font-medium text-foreground/70'>
									Discount is active
								</label>
							</div>
						</div>

						<div className='pt-4'>
							<Button
								type='submit'
								className='w-full'
								disabled={updateMutation.isPending}>
								{updateMutation.isPending
									? 'Updating...'
									: 'Update Discount'}
							</Button>
						</div>
					</form>
				</div>

				<div className='lg:col-span-1 space-y-6'>
					<div className='bg-muted/30 p-6 rounded-xl border space-y-4'>
						<h3 className='font-bold text-foreground'>Summary</h3>
						<div className='space-y-2 text-sm'>
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>
									Scope:
								</span>
								<span className='font-medium'>
									{d.scope.replace('_', ' ')}
								</span>
							</div>
							{d.vendor && (
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>
										Vendor:
									</span>
									<span className='font-medium text-right'>
										{d.vendor.name}
									</span>
								</div>
							)}
							{d.productItem && (
								<div className='flex justify-between'>
									<span className='text-muted-foreground'>
										Product:
									</span>
									<span className='font-medium text-right'>
										{d.productItem.name}
									</span>
								</div>
							)}
							<div className='flex justify-between'>
								<span className='text-muted-foreground'>
									Usage:
								</span>
								<span className='font-medium'>
									{d.usageCount} / {d.usageLimit || '∞'}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
}
