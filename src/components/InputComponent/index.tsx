'use client';

import React, { useState } from 'react';
import { Label } from '../ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { shortenText } from '@/lib/commonFunctions';
import { File, X } from 'lucide-react';
import { ClassNameValue } from 'tailwind-merge';
import { FaInfoCircle } from 'react-icons/fa';
import { FileUploadField } from './FileUploadField';
import { RiEyeOffLine } from 'react-icons/ri';
import { RiEyeLine } from 'react-icons/ri';

export const LabelComponent: React.FC<{
	label: string;
	required?: boolean;
	className?: ClassNameValue;
}> = ({ label, required, className }) => {
	return (
		<Label
			className={`block text-foreground/50 text-lg font-light mb-1 ${className}`}>
			{label}
			{required && <span className='text-red-500 ml-1'>*</span>}
		</Label>
	);
};

interface InputFieldProps {
	id?: string;
	label: string;
	type?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	hint?: string;
	icon?: React.ReactElement;
	className?: ClassNameValue;
	accept?: string;
	min?: string;
	max?: string;
}

const InputField: React.FC<InputFieldProps> = ({
	id,
	label,
	type = 'text',
	value,
	onChange,
	placeholder,
	error,
	required = false,
	hint,
	icon,
	className,
	accept,

	...props
}) => {
	const [showPassword, setShowPassword] = useState(false);

	const toggleShowPassword = () => {
		if (type !== 'password') return;
		setShowPassword((prev) => !prev);
	};

	const inputType = type === 'password' && showPassword ? 'text' : type;

	return (
		<div className={`mb-4 w-full relative ${className}`}>
			<div className='w-full flex justify-between items-center gap-5'>
				<LabelComponent label={label} required={required} />

				{icon && <span className='absolute top-12 left-3'>{icon}</span>}

				{type === 'password' && (
					<Button
						type='button'
						size={'icon-sm'}
						variant={'ghost'}
						onClick={toggleShowPassword}
						className='text-xs font-light absolute top-10 right-3 cursor-pointer'>
						{/* {showPassword ? 'Hide' : 'Show'} */}
						{showPassword ? (
							<RiEyeOffLine className='text-foreground/50 w-[18px]' />
						) : (
							<RiEyeLine className='text-foreground/50 w-[18px]' />
						)}
					</Button>
				)}
			</div>

			<Input
				id={id}
				type={inputType}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				className={`
          w-full px-3 py-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition  bg-gray-50 
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${icon && 'pl-10'}
          `}
				accept={accept}
				{...props}
			/>
			{hint && !error && (
				<p className='text-xs text-gray-400 mt-1'>{hint}</p>
			)}
			{error && (
				<p className='text-xs text-red-500 mt-1 flex items-center gap-2'>
					<FaInfoCircle color='red' className='w-3 h-3' /> {error}
				</p>
			)}
		</div>
	);
};

interface TextAreaFieldProps {
	label: string;
	type?: string;
	value: string;
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	hint?: string;
	rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
	label,
	value,
	onChange,
	placeholder,
	required = false,
	hint,
	error,
	rows = 8,
}) => {
	return (
		<div className='mb-4 w-full'>
			<LabelComponent label={label} required={required} />
			<Textarea
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				required={required}
				rows={rows}
				className={`w-full px-3 py-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition  bg-gray-50 resize-none ${
					error ? 'border-red-500' : 'border-gray-300'
				}`}
			/>
			{hint && !error && (
				<p className='text-xs text-gray-400 mt-1'>{hint}</p>
			)}
			{error && (
				<p className='text-xs text-red-500 mt-1'>
					<FaInfoCircle color='red' className='w-3 h-3' /> {error}
				</p>
			)}
		</div>
	);
};

interface SelectFieldProps {
	label: string;
	type?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	required?: boolean;
	hint?: string;
	icon?: React.ReactElement;
	data: { value: string; label: string }[];
}

export const SelectField: React.FC<SelectFieldProps> = ({
	label,
	value,
	onChange,
	required = false,
	hint,
	error,
	data,
	icon,
	placeholder,
}) => {
	return (
		<div className='mb-4 w-full relative'>
			<LabelComponent label={label} required={required} />

			{icon && <span className='absolute top-9 left-3'>{icon}</span>}

			<Select value={value} onValueChange={onChange} required={required}>
				<SelectTrigger
					className={`
          w-full px-3 py-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition  bg-gray-50 resize-none 
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${icon && 'pl-10!'}
          `}>
					<SelectValue placeholder={placeholder || 'Select'} />
				</SelectTrigger>
				<SelectContent
					className={`
          w-full px-3 py-6 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 transition  bg-gray-50 resize-none 
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${icon && 'pl-10!'}
          `}>
					{data.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{hint && !error && (
				<p className='text-xs text-gray-400 mt-1'>{hint}</p>
			)}
			{error && (
				<p className='text-xs text-red-500 mt-1'>
					<FaInfoCircle color='red' className='w-3 h-3' /> {error}
				</p>
			)}
		</div>
	);
};

interface IAddItemsInputField
	extends Omit<InputFieldProps, 'value' | 'onChange'> {
	value: {
		label: string;
		value: any;
	}[];
	onChange: (
		newItems: {
			label: string;
			value: any;
		}[]
	) => void;
}

export const AddItemsInputField: React.FC<IAddItemsInputField> = ({
	label,
	type = 'text',
	value = [],
	onChange,
	placeholder,
	error,
	required = false,
	hint,
	icon,
	accept,
}) => {
	const [inputValue, setInputValue] = useState<string>('');
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleAddItem = () => {
		if (type === 'file') {
			if (selectedFile) {
				onChange([
					...value,
					{ label: selectedFile.name, value: selectedFile },
				]);
				setSelectedFile(null);
				const fileInput = document.getElementById(
					`file-input-${label}`
				) as HTMLInputElement;
				if (fileInput) {
					fileInput.value = '';
				}
			}
		} else {
			if (typeof inputValue === 'string' && inputValue.trim() !== '') {
				onChange([...value, { label: inputValue, value: inputValue }]);
				setInputValue('');
			}
		}
	};

	const handleRemoveItem = (index: number) => {
		const newItems = [...value];
		newItems.splice(index, 1);
		onChange(newItems);
	};

	const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (type === 'file') {
			if (e.target.files) {
				setSelectedFile(e.target.files[0]);
			}
		} else {
			setInputValue(e.target.value);
		}
	};

	return (
		<div className='flex flex-col mb-4'>
			<div className='w-full flex md:flex-row gap-4 justify-between items-end p-0'>
				<div className='flex-1 p-0 '>
					{type === 'file' ? (
						<FileUploadField
							label={label}
							accepts={accept?.split(',') || []}
							onUpload={(value: File) => setSelectedFile(value)}
						/>
					) : (
						<InputField
							id={`file-input-${label}`}
							label={label}
							type={type}
							value={inputValue}
							placeholder={placeholder}
							error={error}
							required={required}
							hint={selectedFile ? selectedFile.name : hint}
							icon={icon}
							onChange={onChangeHandler}
							className='mb-0!'
							accept={accept}
						/>
					)}
				</div>
				{type === 'file' && !selectedFile ? null : (
					<Button
						type='button'
						variant={'secondary'}
						onClick={handleAddItem}>
						+ Add
					</Button>
				)}
			</div>
			{value.length > 0 && (
				<div className='flex flex-wrap gap-2 mt-2 mb-3'>
					{value.map((item, index) => (
						<div
							key={index}
							className={
								'bg-secondary text-gray-600 dark:text-gray-400-foreground px-3 py-1 rounded-md shadow-sm text-sm flex items-center gap-2 justify-between' +
								(type === 'file' ? ' w-[80%]' : '')
							}>
							<div className='flex gap-2 items-center'>
								{type === 'file' && <File />}
								<span>{shortenText(item.label, 20)}</span>
							</div>

							<button
								type='button'
								onClick={() => handleRemoveItem(index)}
								className='hover:text-red-700'>
								<X className='w-4 h-4' />
							</button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default InputField;
