// Blog index. Merges hand-authored posts (frontmatter on +page.md files) with
// GitHub releases fetched at build time into src/lib/data/releases.json.
//
// A post is either:
//   kind === 'post'    → markdown blog post authored in this repo
//   kind === 'release' → rendered from a tagged GitHub release

import releasesData from './releases.json';

export type PostKind = 'post' | 'release';

export type Post = {
	kind: PostKind;
	slug: string;
	url: string;
	title: string;
	date: string;
	author: string;
	excerpt: string;
	description?: string;
	tag?: string;
	draft?: boolean;
};

type FrontmatterModule = {
	metadata?: Record<string, unknown>;
};

type ReleaseEntry = {
	tag: string;
	title: string;
	body: string;
	date: string;
	prerelease: boolean;
	url: string;
};

type ReleasesFile = {
	generatedAt: string;
	releases: ReleaseEntry[];
};

function summarise(body: string, max = 180): string {
	const firstPara = body
		.split('\n\n')
		.map((p) => p.trim())
		.find((p) => p.length > 0 && !p.startsWith('#') && !p.startsWith('```'));
	if (!firstPara) return '';
	const cleaned = firstPara
		.replace(/^[-*]\s+/gm, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
	return cleaned.length > max ? cleaned.slice(0, max - 1).trimEnd() + '…' : cleaned;
}

function toMarkdownPost(path: string, mod: FrontmatterModule): Post | null {
	const match = path.match(/\/src\/routes\/blog\/([^/]+)\/\+page\.md$/);
	if (!match) return null;
	const slug = match[1];
	const fm = mod.metadata ?? {};
	if (typeof fm.title !== 'string' || typeof fm.date !== 'string') return null;
	const post: Post = {
		kind: 'post',
		slug,
		url: `/blog/${slug}`,
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
	if (fm.draft === true) post.draft = true;
	return post;
}

function toReleasePost(r: ReleaseEntry): Post {
	return {
		kind: 'release',
		slug: `releases/${r.tag}`,
		url: `/blog/releases/${r.tag}`,
		title: r.title,
		date: r.date,
		author: 'Release',
		excerpt: summarise(r.body),
		tag: r.tag
	};
}

const mdModules = import.meta.glob<FrontmatterModule>(
	'/src/routes/blog/**/+page.md',
	{ eager: true }
);

const mdPosts: Post[] = Object.entries(mdModules)
	.map(([path, mod]): Post | null => toMarkdownPost(path, mod))
	.filter((p: Post | null): p is Post => p !== null);

const releasePosts: Post[] = (releasesData as ReleasesFile).releases.map(toReleasePost);

// Drafts exist as routes (so you can preview via direct URL) but aren't
// listed on /blog or in the sitemap. Flip `draft: false` (or drop the field)
// in frontmatter to publish.
export const posts: Post[] = [...mdPosts, ...releasePosts]
	.filter((p) => p.draft !== true)
	.sort((a, b) => b.date.localeCompare(a.date));

export const allPostsIncludingDrafts: Post[] = [...mdPosts, ...releasePosts].sort(
	(a, b) => b.date.localeCompare(a.date)
);
