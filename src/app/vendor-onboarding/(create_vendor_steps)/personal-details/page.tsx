'use client';

import InputField, { TextAreaField } from '@/components/InputComponent';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import VendorOnboardingFormsWrapper from '@/components/wrapers/VendorOnboardingFormsWrapper';
import {
	validateEmailRegex,
	validatePhoneNumberRegex,
} from '@/lib/commonFunctions';
import { useTRPC } from '@/trpc/client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { localStorageStrings } from '@/constants/localStorageStrings';
import { useSession } from '@/lib/auth-client';
import { useCategoryActions } from '@/api-hooks/useCategoryActions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PAGES_DATA } from '@/data/pagesData';
import { cn } from '@/lib/utils';

interface IFormData {
	phone: string;
	email: string;
	firstName: string;
	lastName: string;
	businessName: string;
	businessDescription: string;
	categoryIds: string[];
}

interface IFormTouchedData {
	phone?: boolean;
	email?: boolean;
	firstName?: boolean;
	lastName?: boolean;
	businessName?: boolean;
	businessDescription?: boolean;
	categoryIds?: boolean;
}

interface IAvailabilityErrors {
	phone?: string;
	email?: string;
}

const initialFormData = {
	phone: '',
	email: '',
	firstName: '',
	lastName: '',
	businessName: '',
	businessDescription: '',
	categoryIds: [],
};

export default function VendorOnboardingPersonalDetailsPage() {
	const router = useRouter();
	const trpc = useTRPC();
	const { data: session } = useSession();
	const { useListCategories } = useCategoryActions();
	const { data: categoriesData, isLoading: isLoadingCategories } =
		useListCategories();

	const [form, setForm] = useState<IFormData>(initialFormData);
	const [touched, setTouched] = useState<IFormTouchedData>({});
	const [availabilityErrors, setAvailabilityErrors] =
		useState<IAvailabilityErrors>({});
	const [debouncedPhone, setDebouncedPhone] = useState('');
	const [debouncedEmail, setDebouncedEmail] = useState('');
	const [showExistingUserAlert, setShowExistingUserAlert] = useState(false);
	const [showSplitIdentityAlert, setShowSplitIdentityAlert] = useState(false);
	const [existingUserData, setExistingUserData] = useState<any>(null);

	// Pre-fill form data if user is logged in
	useEffect(() => {
		if (session?.user) {
			setForm({
				email: session.user.email || '',
				phone: (session.user as any).phone || '',
				firstName: (session.user as any).firstName || '',
				lastName: (session.user as any).lastName || '',
				businessName: '',
				businessDescription: '',
				categoryIds: [],
			});
		}
	}, [session]);

	// Check if user already has a vendor account to redirect
	const { data: vendorProgress } = useQuery(
		trpc.vendors.getVendorOnboardingProgress.queryOptions(undefined, {
			enabled: !!session?.user,
			retry: false,
		}),
	);

	useEffect(() => {
		if (vendorProgress?.hasVendor) {
			// Already has vendor, redirect to progress or dashboard
			if (vendorProgress.approvalStatus === 'APPROVED') {
				router.push(PAGES_DATA.vendor_dashboard_page);
			} else {
				router.push(PAGES_DATA.vendor_onboarding_progress_page);
			}
		}
	}, [vendorProgress, router]);

	// Check phone availability
	const { data: phoneCheckData, isLoading: isCheckingPhone } = useQuery(
		trpc.phoneAuth.checkPhoneInUse.queryOptions(
			{ phone: debouncedPhone, email: debouncedEmail },
			{
				enabled:
					!!debouncedPhone &&
					validatePhoneNumberRegex(debouncedPhone) &&
					!session?.user,
				retry: false,
			},
		),
	);

	// Check email availability
	const { data: emailCheckData, isLoading: isCheckingEmail } = useQuery(
		trpc.phoneAuth.checkEmailInUse.queryOptions(
			{ email: debouncedEmail, phone: debouncedPhone },
			{
				enabled:
					!!debouncedEmail &&
					validateEmailRegex(debouncedEmail) &&
					!session?.user,
				retry: false,
			},
		),
	);

	// Check user by email or phone for linking flow
	const { data: userCheckData } = useQuery(
		trpc.phoneAuth.checkUserByEmailOrPhone.queryOptions(
			{
				email: debouncedEmail,
				phone: debouncedPhone,
			},
			{
				enabled:
					(!!debouncedEmail || !!debouncedPhone) &&
					!session?.user &&
					(phoneCheckData?.inUse || emailCheckData?.inUse),
				retry: false,
			},
		),
	);

	// Debounce phone input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedPhone(form.phone);
		}, 800);

		return () => clearTimeout(timer);
	}, [form.phone]);

	// Debounce email input
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedEmail(form.email);
		}, 800);

		return () => clearTimeout(timer);
	}, [form.email]);

	// Update availability errors based on query results
	useEffect(() => {
		if (session?.user) return; // Skip if logged in

		// Split Identity Check
		const isSplitIdentity =
			phoneCheckData?.inUse &&
			emailCheckData?.inUse &&
			(phoneCheckData?.emailNotConnected ||
				emailCheckData?.phoneNotConnected);

		if (isSplitIdentity) {
			setAvailabilityErrors({
				phone: 'Phone and Email belong to different accounts',
				email: 'Phone and Email belong to different accounts',
			});
			setShowSplitIdentityAlert(true);
			setShowExistingUserAlert(false); // Can't link if they are different
			setExistingUserData(null);
			return;
		} else {
			setShowSplitIdentityAlert(false);
		}

		// Phone Check
		if (phoneCheckData?.isVendor) {
			setAvailabilityErrors((prev) => ({
				...prev,
				phone: 'This phone number is already used by a vendor account. Please use a different number or log in if you have access.',
			}));
			setShowExistingUserAlert(false);
		} else if (phoneCheckData?.inUse && userCheckData?.exists) {
			setAvailabilityErrors((prev) => ({
				...prev,
				phone: undefined, // Clear error, show alert instead
			}));
			setShowExistingUserAlert(true);
			setExistingUserData(userCheckData.user);
		} else if (phoneCheckData?.inUse) {
			setAvailabilityErrors((prev) => ({
				...prev,
				phone: 'This phone number is already in use, if its your account, you can link it as a vendor account',
			}));
			setShowExistingUserAlert(false);
		} else {
			setAvailabilityErrors((prev) => ({ ...prev, phone: undefined }));
			// Only clear alert if email check doesn't need it
			if (!emailCheckData?.inUse) setShowExistingUserAlert(false);
		}

		// Email Check
		if (emailCheckData?.isVendor) {
			setAvailabilityErrors((prev) => ({
				...prev,
				email: 'This email is already used by a vendor account. Please use a different email or log in if you have access.',
			}));
			setShowExistingUserAlert(false);
		} else if (emailCheckData?.inUse && userCheckData?.exists) {
			setAvailabilityErrors((prev) => ({
				...prev,
				email: undefined, // Clear error, show alert instead
			}));
			setShowExistingUserAlert(true);
			setExistingUserData(userCheckData.user);
		} else if (emailCheckData?.inUse) {
			setAvailabilityErrors((prev) => ({
				...prev,
				email: 'This email is already in use, if its your account, you can link it as a vendor account',
			}));
			setShowExistingUserAlert(false);
		} else {
			setAvailabilityErrors((prev) => ({ ...prev, email: undefined }));
			// Only clear alert if phone check doesn't need it
			if (!phoneCheckData?.inUse) setShowExistingUserAlert(false);
		}
	}, [phoneCheckData, emailCheckData, userCheckData, session?.user]);

	const validate = () => {
		const newErrors: any = {};
		if (!form.firstName) newErrors.firstName = 'First name is required';
		if (!form.lastName) newErrors.lastName = 'Last name is required';
		if (!form.businessName)
			newErrors.businessName = 'Business name is required';
		if (!form.email) newErrors.email = 'Email is required';
		else if (!validateEmailRegex(form.email))
			newErrors.email = 'Invalid email';
		if (!form.phone) newErrors.phone = 'Phone number is required';
		else if (!validatePhoneNumberRegex(form.phone))
			newErrors.phone = 'Invalid phone number format';

		return newErrors;
	};

	const errorsNow = validate();
	const hasAvailabilityErrors = !!(
		availabilityErrors.phone || availabilityErrors.email
	);
	const isFormValid =
		Object.keys(errorsNow).length === 0 && !hasAvailabilityErrors;

	const handleChange =
		(field: string) =>
		(
			e:
				| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
				| string,
		) => {
			setForm({
				...form,
				[field]: typeof e === 'string' ? e : e.target.value,
			});
			setTouched({ ...touched, [field]: true });
		};

	const handleCategoryToggle = (categoryId: string) => {
		setForm((prev) => {
			const isSelected = prev.categoryIds.includes(categoryId);
			return {
				...prev,
				categoryIds: isSelected
					? prev.categoryIds.filter((id) => id !== categoryId)
					: [...prev.categoryIds, categoryId],
			};
		});
		setTouched({ ...touched, categoryIds: true });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!isFormValid) return;

		// Store form data in localStorage
		localStorage.setItem(
			localStorageStrings.vendorOnboardinPersonalDetailsstring,
			JSON.stringify(form),
		);

		// Navigate to location page
		router.push(PAGES_DATA.vendor_onboarding_location_page);
	};

	return (
		<VendorOnboardingFormsWrapper goBack={false}>
			<div className='w-full'>
				<div className='w-full my-3 space-y-2'>
					<h1 className='font-bold text-xl leading-[100%]'>
						Personal details
					</h1>
					<p className='font-light text-foreground/50 leading-[100%]'>
						Let's get you started on Fudex
					</p>
				</div>

				{showExistingUserAlert &&
					existingUserData &&
					!showSplitIdentityAlert && (
						<Alert className='mb-4 border-primary bg-blue-50'>
							<Info className='h-4 w-4 text-primary' />
							<AlertDescription className='text-sm text-primary'>
								An account with this{' '}
								{emailCheckData?.inUse ? 'email' : 'phone'}{' '}
								already exists. If this is your account, you can
								proceed to link it as a vendor account.
							</AlertDescription>
						</Alert>
					)}

				{showSplitIdentityAlert && (
					<Alert className='mb-4 border-red-500 bg-red-50'>
						<Info className='h-4 w-4 text-red-500' />
						<AlertDescription className='text-sm text-red-700'>
							The email and phone number you entered belong to
							different accounts. Please use details from a single
							account or use new details found in neither.
						</AlertDescription>
					</Alert>
				)}

				<form className='w-full' onSubmit={handleSubmit}>
					<div className='flex gap-2'>
						<InputField
							type='text'
							label='First name'
							value={form.firstName}
							onChange={handleChange('firstName')}
							placeholder='e.g Olaide'
							error={touched.firstName && errorsNow.firstName}
							required
							className=''
						/>
						<InputField
							type='text'
							label='Last name'
							value={form.lastName}
							onChange={handleChange('lastName')}
							placeholder='e.g Igotun'
							error={touched.lastName && errorsNow.lastName}
							required
						/>
					</div>
					<InputField
						type='tel'
						label='Phone number'
						value={form.phone}
						onChange={handleChange('phone')}
						placeholder='7012345678'
						icon={
							<ImageWithFallback
								src={'/assets/nigeriaflagicon.svg'}
								className='w-5 h-5'
							/>
						}
						error={touched.phone && errorsNow.phone}
						hint={
							isCheckingPhone
								? 'Checking availability...'
								: availabilityErrors.phone
									? availabilityErrors.phone
									: undefined
						}
						required
						disabled={!!session?.user}
					/>
					<InputField
						type='email'
						label='Email address'
						value={form.email}
						onChange={handleChange('email')}
						placeholder='example@gmail.com'
						error={touched.email && errorsNow.email}
						hint={
							isCheckingEmail
								? 'Checking availability...'
								: availabilityErrors.email
									? availabilityErrors.email
									: undefined
						}
						required
						disabled={!!session?.user}
					/>
					<InputField
						type='text'
						label='Business name'
						value={form.businessName}
						onChange={handleChange('businessName')}
						placeholder='e.g Mama Put'
						error={touched.businessName && errorsNow.businessName}
						required
						className=''
					/>
					<TextAreaField
						type='text'
						label='Business Description'
						value={form.businessDescription}
						onChange={handleChange('businessDescription')}
						placeholder='Enter your business description here'
						error={
							touched.businessDescription &&
							errorsNow.businessDescription
						}
					/>
					<div className='w-full space-y-3 my-4'>
						<div className='space-y-1'>
							<Label className='text-sm font-medium'>
								Vendor Categories
							</Label>
							<p className='text-xs text-foreground/50'>
								Select the categories that best describe your
								business (e.g., Cakes, Fast Food)
							</p>
						</div>

						{isLoadingCategories ? (
							<div className='flex flex-wrap gap-2 animate-pulse'>
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className='h-8 w-20 bg-muted rounded-full'
									/>
								))}
							</div>
						) : (
							<div className='flex flex-wrap gap-3'>
								{categoriesData?.map((category) => (
									<div
										key={category.id}
										className={cn(
											'flex items-center gap-2 p-2 px-3 rounded-full border cursor-pointer transition-colors',
											form.categoryIds.includes(
												category.id,
											)
												? 'bg-primary/10 border-primary text-primary'
												: 'bg-background border-input hover:border-primary/50',
										)}
										onClick={() =>
											handleCategoryToggle(category.id)
										}>
										<Checkbox
											id={`cat-${category.id}`}
											checked={form.categoryIds.includes(
												category.id,
											)}
											onCheckedChange={() =>
												handleCategoryToggle(
													category.id,
												)
											}
											className='hidden'
										/>
										<span className='text-sm font-medium whitespace-nowrap'>
											{category.name}
										</span>
									</div>
								))}
							</div>
						)}
					</div>

					<Button
						type='submit'
						variant={'game'}
						className='w-full py-5'
						disabled={!isFormValid}>
						Continue
					</Button>
				</form>
			</div>
		</VendorOnboardingFormsWrapper>
	);
}
