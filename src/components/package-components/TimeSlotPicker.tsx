'use client';

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TimeSlot {
	value: string;
	label: string;
	start: string;
	end: string;
}

// Generate 2-hour time slots from 8am to 10pm
const generateTimeSlots = (): TimeSlot[] => {
	const slots: TimeSlot[] = [];
	const startHour = 8;
	const endHour = 22; // 10pm

	for (let hour = startHour; hour < endHour; hour += 2) {
		const start = `${hour.toString().padStart(2, '0')}:00`;
		const end = `${(hour + 2).toString().padStart(2, '0')}:00`;
		const value = `${start}-${end}`;
		const label = formatTimeSlot(hour, hour + 2);

		slots.push({ value, label, start, end });
	}

	return slots;
};

const formatTimeSlot = (startHour: number, endHour: number): string => {
	const formatHour = (h: number) => {
		if (h === 0) return '12:00 AM';
		if (h < 12) return `${h}:00 AM`;
		if (h === 12) return '12:00 PM';
		return `${h - 12}:00 PM`;
	};

	return `${formatHour(startHour)} - ${formatHour(endHour)}`;
};

interface TimeSlotPickerProps {
	value?: string;
	onChange: (value: string) => void;
	disabled?: boolean;
	className?: string;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
	value,
	onChange,
	disabled = false,
	className,
}) => {
	const timeSlots = generateTimeSlots();

	return (
		<div className={cn('w-full', className)}>
			<RadioGroup value={value} onValueChange={onChange} disabled={disabled}>
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
					{timeSlots.map((slot) => (
						<div
							key={slot.value}
							className={cn(
								'flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors',
								value === slot.value
									? 'border-primary bg-primary/5'
									: 'border-border hover:border-primary/50',
								disabled && 'opacity-50 cursor-not-allowed'
							)}>
							<RadioGroupItem
								value={slot.value}
								id={slot.value}
								className='mt-0'
							/>
							<Label
								htmlFor={slot.value}
								className='flex-1 cursor-pointer font-medium'>
								{slot.label}
							</Label>
						</div>
					))}
				</div>
			</RadioGroup>
		</div>
	);
};

export default TimeSlotPicker;

