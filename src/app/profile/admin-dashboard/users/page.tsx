'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAdminActions } from '@/api-hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import {
	Search,
	UserPlus,
	Users,
	Store,
	Shield,
	Bike,
	Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AssignVendorModal from '@/components/admin-components/AssignVendorModal';
import Link from 'next/link';

export default function AdminUsersPage() {
	const { useInfiniteListUsers } = useAdminActions();
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearch, setDebouncedSearch] = useState('');
	const [selectedUser, setSelectedUser] = useState<any>(null);
	const [assignVendorOpen, setAssignVendorOpen] = useState(false);
	const [userToAssign, setUserToAssign] = useState<any>(null);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
		return () => clearTimeout(timer);
	}, [searchQuery]);

	const {
		data,
		isLoading,
		refetch,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteListUsers({
		limit: 30,
		q: debouncedSearch || undefined,
	});

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const users = data?.pages.flatMap((page) => page.items) || [];

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
			<SectionWrapper className='p-6'>
				<div className='flex flex-col gap-6'>
					<div className='h-10 w-full bg-muted animate-pulse rounded-md' />
					{[1, 2, 3, 4].map((i) => (
						<div
							key={i}
							className='h-24 w-full bg-muted animate-pulse rounded-xl'
						/>
					))}
				</div>
			</SectionWrapper>
		);
	}

	return (
		<SectionWrapper className='p-6'>
			<div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8'>
				<div>
					<h2 className='text-3xl font-bold tracking-tight'>Users</h2>
					<p className='text-muted-foreground'>
						Manage platform users and assign roles.
					</p>
				</div>
			</div>

			<div className='relative mb-8'>
				<Search
					className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'
					size={18}
				/>
				<Input
					placeholder='Search users by name, email, or phone...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='pl-10 h-12 bg-card border-border/50 text-lg'
				/>
			</div>

			{users.length === 0 ? (
				<div className='flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-2xl border-border/50'>
					<Users
						size={48}
						className='text-muted-foreground mb-4 opacity-20'
					/>
					<p className='text-xl text-muted-foreground font-medium'>
						{searchQuery
							? 'No users matching your search'
							: 'No users found'}
					</p>
				</div>
			) : (
				<div className='space-y-4'>
					{users.map((user) => (
						<div
							key={user.id}
							className='group relative border border-border/50 rounded-2xl p-5 flex flex-col md:flex-row gap-4 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg'>
							<div className='flex-1 space-y-3'>
								<div className='flex items-start justify-between gap-4'>
									<div className='flex-1'>
										<h3 className='font-bold text-lg mb-1 group-hover:text-primary transition-colors'>
											{user.name ||
												`${user.firstName || ''} ${user.lastName || ''}`.trim() ||
												'Unnamed User'}
										</h3>
										<p className='text-sm text-muted-foreground'>
											{user.email}
										</p>
										{user.phone && (
											<p className='text-sm text-muted-foreground'>
												{user.phone}
											</p>
										)}
									</div>
									<div className='flex flex-wrap gap-2'>
										{user.roles?.map((r: any) => (
											<div key={r.id}>
												{getRoleBadge(r.role)}
											</div>
										))}
										{(!user.roles ||
											user.roles.length === 0) &&
											getRoleBadge('CUSTOMER')}
									</div>
								</div>

								<div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-3 border-t border-border/50'>
									<div>
										<span className='text-muted-foreground'>
											Orders
										</span>
										<p className='font-bold text-primary'>
											{user._count?.orders || 0}
										</p>
									</div>
									<div>
										<span className='text-muted-foreground'>
											Reviews
										</span>
										<p className='font-medium'>
											{user._count?.reviews || 0}
										</p>
									</div>
									<div>
										<span className='text-muted-foreground'>
											Vendor
										</span>
										<p className='font-medium'>
											{user.vendors &&
											user.vendors.length > 0
												? user.vendors[0].name
												: 'None'}
										</p>
									</div>
									<div>
										<span className='text-muted-foreground'>
											Joined
										</span>
										<p className='font-medium text-xs'>
											{new Date(
												user.createdAt,
											).toLocaleDateString()}
										</p>
									</div>
								</div>
							</div>

							<div className='flex md:flex-col gap-2 md:justify-center'>
								<Link
									href={`/profile/admin-dashboard/users/${user.id}`}
									className='flex-1 md:flex-none'>
									<Button
										variant='outline'
										size='sm'
										className='w-full'>
										View Details
									</Button>
								</Link>
								{(!user.vendors ||
									user.vendors.length === 0) && (
									<Button
										variant='default'
										size='sm'
										className='flex-1 md:flex-none'
										onClick={() => {
											setUserToAssign(user);
											setAssignVendorOpen(true);
										}}>
										<UserPlus size={14} className='mr-1' />
										Make Vendor
									</Button>
								)}
							</div>
						</div>
					))}

					{hasNextPage && (
						<div ref={ref} className='py-10 flex justify-center'>
							{isFetchingNextPage ? (
								<div className='space-y-4 w-full'>
									<Skeleton className='h-24 w-full rounded-2xl' />
									<Skeleton className='h-24 w-full rounded-2xl' />
								</div>
							) : (
								<div className='h-1' />
							)}
						</div>
					)}
				</div>
			)}

			{/* Assign Vendor Modal */}
			{userToAssign && (
				<AssignVendorModal
					user={userToAssign}
					open={assignVendorOpen}
					onOpenChange={setAssignVendorOpen}
					onSuccess={() => {
						refetch();
						setUserToAssign(null);
					}}
				/>
			)}
		</SectionWrapper>
	);
}
