'use client';

import {
	Drawer,
	DrawerContent,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '../ui/button';
import { PenLine } from 'lucide-react';
import React from 'react';

const EditAccountDrawer = ({ editForm }: { editForm: React.ReactNode }) => {
	return (
		<Drawer>
			<DrawerTrigger asChild>
				<Button variant={'ghost'} size={'icon-sm'}>
					<PenLine />
				</Button>
			</DrawerTrigger>
			<DrawerContent>
				<div className='py-20 px-5 flex justify-center'>{editForm}</div>
			</DrawerContent>
		</Drawer>
	);
};

export default EditAccountDrawer;
