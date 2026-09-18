/** Formats a timestamp as a medium date ("Sep 17, 2026") in the given locale. */
export function formatDate(value: string | Date, locale: string): string {
	return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));
}
