export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/** Production URL — used to detect preview deployments and redirect auth through production. */
export const PRODUCTION_URL: string | undefined = import.meta.env.VITE_PRODUCTION_URL;
