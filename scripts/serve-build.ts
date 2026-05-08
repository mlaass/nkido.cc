// Tiny static file server for the static-adapter output. `vite preview`
// doesn't include the Pagefind postbuild artifacts — it serves from the
// SvelteKit dev output, not from `build/`. Playwright e2e tests need the
// real `build/` dir served, including the Pagefind index.
//
// Resolves clean URLs (e.g. `/docs/foo`) to `<path>.html` (matching
// Netlify's pretty-URL behavior in production), or `<path>/index.html`,
// otherwise 404.
import { resolve, extname } from 'node:path';
import { existsSync, statSync } from 'node:fs';

const PORT = Number(process.env.PORT ?? 4173);
const ROOT = resolve(import.meta.dir, '..', 'build');

const MIME: Record<string, string> = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.js': 'application/javascript; charset=utf-8',
	'.mjs': 'application/javascript; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.ico': 'image/x-icon',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml',
	'.wasm': 'application/wasm',
	'.pf_meta': 'application/octet-stream',
	'.pf_index': 'application/octet-stream',
	'.pf_fragment': 'application/octet-stream'
};

function resolveCandidate(pathname: string): string | null {
	let path = decodeURIComponent(pathname);
	if (path.endsWith('/')) path = path.slice(0, -1);
	const direct = resolve(ROOT, '.' + (path || '/'));
	if (!direct.startsWith(ROOT)) return null; // path traversal guard

	if (existsSync(direct) && statSync(direct).isFile()) return direct;
	if (existsSync(direct + '.html') && statSync(direct + '.html').isFile()) return direct + '.html';
	const indexPath = resolve(direct, 'index.html');
	if (existsSync(indexPath) && statSync(indexPath).isFile()) return indexPath;

	const fallback = resolve(ROOT, '404.html');
	if (existsSync(fallback)) return fallback;
	return null;
}

const server = Bun.serve({
	port: PORT,
	async fetch(req) {
		const url = new URL(req.url);
		const file = resolveCandidate(url.pathname);
		if (!file) return new Response('Not Found', { status: 404 });
		const isFallback = file.endsWith('/404.html');
		const ext = extname(file).toLowerCase();
		const type = MIME[ext] ?? 'application/octet-stream';
		return new Response(Bun.file(file), {
			status: isFallback ? 404 : 200,
			headers: { 'content-type': type }
		});
	}
});

console.log(`serve-build: ${ROOT} → http://localhost:${server.port}`);
