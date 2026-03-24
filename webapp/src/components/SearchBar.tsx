import { Search, X } from 'lucide-react';
import { useState } from 'react';
import * as m from '../paraglide/messages.js';
import { Button } from './ui/button.js';

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
		<form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
			<div className="relative flex-grow group">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
				<input
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={m.search_placeholder()}
					className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 focus:bg-surface-container-lowest transition-all text-lg font-medium outline-none text-on-surface placeholder:text-outline"
				/>
			</div>
			<div className="flex gap-2">
				<Button type="submit" variant="primary" size="lg" disabled={isLoading}>
					{m.search_button()}
				</Button>
				{value && (
					<Button type="button" variant="secondary" size="lg" onClick={handleClear}>
						<X className="h-4 w-4" />
						{m.search_clear()}
					</Button>
				)}
			</div>
		</form>
	);
}
