import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			// Pagefind is emitted to `/pagefind/pagefind.js` by the postbuild step.
			// Treat it as an external runtime import so Vite doesn't try to resolve
			// it at build time.
			external: [/^\/pagefind\//]
		}
	}
});
