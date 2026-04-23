// Blog index — built at module-load time from every `+page.md` under
// src/routes/blog/**. Frontmatter drives the list; there's no hand-maintained
// array. A post's URL is derived from its directory name.

export type Post = {
	slug: string;
	title: string;
	date: string;
	author: string;
	excerpt: string;
	description?: string;
	category?: string;
};

type FrontmatterModule = {
	metadata?: Record<string, unknown>;
};

function toPost(path: string, mod: FrontmatterModule): Post | null {
	const match = path.match(/\/src\/routes\/blog\/([^/]+)\/\+page\.md$/);
	if (!match) return null;
	const slug = match[1];
	const fm = mod.metadata ?? {};
	if (typeof fm.title !== 'string' || typeof fm.date !== 'string') return null;
	const post: Post = {
		slug,
		title: fm.title,
		date: fm.date,
		author: typeof fm.author === 'string' ? fm.author : 'mlaass',
		excerpt:
			typeof fm.excerpt === 'string'
				? fm.excerpt
				: typeof fm.description === 'string'
					? fm.description
					: ''
	};
	if (typeof fm.description === 'string') post.description = fm.description;
	if (typeof fm.category === 'string') post.category = fm.category;
	return post;
}

const modules = import.meta.glob<FrontmatterModule>(
	'/src/routes/blog/**/+page.md',
	{ eager: true }
);

export const posts: Post[] = Object.entries(modules)
	.map(([path, mod]): Post | null => toPost(path, mod))
	.filter((p: Post | null): p is Post => p !== null)
	.sort((a: Post, b: Post) => b.date.localeCompare(a.date));
