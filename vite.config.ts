import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Set BASE_PATH=/<repo-name> when building for GitHub Pages project sites.
const rawBase = process.env.BASE_PATH ?? '';
const base = (rawBase === '' || rawBase.startsWith('/') ? rawBase : `/${rawBase}`) as
	| ''
	| `/${string}`;

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Static adapter builds a fully client-side SPA — a good fit since this app has no
			// server routes and stores all data in the browser. `fallback` serves index.html for
			// any route not known at build time (e.g. /plugin/[id]), which GitHub Pages needs.
			adapter: adapter({ fallback: '404.html' }),

			paths: {
				base
			}
		})
	]
});
