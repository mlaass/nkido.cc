import type { RequestHandler } from '@sveltejs/kit';
import manifest from '$lib/data/docs-manifest.json';
import { posts } from '$lib/data/posts';

export const prerender = true;

const SITE = 'https://nkido.cc';

type ManifestEntry = { url: string };
type Manifest = { entries: Record<string, ManifestEntry[]> };

// Hand-curated marketing + docs-index URLs. Doc entries (concepts,
// reference, tutorials, blog posts, releases) come from the generated
// manifest + posts.ts so new content shows up here automatically.
const MARKETING_PATHS = [
	'/',
	'/getting-started',
	'/features',
	'/godot',
	'/esp32',
	'/community',
	'/community/contributing',
	'/press'
];

const DOC_INDEX_PATHS = [
	'/docs',
	'/docs/concepts',
	'/docs/concepts/signals',
	'/docs/concepts/hot-swap',
	'/docs/concepts/mini-notation',
	'/docs/tutorials',
	'/docs/reference',
	'/docs/reference/builtins',
	'/docs/reference/language',
	'/docs/reference/mini-notation'
];

function mirroredPaths(): string[] {
	const all = Object.values((manifest as Manifest).entries).flat();
	return all.map((e) => e.url);
}

function blogPaths(): string[] {
	const index = ['/blog'];
	const items = posts.map((p) => p.url);
	return [...index, ...items];
}

export const GET: RequestHandler = () => {
	const today = new Date().toISOString().slice(0, 10);
	const paths = Array.from(
		new Set([
			...MARKETING_PATHS,
			...DOC_INDEX_PATHS,
			...mirroredPaths(),
			...blogPaths()
		])
	).sort();

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
	.map(
		(path) => `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
  </url>`
	)
	.join('\n')}
</urlset>
`;
	return new Response(body, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
};
