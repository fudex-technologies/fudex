'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award } from 'lucide-react';
import { useProfileActions } from '@/api-hooks/useProfileActions';

export const ReferralLeaderboard = () => {
	const { getMonthlyLeaderboard } = useProfileActions();
	const { data: leaderboard, isLoading } = getMonthlyLeaderboard();

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Trophy className='w-5 h-5 text-yellow-500' />
						Monthly Leaderboard
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					{[1, 2, 3].map((i) => (
						<div key={i} className='flex items-center gap-4'>
							<Skeleton className='w-8 h-8 rounded-full' />
							<div className='space-y-2'>
								<Skeleton className='h-4 w-[150px]' />
								<Skeleton className='h-3 w-[100px]' />
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		);
	}

	if (!leaderboard || leaderboard.length === 0) return null;

	const getRankIcon = (index: number) => {
		switch (index) {
			case 0:
				return <Trophy className='w-5 h-5 text-yellow-500' />;
			case 1:
				return <Medal className='w-5 h-5 text-slate-400' />;
			case 2:
				return <Award className='w-5 h-5 text-amber-600' />;
			default:
				return (
					<span className='w-5 text-center font-bold text-muted-foreground'>
						{index + 1}
					</span>
				);
		}
	};

	return (
		<Card className='border-none shadow-none bg-muted/30'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2 text-xl'>
					<Trophy className='w-6 h-6 text-yellow-500 animate-pulse' />
					Monthly Top Referrers
				</CardTitle>
				<p className='text-sm text-muted-foreground'>
					Top performers for{' '}
					{new Date().toLocaleString('default', {
						month: 'long',
						year: 'numeric',
					})}
				</p>
			</CardHeader>
			<CardContent className='space-y-4'>
				{leaderboard.map((user, index) => (
					<div
						key={user.userId}
						className='flex items-center justify-between p-3 rounded-lg bg-background border shadow-sm transition-all hover:scale-[1.01]'>
						<div className='flex items-center gap-4'>
							<div className='flex items-center justify-center w-8'>
								{getRankIcon(index)}
							</div>
							<Avatar className='w-10 h-10 border-2 border-primary/10'>
								<AvatarImage src={user.image || ''} />
								<AvatarFallback>
									{user.name.charAt(0)}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className='font-semibold text-sm'>
									{user.name}
								</p>
								<p className='text-xs text-muted-foreground'>
									Referee's Orders
								</p>
							</div>
						</div>
						<div className='text-right'>
							<span className='text-lg font-bold text-primary'>
								{user.count}
							</span>
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
};
