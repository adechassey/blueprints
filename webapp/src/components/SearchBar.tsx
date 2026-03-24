import { useState } from 'react';
import * as m from '../paraglide/messages.js';

interface SearchBarProps {
	initialQuery?: string;
	onSearch: (query: string) => void;
	isLoading?: boolean;
}

export function SearchBar({ initialQuery = '', onSearch, isLoading }: SearchBarProps) {
	const [value, setValue] = useState(initialQuery);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(value.trim());
	};

	const handleClear = () => {
		setValue('');
		onSearch('');
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<input
				type="text"
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={m.search_placeholder()}
				className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
			/>
			<button
				type="submit"
				disabled={isLoading}
				className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
			>
				{m.search_button()}
			</button>
			{value && (
				<button
					type="button"
					onClick={handleClear}
					className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
				>
					{m.search_clear()}
				</button>
			)}
		</form>
	);
}
