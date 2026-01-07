import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useMemo, useState } from 'react';

interface VendorCoverProps {
	src?: string | null;
	alt: string;
	className?: string;
	imageClassName?: string;
}

const GRADIENTS = [
	'from-orange-100 to-amber-200 text-orange-700',
	'from-blue-100 to-cyan-200 text-blue-700',
	'from-emerald-100 to-green-200 text-emerald-700',
	'from-rose-100 to-pink-200 text-rose-700',
	'from-violet-100 to-purple-200 text-violet-700',
	'from-amber-100 to-yellow-200 text-amber-700',
	'from-teal-100 to-emerald-200 text-teal-700',
	'from-indigo-100 to-blue-200 text-indigo-700',
];

const EMOJI_MAP: Record<string, string> = {
	burger: '🍔',
	pizza: '🍕',
	sushi: '🍣',
	rice: '🍚',
	pasta: '🍝',
	taco: '🌮',
	salad: '🥗',
	chicken: '🍗',
	beef: '🥩',
	steak: '🥩',
	grill: '🔥',
	bbq: '🍖',
	coffee: '☕',
	cafe: '☕',
	drink: '🍹',
	juice: '🧃',
	dessert: '🍰',
	cake: '🍰',
	ice: '🍦',
	cream: '🍦',
	fish: '🐟',
	seafood: '🦐',
	vegan: '🥦',
	veg: '🥬',
	bread: '🥖',
	bakery: '🥐',
	bistro: '🍽️',
	diner: '🍳',
	restaurant: '🍴',
	kitchen: '👨‍🍳',
	food: '🥘',
	spot: '📍',
	corner: '🏘️',
	place: '🏠',
};

const getPlaceholderData = (name: string) => {
	const lowerName = name.toLowerCase();

	// Deterministic hash for gradient
	const hash = name
		.split('')
		.reduce((acc, char) => char.charCodeAt(0) + acc, 0);
	const gradient = GRADIENTS[hash % GRADIENTS.length];

	// Emoji detection
	let emoji = '🏪'; // Default
	for (const [key, value] of Object.entries(EMOJI_MAP)) {
		if (lowerName.includes(key)) {
			emoji = value;
			break;
		}
	}

	// Fallback if generic terms only
	if (
		emoji === '🏪' &&
		(lowerName.includes('kitchen') || lowerName.includes('bistro'))
	) {
		emoji = '🍽️';
	}

	return { gradient, emoji };
};

const VendorCover = ({
	src,
	alt,
	className,
	imageClassName,
}: VendorCoverProps) => {
	const { gradient, emoji } = useMemo(() => getPlaceholderData(alt), [alt]);
	const [imgError, setImgError] = useState(false);

	// Reset error state if src changes
	useMemo(() => {
		setImgError(false);
	}, [src]);

	if (src && !imgError) {
		return (
			<div className={cn('relative overflow-hidden bg-muted', className)}>
				<Image
					src={src}
					alt={alt}
					fill
					className={cn('object-cover', imageClassName)}
					sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
					onError={() => setImgError(true)}
				/>
			</div>
		);
	}

	// Initials generation
	const getInitials = (text: string) => {
		const words = text.trim().split(/\s+/);
		if (words.length === 0) return '';
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return (words[0][0] + words[1][0]).toUpperCase();
	};

	return (
		<div
			className={cn(
				'relative overflow-hidden flex flex-col items-center justify-center select-none bg-linear-to-br',
				gradient,
				className
			)}>
			<div className='flex flex-col items-center justify-center gap-1 transform transition-transform hover:scale-105 duration-300'>
				<span className='text-4xl sm:text-5xl filter drop-shadow-sm animate-in zoom-in duration-300'>
					{emoji}
				</span>
				<span className='text-sm sm:text-base font-bold opacity-90 px-2 text-center uppercase tracking-widest'>
					{getInitials(alt)}
				</span>
			</div>
			{/* Decorative pattern overlay */}
			<div className='absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]' />
		</div>
	);
};

export default VendorCover;
