// Test stub for SvelteKit's $app/state. Component tests vi.mock this module
// to feed a synthetic page state. Without an alias, Vite's import analyzer
// can't resolve $app/state outside a SvelteKit dev server.
export const page = { url: { pathname: '/' } } as unknown as {
	url: { pathname: string };
};
