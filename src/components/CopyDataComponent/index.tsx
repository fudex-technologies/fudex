'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

function CopyDataComponent({ data }: { data: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(data);
		toast.success('Copied to clipboard!');
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
		}, 3000);
	};
	return (
		<span className='w-fit'>
			{copied ? <Check /> : <Copy onClick={() => handleCopy()} />}
		</span>
	);
}

export default CopyDataComponent;
