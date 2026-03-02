'use client';

import React, { useState } from 'react';
import { useTRPC as trpc } from '@/trpc/client';
import { DiscountScope, DiscountType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDiscountActions } from '@/api-hooks/useDiscountActions';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { format, addDays } from 'date-fns';
import { toast } from 'sonner';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import GoBackButton from '@/components/GoBackButton';
import { PAGES_DATA } from '@/data/pagesData';
import { Button } from '@/components/ui/button';

export default function CreateDiscountPage() {
	const router = useRouter();
	const { createDiscount: createDiscountAction } = useDiscountActions();
	const { useListVendors, useListProductItems } = useVendorProductActions();

	const [formData, setFormData] = useState<{
		name: string;
		description: string;
		type: DiscountType;
		value: string | number;
		scope: 'PRODUCT_ITEM' | 'VENDOR' | 'PLATFORM' | 'CART';
		vendorId: string;
		productItemId: string;
		usageLimit: string | number;
		startAt: string;
		endAt: string;
		isActive: boolean;
	}>({
		name: '',
		description: '',
		type: DiscountType.PERCENTAGE,
		value: '',
		scope: 'PRODUCT_ITEM',
		vendorId: '',
		productItemId: '',
		usageLimit: '',
		startAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
		endAt: format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm"),
		isActive: true,
	});

	// Query vendors if needed for VENDOR, CART, or PRODUCT_ITEM scopes
	const { data: vendors } = useListVendors({ take: 100 });

	// Query product items if vendor is selected and scope is PRODUCT_ITEM
	const { data: productItems } = useListProductItems({
		vendorId: formData.vendorId,
		take: 100,
	});

	const createMutation = createDiscountAction({
		onSuccess: () => {
			router.push('/profile/admin-dashboard/discounts');
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name) return toast.error('Name is required');
		if (!formData.value || Number(formData.value) <= 0)
			return toast.error('Valid value is required');
		if (
			formData.type === DiscountType.PERCENTAGE &&
			Number(formData.value) > 100
		)
			return toast.error('Percentage cannot exceed 100');

		createMutation.mutate({
			name: formData.name,
			description: formData.description,
			type: formData.type,
			value: Number(formData.value),
			scope: formData.scope,
			vendorId: formData.vendorId || undefined,
			productItemId: formData.productItemId || undefined,
			usageLimit: formData.usageLimit
				? Number(formData.usageLimit)
				: undefined,
			startAt: new Date(formData.startAt),
			endAt: new Date(formData.endAt),
			isActive: formData.isActive,
		});
	};

	return (
		<SectionWrapper className='p-5 max-w-4xl mx-auto space-y-8'>
			<div className='flex items-center gap-3 mb-5'>
				<GoBackButton
					link={PAGES_DATA.admin_dashboard_discounts_page}
				/>
				<h2 className='text-xl font-semibold'>Create Discount</h2>
			</div>

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
							placeholder='e.g. Black Friday 20%'
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
							placeholder='Brief description for internal tracking...'
							className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none min-h-[100px] bg-background'
						/>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium text-foreground/70'>
							Type *
						</label>
						<select
							value={formData.type}
							onChange={(e) =>
								setFormData((f) => ({
									...f,
									type: e.target.value as DiscountType,
								}))
							}
							className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'>
							<option value={DiscountType.PERCENTAGE}>
								Percentage (%)
							</option>
							<option value={DiscountType.FIXED}>
								Fixed Amount (₦)
							</option>
						</select>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium text-foreground/70'>
							Value *
						</label>
						<input
							required
							type='number'
							min='0'
							step={formData.type === 'PERCENTAGE' ? '0.01' : '1'}
							max={
								formData.type === 'PERCENTAGE'
									? '100'
									: undefined
							}
							value={formData.value}
							onChange={(e) =>
								setFormData((f) => ({
									...f,
									value: e.target.value,
								}))
							}
							placeholder={
								formData.type === 'PERCENTAGE'
									? 'e.g. 20'
									: 'e.g. 1000'
							}
							className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'
						/>
					</div>
					<div className='space-y-2 col-span-1 md:col-span-2'>
						<label className='text-sm font-medium text-foreground/70'>
							Scope *
						</label>
						<select
							value={formData.scope}
							onChange={(e) => {
								setFormData((f) => ({
									...f,
									scope: e.target.value as any,
									vendorId: '',
									productItemId: '',
								}));
							}}
							className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'>
							<option value={DiscountScope.PLATFORM}>
								Platform-Wide (all products)
							</option>
							<option value={DiscountScope.VENDOR}>
								Specific Vendor (all products in vendor)
							</option>
							<option value={DiscountScope.PRODUCT_ITEM}>
								Specific Product Item
							</option>
							<option value={DiscountScope.CART}>
								Cart Total (on checkout)
							</option>
						</select>
						{formData.scope === DiscountScope.CART && (
							<p className='text-xs text-blue-600 bg-blue-50/50 rounded px-3 py-2'>
								💡 Cart discount is deducted from the vendor
								subtotal at checkout. Leave vendor blank to
								apply to all vendors.
							</p>
						)}
					</div>
					{/* Conditional Vendor Selection - for VENDOR, CART, and PRODUCT_ITEM scopes */}
					{(formData.scope === DiscountScope.VENDOR ||
						formData.scope === DiscountScope.PRODUCT_ITEM ||
						formData.scope === DiscountScope.CART) && (
						<div
							className={`space-y-2 ${formData.scope === DiscountScope.VENDOR || formData.scope === DiscountScope.CART ? 'col-span-1 md:col-span-2' : ''}`}>
							<label className='text-sm font-medium text-foreground/70'>
								{formData.scope === DiscountScope.CART
									? 'Vendor (Optional — leave blank for all vendors)'
									: 'Select Vendor *'}
							</label>
							<select
								required={formData.scope !== DiscountScope.CART}
								value={formData.vendorId}
								onChange={(e) =>
									setFormData((f) => ({
										...f,
										vendorId: e.target.value,
										productItemId: '',
									}))
								}
								className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'>
								<option value=''>
									{formData.scope === DiscountScope.CART
										? 'All vendors (platform-wide cart)'
										: 'Select a vendor'}
								</option>
								{vendors?.map((v: any) => (
									<option key={v.id} value={v.id}>
										{v.name}
									</option>
								))}
							</select>
						</div>
					)}
					{/* Conditional Product Selection */}
					{formData.scope === DiscountScope.PRODUCT_ITEM && (
						<div className='space-y-2'>
							<label className='text-sm font-medium text-foreground/70'>
								Select Product Item *
							</label>
							<select
								required
								disabled={!formData.vendorId}
								value={formData.productItemId}
								onChange={(e) =>
									setFormData((f) => ({
										...f,
										productItemId: e.target.value,
									}))
								}
								className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none disabled:bg-muted disabled:cursor-not-allowed bg-background'>
								<option value=''>Select a product</option>
								{productItems?.map((p: any) => (
									<option key={p.id} value={p.id}>
										{p.name} - ₦{p.price}
									</option>
								))}
							</select>
						</div>
					)}
					<div className='space-y-2 col-span-1 md:col-span-2 border-t pt-6 mt-2'>
						<label className='text-sm font-medium text-foreground/70'>
							Usage & Dates
						</label>
					</div>
					<div className='space-y-2'>
						<label className='text-sm font-medium text-foreground/70'>
							Usage Limit (Leave empty for unlimited)
						</label>
						<input
							type='number'
							min='1'
							value={formData.usageLimit}
							onChange={(e) =>
								setFormData((f) => ({
									...f,
									usageLimit: e.target.value,
								}))
							}
							placeholder='e.g. 50'
							className='w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary outline-none bg-background'
						/>
					</div>
					<div className='hidden md:block'></div> {/* spacer */}
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
					<div className='col-span-1 md:col-span-2 pt-4'>
						<label className='flex items-center gap-2 cursor-pointer'>
							<input
								type='checkbox'
								checked={formData.isActive}
								onChange={(e) =>
									setFormData((f) => ({
										...f,
										isActive: e.target.checked,
									}))
								}
								className='w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary'
							/>
							<span className='text-foreground font-medium text-sm'>
								Active configuration
							</span>
						</label>
						<p className='text-xs text-muted-foreground mt-1 ml-6'>
							If unchecked, this discount will not apply
							regardless of dates.
						</p>
					</div>
				</div>

				<div className='pt-6 border-t flex justify-end gap-3'>
					<Button
						variant='outline'
						type='button'
						onClick={() => router.back()}
						disabled={createMutation.isPending}>
						Cancel
					</Button>
					<Button type='submit' disabled={createMutation.isPending}>
						{createMutation.isPending
							? 'Creating...'
							: 'Create Discount'}
					</Button>
				</div>
			</form>
		</SectionWrapper>
	);
}
