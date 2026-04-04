import { paraglideVitePlugin } from '@inlang/paraglide-js';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function resolveApiUrl(): string | undefined {
	// Explicit env var takes precedence
	if (process.env.VITE_API_URL) return undefined; // let Vite handle it normally

	// On Vercel preview deployments, derive the API URL from the branch name
	if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_GIT_COMMIT_REF) {
		const branch = process.env.VERCEL_GIT_COMMIT_REF.replace(/\//g, '-');
		return `https://blueprints-api-git-${branch}-adechasseys-projects.vercel.app`;
	}

	return undefined;
}

const previewApiUrl = resolveApiUrl();

export default defineConfig({
	plugins: [
		TanStackRouterVite({ quoteStyle: 'single' }),
		react(),
		tailwindcss(),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/paraglide',
		}),
	],
	...(previewApiUrl && {
		define: {
			'import.meta.env.VITE_API_URL': JSON.stringify(previewApiUrl),
		},
	}),
});
