import EditAccountDrawer from '@/components/EditAccountDrawer';
import GoBackButton from '@/components/GoBackButton';
import PageWrapper from '@/components/wrapers/PageWrapper';
import EditNameForm from './EditNameForm';
import EditPhoneForm from './EditPhoneForm';
import EditEmailForm from './EditEmailForm';

export default function AccountPage() {
	return (
		<PageWrapper className='px-5 flex flex-col items-center'>
			<div className='flex items-center gap-10 w-full'>
				<GoBackButton />
				<p className='font-semibold text-xl'>Account</p>
			</div>
			<div className='py-10 space-y-5 max-w-lg w-full'>
				<div className='space-y-3 w-full'>
					<p className='font-light text-foreground/50'>
						Account name
					</p>
					<div className='flex items-center justify-between p-5 border rounded-md text-foreground/50'>
						<p className=''>Olaide Igotun</p>
						<EditAccountDrawer editForm={<EditNameForm />} />
					</div>
				</div>
				<div className='space-y-3 w-full'>
					<p className='font-light text-foreground/50'>
						Phone number
					</p>
					<div className='flex items-center justify-between p-5 border rounded-md text-foreground/50'>
						<p className=''>09020271386</p>
						<EditAccountDrawer editForm={<EditPhoneForm />} />
					</div>
				</div>
				<div className='space-y-3 w-full'>
					<p className='font-light text-foreground/50'>Email</p>
					<div className='flex items-center justify-between p-5 border rounded-md text-foreground/50'>
						<p className=''>olaideigotun06@gmail.com</p>
						<EditAccountDrawer editForm={<EditEmailForm />} />
					</div>
				</div>
			</div>
		</PageWrapper>
	);
}
