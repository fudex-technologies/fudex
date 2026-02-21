'use client';

import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import SectionWrapper from '@/components/wrapers/SectionWrapper';
import {
	Coins,
	ShoppingBag,
	Wallet,
	Trophy,
	Gift,
	ShieldCheck,
	AlertTriangle,
} from 'lucide-react';

const Section = ({
	icon: Icon,
	iconColor,
	iconBg,
	title,
	children,
}: {
	icon: React.ElementType;
	iconColor: string;
	iconBg: string;
	title: string;
	children: React.ReactNode;
}) => (
	<div className='rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden'>
		<div className={`flex items-center gap-3 px-5 py-4 ${iconBg} border-b`}>
			<div className={`p-2 rounded-xl ${iconBg} border`}>
				<Icon className={`w-5 h-5 ${iconColor}`} />
			</div>
			<h2 className='font-bold text-base'>{title}</h2>
		</div>
		<ul className='divide-y'>{children}</ul>
	</div>
);

const Rule = ({ children }: { children: React.ReactNode }) => (
	<li className='flex items-start gap-3 px-5 py-3.5 text-sm text-foreground/80'>
		<span className='mt-0.5 text-primary font-bold shrink-0'>•</span>
		<span>{children}</span>
	</li>
);

const Divider = () => (
	<div className='flex items-center gap-3 my-1'>
		<div className='flex-1 h-px bg-border/50' />
		<div className='w-1.5 h-1.5 rounded-full bg-primary/30' />
		<div className='flex-1 h-px bg-border/50' />
	</div>
);

export default function ReferralRulesPage() {
	return (
		<PageWrapper className='flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full px-5 py-4 border-b bg-background sticky top-0 z-50'>
				<GoBackButton />
				<h1 className='font-semibold text-xl'>Referral Rules</h1>
			</div>

			<SectionWrapper className='flex flex-col items-center max-w-lg px-5! pb-24 space-y-5'>
				{/* Hero */}
				<div className='w-full rounded-2xl bg-linear-to-br from-primary/15 via-primary/5 to-secondary/10 border border-primary/20 p-6 text-center space-y-2'>
					<div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-2'>
						<Gift className='w-7 h-7 text-primary' />
					</div>
					<h2 className='text-xl font-black tracking-tight'>
						FUDEX Referral Program
					</h2>
					<p className='text-sm text-muted-foreground text-balance'>
						Invite friends, earn rewards. Here's everything you need
						to know.
					</p>
				</div>

				{/* Section 1 */}
				<Section
					icon={Coins}
					iconColor='text-yellow-600'
					iconBg='bg-yellow-500/10'
					title='1. How You Earn'>
					<Rule>
						Earn <strong>₦100</strong> every time your referred
						friend completes an order.
					</Rule>
					<Rule>
						You earn on the{' '}
						<strong>first 5 completed orders</strong> of each
						referred friend.
					</Rule>
					<Rule>
						Maximum earning per friend = <strong>₦500</strong>.
					</Rule>
					<Rule>
						There is <strong>no limit</strong> to how many friends
						you can refer.
					</Rule>
					<Rule>
						Earnings are credited <strong>immediately</strong> after
						each completed order.
					</Rule>
				</Section>

				<Divider />

				{/* Section 2 */}
				<Section
					icon={ShoppingBag}
					iconColor='text-blue-600'
					iconBg='bg-blue-500/10'
					title='2. What Qualifies as a Valid Order'>
					<Rule>
						The order must be successfully paid and completed.
					</Rule>
					<Rule>
						Minimum order value must meet the platform requirement.
					</Rule>
					<Rule>
						<strong>Cancelled or refunded</strong> orders do not
						count.
					</Rule>
					<Rule>
						<strong>Self-referrals</strong> are strictly prohibited.
					</Rule>
				</Section>

				<Divider />

				{/* Section 3 */}
				<Section
					icon={Wallet}
					iconColor='text-green-600'
					iconBg='bg-green-500/10'
					title='3. Wallet Credit Rules'>
					<Rule>
						Referral rewards are credited{' '}
						<strong>automatically</strong> to your Fudex wallet.
					</Rule>
					<Rule>Wallet bonuses are non-transferable.</Rule>
					<Rule>
						Fudex reserves the right to reverse rewards in cases of
						fraud or abuse.
					</Rule>
				</Section>

				{/* Leaderboard Banner */}
				<div className='w-full rounded-2xl bg-linear-to-br from-yellow-500/10 to-amber-500/5 border border-yellow-500/20 p-5 flex items-center gap-4'>
					<div className='p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 shrink-0'>
						<Trophy className='w-6 h-6 text-yellow-600' />
					</div>
					<div>
						<p className='font-black text-sm uppercase tracking-wider text-yellow-700 dark:text-yellow-400'>
							Monthly Leaderboard Campaign
						</p>
						<p className='text-xs text-muted-foreground mt-0.5'>
							Compete with top referrers every month for bonus
							rewards.
						</p>
					</div>
				</div>

				{/* Section 4 */}
				<Section
					icon={Trophy}
					iconColor='text-yellow-600'
					iconBg='bg-yellow-500/10'
					title='4. How Leaderboard Ranking Works'>
					<Rule>
						Rankings are based on{' '}
						<strong>total completed orders</strong> made by your
						referred friends within the month.
					</Rule>
					<Rule>
						All completed orders count toward leaderboard ranking —
						even beyond the first 5.
					</Rule>
					<Rule>
						Leaderboard resets on the{' '}
						<strong>1st day of every month</strong>.
					</Rule>
					<Rule>
						The user with the highest total referee orders ranks{' '}
						<strong>#1</strong>.
					</Rule>
				</Section>

				<Divider />

				{/* Section 5 */}
				<Section
					icon={Gift}
					iconColor='text-purple-600'
					iconBg='bg-purple-500/10'
					title='5. Leaderboard Rewards'>
					<Rule>
						Top performers receive{' '}
						<strong>monthly wallet bonuses</strong>.
					</Rule>
					<Rule>Winners are announced at the end of each month.</Rule>
					<Rule>
						Rewards are credited within a specified period after
						verification.
					</Rule>
				</Section>

				<Divider />

				{/* Section 6 */}
				<Section
					icon={ShieldCheck}
					iconColor='text-red-600'
					iconBg='bg-red-500/10'
					title='6. Fair Use Policy'>
					<Rule>
						Disqualify users engaging in{' '}
						<strong>fake accounts</strong> or artificial orders.
					</Rule>
					<Rule>
						Withhold or reverse rewards linked to suspicious
						activity.
					</Rule>
					<Rule>Modify or suspend the campaign at any time.</Rule>
				</Section>

				{/* Note */}
				<div className='w-full rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-3'>
					<AlertTriangle className='w-5 h-5 text-amber-600 shrink-0 mt-0.5' />
					<p className='text-sm text-amber-800 dark:text-amber-300 leading-relaxed'>
						<strong>Note:</strong> Fudex reserves the right to audit
						referral activity to ensure fairness for all users.
					</p>
				</div>
			</SectionWrapper>
		</PageWrapper>
	);
}
