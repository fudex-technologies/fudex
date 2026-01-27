'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	trend?: number;
	description?: string;
	className?: string;
}

export function StatCard({
	title,
	value,
	icon: Icon,
	trend,
	description,
	className,
}: StatCardProps) {
	return (
		<Card className={cn('', className)}>
			<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
				<CardTitle className='text-sm font-medium'>{title}</CardTitle>
				<Icon className='h-4 w-4 text-muted-foreground' />
			</CardHeader>
			<CardContent>
				<div className='text-2xl font-bold'>{value}</div>
				{(trend !== undefined || description) && (
					<p className='text-xs text-muted-foreground mt-1'>
						{trend !== undefined && (
							<span
								className={cn(
									'font-medium mr-1',
									trend > 0
										? 'text-success'
										: trend < 0
											? 'text-destructive'
											: '',
								)}>
								{trend > 0 ? '+' : ''}
								{trend.toFixed(1)}%
							</span>
						)}
						{description}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
