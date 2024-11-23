import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
  extensions: ['.md'],
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md'],
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
  preprocess: [vitePreprocess({}), mdsvex(mdsvexOptions)],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		csp: {
			directives: {
				'script-src': ['self', 'https://maps.googleapis.com'],
				'img-src': ['self', 'https://maps.googleapis.com', 'https://maps.gstatic.com/', 'data:', 'blob:', 'http://img.youtube.com']
			}
		}
	}
};

export default config;
