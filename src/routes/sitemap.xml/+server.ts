import type { RequestHandler } from '@sveltejs/kit';

export const prerender = true;

const SITE = 'https://nkido.cc';

const routes = [
	'/',
	'/getting-started',
	'/features',
	'/docs',
	'/docs/concepts',
	'/docs/concepts/signals',
	'/docs/concepts/hot-swap',
	'/docs/concepts/mini-notation',
	'/docs/tutorials/hello-sine',
	'/godot',
	'/esp32',
	'/blog',
	'/blog/introducing-nkido',
	'/community',
	'/press'
];

export const GET: RequestHandler = () => {
	const today = new Date().toISOString().slice(0, 10);
	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
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
