import { getLocale } from '../paraglide/runtime.js';
import { formatDate as formatDateIn } from './format-date.core.js';

/** Formats a timestamp as a medium date in the app locale, whatever the browser's. */
export function formatDate(value: string | Date): string {
	return formatDateIn(value, getLocale());
}
