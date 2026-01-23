'use client';

import { useRiderRequestActions } from '@/api-hooks/useRiderRequestActions';
import GoBackButton from '@/components/GoBackButton';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import { formatCurency, formatDate } from '@/lib/commonFunctions';
import {
	Loader2,
	User,
	MapPin,
	Phone,
	Bike,
	Calendar,
	ShieldCheck,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const VendorRiderRequestDetailsSection = () => {
	const params = useParams();
	const requestId = params.requestId as string;
	const { useGetRiderRequestDetails } = useRiderRequestActions();
	const { data: request, isLoading } = useGetRiderRequestDetails(requestId);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center p-20'>
				<Loader2 className='w-8 h-8 animate-spin text-primary' />
			</div>
		);
	}

	if (!request) {
		return (
			<div className='flex flex-col items-center justify-center p-20 gap-4'>
				<p className='text-muted-foreground'>Request not found</p>
				<GoBackButton />
			</div>
		);
	}

	const statusColors: Record<string, string> = {
		PENDING: 'bg-amber-100 text-amber-700',
		ASSIGNED: 'bg-blue-100 text-blue-700',
		DELIVERED: 'bg-green-100 text-green-700',
		CANCELLED: 'bg-destructive/10 text-destructive',
	};

	return (
		<SectionWrapper className='max-w-2xl mx-auto p-5 space-y-6 pb-20'>
			<div className='bg-card border rounded-3xl p-6 shadow-sm space-y-6'>
				{/* Header Info */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
					<div>
						<h1 className='text-2xl font-bold tracking-tight'>
							Request Details
						</h1>
						<p className='text-muted-foreground text-sm flex items-center gap-1.5 mt-1'>
							<Calendar className='w-3.5 h-3.5' />
							Requested on{' '}
							{formatDate(request.createdAt.toString())}
						</p>
					</div>
					<Badge
						className={`py-1.5 px-3 rounded-xl font-bold uppercase tracking-wider border-none ${
							statusColors[request.status] ||
							'bg-muted text-muted-foreground'
						}`}
						variant='secondary'>
						{request.status.replace('_', ' ')}
					</Badge>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
					<div className='p-4 bg-muted/40 rounded-2xl border'>
						<p className='text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1'>
							Total Delivery Fee
						</p>
						<p className='text-2xl font-black text-primary'>
							{formatCurency(request.totalFee)}
						</p>
					</div>
					<div className='p-4 bg-muted/40 rounded-2xl border'>
						<p className='text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1'>
							Settlement Status
						</p>
						<p className='text-lg font-bold flex items-center gap-2'>
							{request.settlementStatus === 'SETTLED' ? (
								<ShieldCheck className='w-5 h-5 text-green-600' />
							) : request.settlementStatus ===
							  'PENDING_VERIFICATION' ? (
								<Loader2 className='w-5 h-5 text-blue-600 animate-spin' />
							) : (
								<div className='w-3 h-3 rounded-full bg-amber-500 animate-pulse' />
							)}
							{request.settlementStatus.replace('_', ' ')}
						</p>
					</div>
				</div>

				<Separator />

				{/* Assigned Rider */}
				<div className='space-y-4'>
					<h3 className='text-lg font-bold flex items-center gap-2'>
						<Bike className='w-5 h-5 text-primary' />
						Assigned Rider
					</h3>
					{request.assignedRider ? (
						<div className='flex items-center gap-4 p-4  bg-primary/5 border border-primary/10 rounded-2xl'>
							<div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
								<User className='w-6 h-6' />
							</div>
							<div>
								<p className='font-bold text-lg'>
									{request.assignedRider.name}
								</p>
								<p className='text-sm text-muted-foreground flex items-center gap-1'>
									<Phone className='w-3.5 h-3.5' />
									{request.assignedRider.phone || 'N/A'}
								</p>
							</div>
						</div>
					) : (
						<p className='text-muted-foreground p-4 bg-muted/30 rounded-2xl border border-dashed text-center italic'>
							No rider assigned yet. Our team is working on it.
						</p>
					)}
				</div>

				<Separator />

				{/* Customer Deliveries */}
				<div className='space-y-4'>
					<h3 className='text-lg font-bold flex items-center gap-2'>
						<MapPin className='w-5 h-5 text-primary' />
						Customer Deliveries ({request.items.length})
					</h3>
					<div className='space-y-4'>
						{request.items.map((item, index) => (
							<div
								key={item.id}
								className='p-5 border rounded-2xl bg-muted/20 space-y-3'>
								<div className='flex justify-between items-center'>
									<p className='font-bold text-md text-primary/80'>
										Customer {index + 1}
									</p>
									<p className='font-bold text-lg'>
										{formatCurency(item.deliveryFee)}
									</p>
								</div>
								<div className='grid gap-2'>
									<p className='text-sm font-semibold flex items-center gap-2'>
										<User className='w-4 h-4 text-muted-foreground' />
										{item.customerName}
									</p>
									<p className='text-sm font-medium flex items-center gap-2'>
										<Phone className='w-4 h-4 text-muted-foreground' />
										{item.customerPhone}
									</p>
									<div className='flex items-start gap-2'>
										<MapPin className='w-11 h-11 text-muted-foreground mt-0.5' />
										<p className='text-sm'>
											<span className='font-bold block'>
												{item.area?.name || 'Area'}
											</span>
											<span className='text-muted-foreground'>
												{item.customerAddress}
											</span>
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</SectionWrapper>
	);
};

export default VendorRiderRequestDetailsSection;
