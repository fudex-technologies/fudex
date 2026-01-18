'use client';

import GoBackButton from '@/components/GoBackButton';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PAGES_DATA } from '@/data/pagesData';
import { useTRPC } from '@/trpc/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
	CheckCircle,
	ExternalLink,
	FileText,
	Globe,
	Mail,
	MapPin,
	Phone,
	XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function VendorRequestDetailsPage({
	params,
}: {
	params: { vendorId: string };
}) {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();
	const [declineReason, setDeclineReason] = useState('');
	const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);

	const { data: vendor, isLoading } = useQuery(
		trpc.vendors.getVendorApprovalDetails.queryOptions(
			{ vendorId: params.vendorId },
			{
				enabled: !!params.vendorId,
			}
		)
	);

	const approveMutation = useMutation(
		trpc.vendors.approveVendor.mutationOptions({
			onSuccess: () => {
				toast.success('Vendor approved successfully');
				queryClient.invalidateQueries({
					queryKey: [['vendors', 'getPendingVendors']],
				});
				router.push(PAGES_DATA.admin_dashboard_vendor_requests_page);
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to approve vendor');
			},
		})
	);

	const declineMutation = useMutation(
		trpc.vendors.declineVendor.mutationOptions({
			onSuccess: () => {
				toast.success('Vendor declined');
				setIsDeclineModalOpen(false);
				queryClient.invalidateQueries({
					queryKey: [['vendors', 'getPendingVendors']],
				});
				router.push(PAGES_DATA.admin_dashboard_vendor_requests_page);
			},
			onError: (error) => {
				toast.error(error.message || 'Failed to decline vendor');
			},
		})
	);

	const handleApprove = () => {
		if (confirm('Are you sure you want to approve this vendor?')) {
			approveMutation.mutate({ vendorId: params.vendorId });
		}
	};

	const handleDecline = () => {
		if (!declineReason.trim()) {
			toast.error('Please provide a reason for declining');
			return;
		}
		declineMutation.mutate({
			vendorId: params.vendorId,
			reason: declineReason,
		});
	};

	if (isLoading)
		return <div className='p-8 text-center'>Loading details...</div>;
	if (!vendor) return <div className='p-8 text-center'>Vendor not found</div>;

	return (
		<div className='p-5 max-w-4xl mx-auto pb-20'>
			<div className='flex items-center gap-4 mb-6'>
				<GoBackButton
					link={PAGES_DATA.admin_dashboard_vendor_requests_page}
				/>
				<div>
					<h1 className='text-2xl font-bold'>{vendor.name}</h1>
					<p className='text-muted-foreground text-sm'>
						Application ID: {vendor.id}
					</p>
				</div>
			</div>

			<div className='grid gap-6 md:grid-cols-3'>
				{/* Left Column - Details */}
				<div className='md:col-span-2 space-y-6'>
					{/* Status Card */}
					<div className='p-5 border rounded-lg bg-card shadow-sm'>
						<h3 className='font-semibold mb-4 border-b pb-2'>
							Application Status
						</h3>
						<div className='grid grid-cols-2 gap-4'>
							<div>
								<span className='text-sm text-muted-foreground'>
									Current Status
								</span>
								<div className='font-medium mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
									{vendor.approvalStatus}
								</div>
							</div>
							<div>
								<span className='text-sm text-muted-foreground'>
									Submitted On
								</span>
								<p className='font-medium mt-1'>
									{vendor.submittedAt
										? format(
												new Date(vendor.submittedAt),
												'PPP'
										  )
										: 'N/A'}
								</p>
							</div>
						</div>
					</div>

					{/* Operations Info */}
					<div className='p-5 border rounded-lg bg-card shadow-sm'>
						<h3 className='font-semibold mb-4 border-b pb-2'>
							Business Details
						</h3>
						<div className='space-y-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='flex items-start gap-3'>
									<MapPin className='h-5 w-5 text-muted-foreground mt-0.5' />
									<div>
										<span className='text-sm text-muted-foreground'>
											Address
										</span>
										<p className='font-medium'>
											{vendor.addresses && vendor.addresses.length > 0
												? `${vendor.addresses[0].line1}, ${vendor.addresses[0].city}`
												: 'Not provided'}
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<Globe className='h-5 w-5 text-muted-foreground mt-0.5' />
									<div>
										<span className='text-sm text-muted-foreground'>
											Slug/URL
										</span>
										<p className='font-medium overflow-hidden text-ellipsis'>
											{vendor.slug}
										</p>
									</div>
								</div>
							</div>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div className='flex items-start gap-3'>
									<Phone className='h-5 w-5 text-muted-foreground mt-0.5' />
									<div>
										<span className='text-sm text-muted-foreground'>
											Phone
										</span>
										<p className='font-medium'>
											{vendor.phone || 'N/A'}
										</p>
									</div>
								</div>
								<div className='flex items-start gap-3'>
									<Mail className='h-5 w-5 text-muted-foreground mt-0.5' />
									<div>
										<span className='text-sm text-muted-foreground'>
											Email
										</span>
										<p className='font-medium'>
											{vendor.email || 'N/A'}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Description */}
					<div className='p-5 border rounded-lg bg-card shadow-sm'>
						<h3 className='font-semibold mb-4 border-b pb-2'>
							Description
						</h3>
						<p className='text-muted-foreground whitespace-pre-line'>
							{vendor.description || 'No description provided.'}
						</p>
					</div>

					{/* Documents */}
					<div className='p-5 border rounded-lg bg-card shadow-sm'>
						<h3 className='font-semibold mb-4 border-b pb-2'>
							Verification Documents
						</h3>
						{(vendor.documents && vendor.documents.length > 0) ||
						(vendor.verificationDocuments &&
							vendor.verificationDocuments.length > 0) ? (
							<div className='space-y-3'>
								{vendor.documents && vendor.documents.length > 0
									? vendor.documents.map(
											(doc: any, index: number) => (
												<div
													key={doc.id || index}
													className='flex items-center justify-between p-3 border rounded bg-secondary/20'>
													<div className='flex items-center gap-3'>
														<FileText className='h-8 w-8 text-primary' />
														<div>
															<p className='font-medium text-sm capitalize'>
																{doc.type
																	? doc.type.replace(
																			/_/g,
																			' '
																	  )
																	: `Document ${
																			index +
																			1
																	  }`}
															</p>
															<p className='text-xs text-muted-foreground'>
																{format(
																	new Date(
																		doc.createdAt
																	),
																	'PP p'
																)}
															</p>
														</div>
													</div>
													<Button
														size='sm'
														variant='outline'
														asChild>
														<Link
															href={doc.url}
															target='_blank'
															rel='noopener noreferrer'>
															View{' '}
															<ExternalLink className='ml-2 h-3 w-3' />
														</Link>
													</Button>
												</div>
											)
									  )
									: vendor.verificationDocuments?.map(
											(doc: string, index: number) => (
												<div
													key={index}
													className='flex items-center justify-between p-3 border rounded bg-secondary/20'>
													<div className='flex items-center gap-3'>
														<FileText className='h-8 w-8 text-primary' />
														<div>
															<p className='font-medium text-sm'>
																Document{' '}
																{index + 1}
															</p>
															<p className='text-xs text-muted-foreground'>
																Legacy Upload
															</p>
														</div>
													</div>
													<Button
														size='sm'
														variant='outline'
														asChild>
														<Link
															href={doc}
															target='_blank'
															rel='noopener noreferrer'>
															View{' '}
															<ExternalLink className='ml-2 h-3 w-3' />
														</Link>
													</Button>
												</div>
											)
									  )}
							</div>
						) : (
							<div className='text-center py-8 text-muted-foreground bg-secondary/10 rounded-lg'>
								No documents uploaded
							</div>
						)}
					</div>
				</div>

				{/* Right Column - Actions */}
				<div className='space-y-6'>
					<div className='p-5 border rounded-lg bg-card shadow-sm sticky top-24'>
						<h3 className='font-semibold mb-4'>Actions</h3>
						<div className='space-y-3'>
							<Button
								className='w-full bg-green-600 hover:bg-green-700'
								onClick={handleApprove}
								disabled={
									approveMutation.isPending ||
									declineMutation.isPending
								}>
								<CheckCircle className='mr-2 h-4 w-4' />
								{approveMutation.isPending
									? 'Approving...'
									: 'Approve Vendor'}
							</Button>

							<Dialog
								open={isDeclineModalOpen}
								onOpenChange={setIsDeclineModalOpen}>
								<DialogTrigger asChild>
									<Button
										variant='destructive'
										className='w-full'
										disabled={
											approveMutation.isPending ||
											declineMutation.isPending
										}>
										<XCircle className='mr-2 h-4 w-4' />
										Decline Application
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>
											Decline Application
										</DialogTitle>
										<DialogDescription>
											Please provide a reason for
											declining this application. This
											will be sent to the vendor.
										</DialogDescription>
									</DialogHeader>
									<div className='space-y-2 py-4'>
										<Label>Reason for Rejection</Label>
										<Textarea
											placeholder='e.g. Invalid documents, incomplete profile...'
											value={declineReason}
											onChange={(e) =>
												setDeclineReason(e.target.value)
											}
											rows={4}
										/>
									</div>
									<DialogFooter>
										<Button
											variant='outline'
											onClick={() =>
												setIsDeclineModalOpen(false)
											}>
											Cancel
										</Button>
										<Button
											variant='destructive'
											onClick={handleDecline}
											disabled={
												declineMutation.isPending
											}>
											{declineMutation.isPending
												? 'Declining...'
												: 'Decline Vendor'}
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
