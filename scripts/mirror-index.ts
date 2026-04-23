/**
 * Hand-maintained list of docs mirrored from upstream nkido.
 * Source of truth: github.com/mlaass/nkido master branch,
 * under `web/static/docs/`.
 *
 * Each entry maps an upstream file to a local route slug. The fetch
 * script writes `src/routes/docs/<category>/<subcategory>/<slug>/+page.md`
 * (or `src/routes/docs/<category>/<slug>/+page.md` when subcategory is empty).
 */

export type MirrorCategory = 'reference' | 'tutorials';
export type MirrorSubcategory = 'builtins' | 'language' | 'mini-notation' | '';

export type MirrorEntry = {
	/** Upstream path under the nkido repo root. */
	upstream: string;
	/** Top-level section on nkido.cc. */
	category: MirrorCategory;
	/** Reference-only sub-grouping ('' for tutorials). */
	subcategory: MirrorSubcategory;
	/** URL slug: /docs/<category>/[<subcategory>/]<slug>. */
	slug: string;
};

export const MIRROR_INDEX: MirrorEntry[] = [
	// reference / builtins (13)
	{ upstream: 'web/static/docs/reference/builtins/oscillators.md', category: 'reference', subcategory: 'builtins', slug: 'oscillators' },
	{ upstream: 'web/static/docs/reference/builtins/filters.md', category: 'reference', subcategory: 'builtins', slug: 'filters' },
	{ upstream: 'web/static/docs/reference/builtins/envelopes.md', category: 'reference', subcategory: 'builtins', slug: 'envelopes' },
	{ upstream: 'web/static/docs/reference/builtins/delays.md', category: 'reference', subcategory: 'builtins', slug: 'delays' },
	{ upstream: 'web/static/docs/reference/builtins/reverbs.md', category: 'reference', subcategory: 'builtins', slug: 'reverbs' },
	{ upstream: 'web/static/docs/reference/builtins/distortion.md', category: 'reference', subcategory: 'builtins', slug: 'distortion' },
	{ upstream: 'web/static/docs/reference/builtins/dynamics.md', category: 'reference', subcategory: 'builtins', slug: 'dynamics' },
	{ upstream: 'web/static/docs/reference/builtins/modulation.md', category: 'reference', subcategory: 'builtins', slug: 'modulation' },
	{ upstream: 'web/static/docs/reference/builtins/math.md', category: 'reference', subcategory: 'builtins', slug: 'math' },
	{ upstream: 'web/static/docs/reference/builtins/sequencing.md', category: 'reference', subcategory: 'builtins', slug: 'sequencing' },
	{ upstream: 'web/static/docs/reference/builtins/stereo.md', category: 'reference', subcategory: 'builtins', slug: 'stereo' },
	{ upstream: 'web/static/docs/reference/builtins/utility.md', category: 'reference', subcategory: 'builtins', slug: 'utility' },
	{ upstream: 'web/static/docs/reference/builtins/visualizations.md', category: 'reference', subcategory: 'builtins', slug: 'visualizations' },
	// reference / language (4)
	{ upstream: 'web/static/docs/reference/language/pipes.md', category: 'reference', subcategory: 'language', slug: 'pipes' },
	{ upstream: 'web/static/docs/reference/language/operators.md', category: 'reference', subcategory: 'language', slug: 'operators' },
	{ upstream: 'web/static/docs/reference/language/variables.md', category: 'reference', subcategory: 'language', slug: 'variables' },
	{ upstream: 'web/static/docs/reference/language/closures.md', category: 'reference', subcategory: 'language', slug: 'closures' },
	// reference / mini-notation (2)
	{ upstream: 'web/static/docs/reference/mini-notation/basics.md', category: 'reference', subcategory: 'mini-notation', slug: 'basics' },
	{ upstream: 'web/static/docs/reference/mini-notation/microtonal.md', category: 'reference', subcategory: 'mini-notation', slug: 'microtonal' },
	// tutorials (5) — slug strips the numeric `NN-` prefix upstream uses for ordering
	{ upstream: 'web/static/docs/tutorials/01-hello-sine.md', category: 'tutorials', subcategory: '', slug: 'hello-sine' },
	{ upstream: 'web/static/docs/tutorials/02-filters.md', category: 'tutorials', subcategory: '', slug: 'filters' },
	{ upstream: 'web/static/docs/tutorials/03-synthesis.md', category: 'tutorials', subcategory: '', slug: 'synthesis' },
	{ upstream: 'web/static/docs/tutorials/04-rhythm.md', category: 'tutorials', subcategory: '', slug: 'rhythm' },
	{ upstream: 'web/static/docs/tutorials/05-testing-progression.md', category: 'tutorials', subcategory: '', slug: 'testing-progression' }
];

export const MIRROR_BASE_URL =
	process.env.MIRROR_BASE_URL ?? 'https://raw.githubusercontent.com/mlaass/nkido/master';

export function routePath(entry: MirrorEntry): string {
	if (entry.subcategory) {
		return `src/routes/docs/${entry.category}/${entry.subcategory}/${entry.slug}`;
	}
	return `src/routes/docs/${entry.category}/${entry.slug}`;
}

export function urlPath(entry: MirrorEntry): string {
	if (entry.subcategory) {
		return `/docs/${entry.category}/${entry.subcategory}/${entry.slug}`;
	}
	return `/docs/${entry.category}/${entry.slug}`;
}

export function fallbackPath(entry: MirrorEntry): string {
	return `static/_mirror-fallback/${entry.upstream}`;
}
