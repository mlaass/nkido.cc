import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } }
		}
	],
	webServer: {
		// Serve the actual `build/` directory rather than `vite preview`,
		// because Pagefind postbuild artifacts only land in `build/` and aren't
		// picked up by SvelteKit's preview server.
		command: 'bun run scripts/serve-build.ts',
		env: { PORT: '4173' },
		port: 4173,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	}
});
