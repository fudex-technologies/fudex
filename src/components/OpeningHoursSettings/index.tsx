'use client';

import { useState, useEffect } from 'react';
import { useVendorProductActions } from '@/api-hooks/useVendorActions';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DayOfWeek } from '@prisma/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const DAYS: DayOfWeek[] = [
	'MONDAY',
	'TUESDAY',
	'WEDNESDAY',
	'THURSDAY',
	'FRIDAY',
	'SATURDAY',
	'SUNDAY',
];

interface DaySchedule {
	day: DayOfWeek;
	isClosed: boolean;
	openTime: string;
	closeTime: string;
}

export default function OpeningHoursSettings({
	vendorId,
	onClose,
}: {
	vendorId: string;
	onClose?: () => void;
}) {
	const { useGetMyOpeningHours, useSetMyOpeningHours } =
		useVendorProductActions();
	const { data: openingHours, isLoading } = useGetMyOpeningHours();
	const { mutate: setOpeningHours, isPending: isSaving } =
		useSetMyOpeningHours();

	const [schedule, setSchedule] = useState<DaySchedule[]>([]);

	useEffect(() => {
		if (openingHours) {
			const newSchedule = DAYS.map((day) => {
				const existing = openingHours.find((h) => h.day === day);
				return {
					day,
					isClosed: existing?.isClosed ?? false,
					openTime: existing?.openTime ?? '09:00',
					closeTime: existing?.closeTime ?? '20:00',
				};
			});
			setSchedule(newSchedule);
		} else {
			// Default init
			setSchedule(
				DAYS.map((day) => ({
					day,
					isClosed: false,
					openTime: '09:00',
					closeTime: '20:00',
				}))
			);
		}
	}, [openingHours]);

	const handleSave = () => {
		setOpeningHours(
			schedule.map(({ day, isClosed, openTime, closeTime }) => ({
				day,
				isClosed,
				openTime: isClosed ? undefined : openTime,
				closeTime: isClosed ? undefined : closeTime,
			})),
			{
				onSuccess: () => {
					toast.success('Opening hours updated successfully');
					onClose?.();
				},
				onError: (err) => {
					toast.error(err.message || 'Failed to update hours');
				},
			}
		);
	};

	const updateDay = (index: number, updates: Partial<DaySchedule>) => {
		const newSchedule = [...schedule];
		newSchedule[index] = { ...newSchedule[index], ...updates };
		setSchedule(newSchedule);
	};

	const copyToAll = (index: number) => {
		const source = schedule[index];
		const newSchedule = schedule.map((item) => ({
			...item,
			isClosed: source.isClosed,
			openTime: source.openTime,
			closeTime: source.closeTime,
		}));
		setSchedule(newSchedule);
		toast.info(`Copied ${source.day} schedule to all days`);
	};

	if (isLoading)
		return (
			<div className='p-4 flex justify-center'>
				<Loader2 className='animate-spin' />
			</div>
		);

	return (
		<div className='space-y-6'>
			<div className='space-y-4'>
				{schedule.map((item, index) => (
					<div
						key={item.day}
						className='flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-4 last:border-0'>
						<div className='w-28 font-medium capitalize shrink-0'>
							{item.day.toLowerCase()}
						</div>

						<div className='flex items-center gap-2'>
							<Switch
								id={`closed-${item.day}`}
								checked={!item.isClosed}
								onCheckedChange={(checked) =>
									updateDay(index, { isClosed: !checked })
								}
							/>
							<Label
								htmlFor={`closed-${item.day}`}
								className='w-16'>
								{item.isClosed ? 'Closed' : 'Open'}
							</Label>
						</div>

						{!item.isClosed && (
							<div className='flex items-center gap-2'>
								<Input
									type='time'
									value={item.openTime}
									onChange={(e) =>
										updateDay(index, {
											openTime: e.target.value,
										})
									}
									className='w-32'
								/>
								<span>to</span>
								<Input
									type='time'
									value={item.closeTime}
									onChange={(e) =>
										updateDay(index, {
											closeTime: e.target.value,
										})
									}
									className='w-32'
								/>
							</div>
						)}
						<Button
							variant='ghost'
							size='sm'
							onClick={() => copyToAll(index)}
							title='Copy this schedule to all other days'>
							Copy All
						</Button>
					</div>
				))}
			</div>

			<div className='flex justify-end gap-2 pt-4'>
				{onClose && (
					<Button
						variant='outline'
						onClick={onClose}
						disabled={isSaving}>
						Cancel
					</Button>
				)}
				<Button onClick={handleSave} disabled={isSaving}>
					{isSaving && (
						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
					)}
					Save Schedule
				</Button>
			</div>
		</div>
	);
}
