import { GoHomeFill } from 'react-icons/go';
import { GoSearch } from 'react-icons/go';
import { GoPackage } from 'react-icons/go';
import { FaRegUser } from 'react-icons/fa';

const MobileBottomNav = () => {
	return (
		<div className='fixed flex md:hidden bottom-0 left-0 w-screen bg-background border-t border-t-[#85858540] h-[100px] text-[#858585]'>
			<div className='flex flex-1 flex-col justify-center items-center'>
				<GoHomeFill width={20} height={20} className='w-5 h-5' />
				<p className=''>Home</p>
			</div>
			<div className='flex flex-1 flex-col justify-center items-center'>
				<GoSearch width={20} height={20} className='w-5 h-5' />
				<p className=''>Search</p>
			</div>
			<div className='flex flex-1 flex-col justify-center items-center'>
				<GoPackage width={20} height={20} className='w-5 h-5' />
				<p className=''>Orders</p>
			</div>
			<div className='flex flex-1 flex-col justify-center items-center'>
				<FaRegUser width={20} height={20} className='w-5 h-5' />
				<p className=''>Profile</p>
			</div>
		</div>
	);
};

export default MobileBottomNav;
