import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import * as m from '../paraglide/messages.js';
import { Button } from './ui/button.js';

/** Copies a snippet to the clipboard, confirming with a check for two seconds. */
export function CopyButton({ code }: { code: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={handleCopy}
			aria-live="polite"
			className="h-7 shrink-0 gap-1.5 px-2 text-on-surface-variant text-xs"
		>
			{copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
			{copied ? m.cli_copied() : m.cli_copy()}
		</Button>
	);
}
