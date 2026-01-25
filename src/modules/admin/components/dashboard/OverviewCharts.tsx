'use client';

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	AreaChart,
	Area,
	BarChart,
	Bar,
} from 'recharts';
import { formatCurency } from '@/lib/commonFunctions';

const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
	if (active && payload && payload.length) {
		const date = new Date(label);
		const formattedDate = !isNaN(date.getTime())
			? date.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				})
			: label;

		return (
			<div className='bg-card border border-border p-3 rounded-lg shadow-xl backdrop-blur-sm'>
				<p className='text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wider'>
					{formattedDate}
				</p>
				{payload.map((item: any, index: number) => (
					<div
						key={index}
						className='flex items-center gap-2 justify-between'>
						<div className='flex items-center gap-1.5'>
							<div
								className='w-2 h-2 rounded-full'
								style={{ backgroundColor: item.color }}
							/>
							<span className='text-sm font-semibold capitalize'>
								{item.name}:
							</span>
						</div>
						<span className='text-sm font-bold text-primary'>
							{prefix}
							{item.name === 'revenue'
								? formatCurency(item.value)
								: item.value.toLocaleString()}
						</span>
					</div>
				))}
			</div>
		);
	}
	return null;
};

interface OverviewChartsProps {
	data: any[];
	title: string;
	description?: string;
}

export function OverviewCharts({
	data,
	title,
	description,
}: OverviewChartsProps) {
	return (
		<Card className='col-span-1 lg:col-span-2'>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && (
					<CardDescription>{description}</CardDescription>
				)}
			</CardHeader>
			<CardContent>
				<div className='h-[300px] w-full mt-4'>
					<ResponsiveContainer width='100%' height='100%'>
						<AreaChart data={data}>
							<defs>
								<linearGradient
									id='colorRevenue'
									x1='0'
									y1='0'
									x2='0'
									y2='1'>
									<stop
										offset='5%'
										stopColor='var(--chart-1)'
										stopOpacity={0.3}
									/>
									<stop
										offset='95%'
										stopColor='var(--chart-1)'
										stopOpacity={0}
									/>
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray='3 3'
								vertical={false}
								stroke='var(--border)'
							/>
							<XAxis
								dataKey='date'
								axisLine={false}
								tickLine={false}
								fontSize={12}
								tickFormatter={(val) => {
									const d = new Date(val);
									return d.toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
									});
								}}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								fontSize={12}
								tickFormatter={(val) =>
									`₦${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`
								}
							/>
							<Tooltip content={<CustomTooltip />} />
							<Area
								type='monotone'
								dataKey='revenue'
								stroke='var(--chart-1)'
								fillOpacity={1}
								fill='url(#colorRevenue)'
								strokeWidth={2}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}

export function OrdersChart({ data }: { data: any[] }) {
	return (
		<Card className='col-span-1'>
			<CardHeader>
				<CardTitle>Orders Overview</CardTitle>
				<CardDescription>Number of orders placed</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='h-[300px] w-full mt-4'>
					<ResponsiveContainer width='100%' height='100%'>
						<BarChart data={data}>
							<CartesianGrid
								strokeDasharray='3 3'
								vertical={false}
								stroke='var(--border)'
							/>
							<XAxis
								dataKey='date'
								axisLine={false}
								tickLine={false}
								fontSize={12}
								tickFormatter={(val) => {
									const d = new Date(val);
									return d.toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
									});
								}}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								fontSize={12}
							/>
							<Tooltip
								cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
								content={<CustomTooltip />}
							/>
							<Bar
								dataKey='orders'
								fill='var(--chart-2)'
								radius={[4, 4, 0, 0]}
							/>
						</BarChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
