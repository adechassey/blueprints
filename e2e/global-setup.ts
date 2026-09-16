import { setupDatabase } from './helpers/db.js';

export default async function globalSetup(): Promise<void> {
	await setupDatabase();
}
