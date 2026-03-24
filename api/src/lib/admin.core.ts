/**
 * Pure admin utility functions.
 * No I/O — 100% test coverage required.
 */

export function getAdminEmails(): string[] {
	const raw = process.env.ADMIN_EMAILS || '';
	return raw
		.split(',')
		.map((e) => e.trim().toLowerCase())
		.filter(Boolean);
}

export function isDefaultAdmin(email: string): boolean {
	const adminEmails = getAdminEmails();
	return adminEmails.includes(email.toLowerCase().trim());
}
