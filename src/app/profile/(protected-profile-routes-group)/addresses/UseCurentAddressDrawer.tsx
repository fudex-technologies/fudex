'use client';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { FaLocationArrow } from 'react-icons/fa';
import { savedAddressIcons } from './page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const UseCurentAddressDrawer = () => {
	const [selectedLabel, setSelectedabel] = useState<
		'home' | 'school' | 'work' | 'other'
	>('home');
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<div className='p-5 w-full border-t border-b border-foreground/50 flex items-center justify-between cursor-pointer'>
					<div className='flex gap-2 items-center text-primary'>
						<FaLocationArrow className='' />
						<p className=''>Use your current location</p>
					</div>
					<ChevronRight className='text-foreground/50' />
				</div>
			</DrawerTrigger>
			<DrawerContent className='rounded-t-[50px]'>
				<div className='my-10 pt-5 pb-10 px-5 flex justify-center '>
					<div className='w-full max-w-lg space-y-3'>
						<div className='flex gap-2 items-center text-primary'>
							<FaLocationArrow className='' />
							<p className=''>Use your current location</p>
						</div>
						<div className='w-full'>
							<p className='font-semibold'>
								Road 5, Iworoko rd, Ekiti 360101, Ekiti, Nigeria
							</p>
							<p className='text-sm text-foreground/50'>
								Road 5, Iworoko rd, Ekiti 360101, Ekiti, Nigeria
							</p>
						</div>

						<div className='w-full space-y-2 my-5'>
							<p className='font-semibold'>Address Label</p>

							<div className='w-full flex gap-3 items-center justify-between font-normal'>
								<div
									onClick={() => setSelectedabel('home')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'home' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['home'].icon}
									<p className=''>
										{savedAddressIcons['home'].name}
									</p>
								</div>
								<div
									onClick={() => setSelectedabel('school')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'school' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['school'].icon}
									<p className=''>
										{savedAddressIcons['school'].name}
									</p>
								</div>
								<div
									onClick={() => setSelectedabel('work')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'work' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['work'].icon}
									<p className=''>
										{savedAddressIcons['work'].name}
									</p>
								</div>
								<div
									onClick={() => setSelectedabel('other')}
									className={cn(
										'py-4 flex-1 cursor-pointer flex flex-col gap-2 items-center justify-center  rounded-xl border  text-foreground',
										selectedLabel === 'other' &&
											'border-primary text-primary'
									)}>
									{savedAddressIcons['other'].icon}
									<p className=''>
										{savedAddressIcons['other'].name}
									</p>
								</div>
							</div>

							{selectedLabel === 'other' && (
								<Input
									className='w-full my-2'
									placeholder='Enter label'
								/>
							)}
						</div>

						<Button variant={'game'} className='w-full py-5 my-3'>
							Select this address
						</Button>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default UseCurentAddressDrawer;
