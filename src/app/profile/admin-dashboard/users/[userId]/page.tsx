'use client';

import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageWrapper from '@/components/wrapers/PageWrapper';
import GoBackButton from '@/components/GoBackButton';
import {
	User,
	Mail,
	Phone,
	Calendar,
	ShoppingBag,
	Star,
	MapPin,
	Store,
	Shield,
	Bike,
	Crown,
	Users,
	Edit,
	Ban,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurency } from '@/lib/commonFunctions';
import Link from 'next/link';

export default async function UserDetailsPage({
	params,
}: {
	params: Promise<{ userId: string }>;
}) {
	const { userId } = await params;

	return <UserDetailsPageClient userId={userId} />;
}

function UserDetailsPageClient({ userId }: { userId: string }) {
	const { useGetUserDetails } = useAdminActions();
	const { data: user, isLoading } = useGetUserDetails({
		userId,
	});

	const getRoleBadge = (role: string) => {
		const roleConfig: Record<string, { icon: any; className: string }> = {
			VENDOR: {
				icon: Store,
				className:
					'bg-purple-500/10 text-purple-600 border-purple-500/20',
			},
			OPERATOR: {
				icon: Shield,
				className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
			},
			RIDER: {
				icon: Bike,
				className: 'bg-green-500/10 text-green-600 border-green-500/20',
			},
			SUPER_ADMIN: {
				icon: Crown,
				className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
			},
			CUSTOMER: {
				icon: Users,
				className: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
			},
		};

		const config = roleConfig[role] || roleConfig.CUSTOMER;
		const Icon = config.icon;

		return (
			<Badge
				variant='outline'
				className={cn('text-xs capitalize', config.className)}>
				<Icon size={12} className='mr-1' />
				{role.toLowerCase()}
			</Badge>
		);
	};

	if (isLoading) {
		return (
			<PageWrapper className='p-6'>
				<div className='max-w-5xl mx-auto space-y-6'>
					<Skeleton className='h-12 w-64' />
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						<Skeleton className='h-48 col-span-2' />
						<Skeleton className='h-48' />
					</div>
				</div>
			</PageWrapper>
		);
	}

	if (!user) {
		return (
			<PageWrapper className='p-6'>
				<div className='max-w-5xl mx-auto'>
					<GoBackButton />
					<p className='text-center text-muted-foreground mt-8'>
						User not found
					</p>
				</div>
			</PageWrapper>
		);
	}

	return (
		<PageWrapper className='p-6'>
			<div className='max-w-5xl mx-auto space-y-6'>
				{/* Header */}
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4'>
						<GoBackButton />
						<div>
							<h1 className='text-3xl font-bold'>
								{user.name ||
									`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
									'Unnamed User'}
							</h1>
							<p className='text-muted-foreground'>
								{user.email}
							</p>
						</div>
					</div>
					<div className='flex gap-2'>
						<Button variant='outline' size='sm'>
							<Edit size={14} className='mr-1' />
							Edit User
						</Button>
						<Button variant='destructive' size='sm'>
							<Ban size={14} className='mr-1' />
							Deactivate
						</Button>
					</div>
				</div>

				{/* Main Content Grid */}
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					{/* Left Column - User Info */}
					<div className='md:col-span-2 space-y-6'>
						{/* Basic Information */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<User size={20} />
									Basic Information
								</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div className='grid grid-cols-2 gap-4'>
									<div>
										<p className='text-sm text-muted-foreground'>
											First Name
										</p>
										<p className='font-medium'>
											{user.firstName || 'Not set'}
										</p>
									</div>
									<div>
										<p className='text-sm text-muted-foreground'>
											Last Name
										</p>
										<p className='font-medium'>
											{user.lastName || 'Not set'}
										</p>
									</div>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									<div className='flex items-center gap-2'>
										<Mail
											size={16}
											className='text-muted-foreground'
										/>
										<div>
											<p className='text-sm text-muted-foreground'>
												Email
											</p>
											<p className='font-medium text-sm'>
												{user.email}
											</p>
											{user.emailVerified && (
												<Badge
													variant='outline'
													className='text-xs mt-1 bg-green-500/10 text-green-600 border-green-500/20'>
													Verified
												</Badge>
											)}
										</div>
									</div>
									<div className='flex items-center gap-2'>
										<Phone
											size={16}
											className='text-muted-foreground'
										/>
										<div>
											<p className='text-sm text-muted-foreground'>
												Phone
											</p>
											<p className='font-medium text-sm'>
												{user.phone || 'Not set'}
											</p>
											{user.phoneVerified && (
												<Badge
													variant='outline'
													className='text-xs mt-1 bg-green-500/10 text-green-600 border-green-500/20'>
													Verified
												</Badge>
											)}
										</div>
									</div>
								</div>
								<div className='flex items-center gap-2'>
									<Calendar
										size={16}
										className='text-muted-foreground'
									/>
									<div>
										<p className='text-sm text-muted-foreground'>
											Member Since
										</p>
										<p className='font-medium'>
											{new Date(
												user.createdAt,
											).toLocaleDateString('en-US', {
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											})}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Vendor Information */}
						{user.vendors && user.vendors.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Store size={20} />
										Vendor Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									{user.vendors.map((vendor: any) => (
										<div
											key={vendor.id}
											className='space-y-2'>
											<div className='flex items-center justify-between'>
												<div>
													<p className='font-bold text-lg'>
														{vendor.name}
													</p>
													<p className='text-sm text-muted-foreground'>
														{vendor.description ||
															'No description'}
													</p>
												</div>
												<Link
													href={`/profile/admin-dashboard/vendors/${vendor.id}/menu`}>
													<Button
														variant='outline'
														size='sm'>
														Manage Vendor
													</Button>
												</Link>
											</div>
											<div className='grid grid-cols-2 gap-4 pt-2'>
												<div>
													<p className='text-sm text-muted-foreground'>
														Products
													</p>
													<p className='font-medium'>
														{vendor._count
															?.products || 0}
													</p>
												</div>
												<div>
													<p className='text-sm text-muted-foreground'>
														Orders
													</p>
													<p className='font-medium'>
														{vendor._count
															?.orders || 0}
													</p>
												</div>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						{/* Recent Orders */}
						{user.orders && user.orders.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<ShoppingBag size={20} />
										Recent Orders
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										{user.orders.map((order: any) => (
											<div
												key={order.id}
												className='flex items-center justify-between p-3 border rounded-lg'>
												<div>
													<p className='font-medium'>
														{formatCurency(
															order.totalAmount,
														)}
													</p>
													<p className='text-xs text-muted-foreground'>
														{new Date(
															order.createdAt,
														).toLocaleDateString()}
													</p>
												</div>
												<Badge
													variant={
														order.status ===
														'DELIVERED'
															? 'default'
															: 'secondary'
													}>
													{order.status}
												</Badge>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Recent Reviews */}
						{user.reviews && user.reviews.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Star size={20} />
										Recent Reviews
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='space-y-3'>
										{user.reviews.map((review: any) => (
											<div
												key={review.id}
												className='p-3 border rounded-lg'>
												<div className='flex items-center gap-2 mb-2'>
													<div className='flex'>
														{[...Array(5)].map(
															(_, i) => (
																<Star
																	key={i}
																	size={14}
																	className={
																		i <
																		review.rating
																			? 'fill-amber-400 text-amber-400'
																			: 'text-gray-300'
																	}
																/>
															),
														)}
													</div>
													<span className='text-xs text-muted-foreground'>
														{new Date(
															review.createdAt,
														).toLocaleDateString()}
													</span>
												</div>
												{review.comment && (
													<p className='text-sm'>
														{review.comment}
													</p>
												)}
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Right Column - Stats & Roles */}
					<div className='space-y-6'>
						{/* Roles */}
						<Card>
							<CardHeader>
								<CardTitle>Roles</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='flex flex-wrap gap-2'>
									{user.roles && user.roles.length > 0
										? user.roles.map((r: any) => (
												<div key={r.id}>
													{getRoleBadge(r.role)}
												</div>
											))
										: getRoleBadge('CUSTOMER')}
								</div>
							</CardContent>
						</Card>

						{/* Statistics */}
						<Card>
							<CardHeader>
								<CardTitle>Statistics</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<p className='text-sm text-muted-foreground'>
										Total Orders
									</p>
									<p className='text-2xl font-bold text-primary'>
										{user._count?.orders || 0}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										Reviews Written
									</p>
									<p className='text-2xl font-bold'>
										{user._count?.reviews || 0}
									</p>
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										Saved Addresses
									</p>
									<p className='text-2xl font-bold'>
										{user._count?.addresses || 0}
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Account Status */}
						<Card>
							<CardHeader>
								<CardTitle>Account Status</CardTitle>
							</CardHeader>
							<CardContent className='space-y-3'>
								<div className='flex items-center justify-between'>
									<span className='text-sm'>
										Email Verified
									</span>
									<Badge
										variant={
											user.emailVerified
												? 'default'
												: 'secondary'
										}>
										{user.emailVerified ? 'Yes' : 'No'}
									</Badge>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm'>
										Phone Verified
									</span>
									<Badge
										variant={
											user.phoneVerified
												? 'default'
												: 'secondary'
										}>
										{user.phoneVerified ? 'Yes' : 'No'}
									</Badge>
								</div>
								{user.referralCode && (
									<div>
										<p className='text-sm text-muted-foreground'>
											Referral Code
										</p>
										<p className='font-mono text-sm font-bold'>
											{user.referralCode}
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</PageWrapper>
	);
}
