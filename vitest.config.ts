import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svelteTesting } from '@testing-library/svelte/vite';
import { resolve } from 'node:path';

export default defineConfig({
	plugins: [svelte({ hot: false }), svelteTesting()],
	resolve: {
		alias: {
			$lib: resolve(__dirname, 'src/lib')
		}
	},
	test: {
		environment: 'happy-dom',
		include: ['scripts/**/*.test.ts', 'src/**/*.test.ts'],
		globals: false
	}
});
