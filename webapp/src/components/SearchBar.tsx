import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import * as m from '../paraglide/messages.js';
import { Button } from './ui/button.js';

interface SearchBarProps {
	initialQuery?: string;
	onSearch: (query: string) => void;
	isLoading?: boolean;
}

const DEBOUNCE_MS = 300;

export function SearchBar({ initialQuery = '', onSearch, isLoading }: SearchBarProps) {
	const [value, setValue] = useState(initialQuery);
	const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const inputRef = useRef<HTMLInputElement>(null);

	// Latest callback / query, so the debounce effect below can depend on `value` only
	const onSearchRef = useRef(onSearch);
	onSearchRef.current = onSearch;
	const lastCommittedRef = useRef(initialQuery);

	useEffect(() => {
		if (value === lastCommittedRef.current) return;

		debounceRef.current = setTimeout(() => {
			lastCommittedRef.current = value;
			onSearchRef.current(value.trim());
		}, DEBOUNCE_MS);

		return () => clearTimeout(debounceRef.current);
	}, [value]);

	const handleClear = () => {
		setValue('');
		lastCommittedRef.current = '';
		onSearch('');
		inputRef.current?.focus();
	};

	return (
		<div className="flex flex-col md:flex-row gap-3">
			<div className="relative flex-grow group">
				<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-outline" />
				<input
					ref={inputRef}
					type="text"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					placeholder={m.search_placeholder()}
					className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-base font-medium outline-none text-on-surface placeholder:text-outline"
				/>
				{isLoading && (
					<span className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
				)}
			</div>
			{value && (
				<Button type="button" variant="secondary" size="lg" onClick={handleClear}>
					<X className="h-4 w-4" />
					{m.search_clear()}
				</Button>
			)}
		</div>
	);
}
