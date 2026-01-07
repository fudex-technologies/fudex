import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Address } from '@prisma/client';
import { PAGES_DATA } from '@/data/pagesData';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

interface AddressesDrawerProps {
	isAddressDialogOpen: boolean;
	setIsAddressDialogOpen: (open: boolean) => void;
	addresses: Address[];
	selectedAddressId: string | null;
	setSelectedAddressId: (id: string) => void;
}

const AddressesDrawer = ({
	isAddressDialogOpen,
	setIsAddressDialogOpen,
	addresses,
	selectedAddressId,
	setSelectedAddressId,
}: AddressesDrawerProps) => {
	const router = useRouter();
	return (
		<Drawer
			open={isAddressDialogOpen}
			onOpenChange={setIsAddressDialogOpen}>
			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Select Delivery Address</DrawerTitle>
				</DrawerHeader>
				<div className='p-4'>
					{addresses.length === 0 ? (
						<div className='space-y-4 py-10 flex flex-col justify-center items-center'>
							<ImageWithFallback
								src={'/assets/biglocationicon.png'}
								className='w-[200px]'
								alt='location'
							/>
							<p className='text-foreground/70 text-center'>
								No addresses found. Please add an address first.
							</p>
							<Button
								variant='game'
								onClick={() => {
									setIsAddressDialogOpen(false);
									router.push(
										PAGES_DATA.profile_addresses_page
									);
								}}
								className='w-full'>
								Add Address
							</Button>
						</div>
					) : (
						<RadioGroup
							value={selectedAddressId ?? ''}
							onValueChange={(value) => {
								setSelectedAddressId(value);
								setIsAddressDialogOpen(false);
							}}
							className='space-y-2'>
							{addresses.map((address) => (
								<div key={address.id}>
									<div className='flex items-center gap-3 p-3 rounded border'>
										<RadioGroupItem
											value={address.id}
											id={`address-${address.id}`}
										/>
										<Label
											htmlFor={`address-${address.id}`}
											className='flex-1 cursor-pointer'>
											<div>
												{address.label && (
													<p className='font-semibold'>
														{address.label}
													</p>
												)}
												<p className='text-sm'>
													{address.line1}
													{address.line2 &&
														`, ${address.line2}`}
												</p>
												<p className='text-sm text-foreground/50'>
													{address.city}
													{address.state &&
														`, ${address.state}`}
												</p>
											</div>
										</Label>
									</div>
									{addresses.indexOf(address) <
										addresses.length - 1 && (
										<Separator className='my-2' />
									)}
								</div>
							))}
						</RadioGroup>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
};

export default AddressesDrawer;
