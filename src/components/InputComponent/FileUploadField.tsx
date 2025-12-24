'use client';

import { File, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface FileUploadFieldProps {
	label?: string;
	status?: 'empty' | 'added' | 'uploaded' | 'verified' | 'pending';
	fileName?: string;
	onUpload?: (file: File) => void;
	onRemove?: () => void;
	maxSize?: number;
	accepts?: HTMLInputElement['accept'][];
}

export function FileUploadField({
	label = 'File',
	status = 'empty',
	fileName,
	onUpload,
	onRemove,
	maxSize,
	accepts = ['.pdf', '.jpg', '.jpeg', '.png'],
}: FileUploadFieldProps) {
	const [file, setFile] = useState<File | null>(null);
	const [localStatus, setLocalStatus] = useState(status);
	const [isDragOver, setIsDragOver] = useState(false);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];

		if (file) {
			setFile(file);
			setLocalStatus('added');
		}
		if (file && onUpload) {
			onUpload(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		const file = e.dataTransfer.files[0];
		if (file && onUpload) {
			onUpload(file);
			setFile(file);
			setLocalStatus('added');
		}
	};

	const getStatusColor = () => {
		switch (localStatus) {
			case 'uploaded':
			case 'added':
				return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
			case 'verified':
				return 'bg-green-50 border-green-200 hover:bg-green-100';
			case 'pending':
				return 'bg-amber-50 border-amber-200 hover:bg-amber-100';
			default:
				return 'bg-slate-50 border-slate-200 hover:bg-slate-100';
		}
	};

	const handleRemove = () => {
		setFile(null);
		setLocalStatus('empty');
		if (onRemove) {
			onRemove();
		}
	};

	return (
		<div className='space-y-2 w-full'>
			<div
				className={`
          relative w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-blue-400 bg-blue-50' : getStatusColor()}
          ${localStatus === 'empty' ? 'border-dashed' : 'border-solid'}
        `}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}>
				<Input
					type='file'
					accept={accepts.join(',')}
					onChange={handleFileSelect}
					className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
				/>

				<div className='flex items-center justify-between p-2'>
					{/* Left side - Icon and Label */}
					<div className='flex items-center gap-3 flex-1'>
						<File />
						<div className='flex-1'>
							<p className='text-sm font-medium text-slate-900'>
								{label}
							</p>
							{(file?.name || fileName) && (
								<p className='text-xs text-slate-500 mt-1 truncate max-w-48'>
									{file?.name || fileName}
								</p>
							)}
						</div>
					</div>

					<div className='flex items-center gap-2'>
						<div className='flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors'>
							<Upload />
						</div>
					</div>
				</div>

				{/* Drag overlay */}
				{isDragOver && (
					<div className='absolute inset-0 bg-blue-500/10 rounded-xl flex items-center justify-center'>
						<p className='text-blue-700 font-medium'>
							Drop file here
						</p>
					</div>
				)}
			</div>

			{/* Helper text */}
			<div className='flex items-center justify-between text-xs text-slate-500'>
				<span>
					{accepts.join(', ').toUpperCase()}{' '}
					{maxSize && `up to ${maxSize}MB`}
				</span>
				{localStatus !== 'empty' && (
					<Button
						onClick={handleRemove}
						className='text-red-500! hover:text-red-700! transition-colors p-2! bg-slate-100!'>
						Remove
					</Button>
				)}
			</div>
		</div>
	);
}
