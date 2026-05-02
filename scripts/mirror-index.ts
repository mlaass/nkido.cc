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
	// reference / builtins (25)
	{ upstream: 'web/static/docs/reference/builtins/oscillators.md', category: 'reference', subcategory: 'builtins', slug: 'oscillators' },
	{ upstream: 'web/static/docs/reference/builtins/fm-synthesis.md', category: 'reference', subcategory: 'builtins', slug: 'fm-synthesis' },
	{ upstream: 'web/static/docs/reference/builtins/samplers.md', category: 'reference', subcategory: 'builtins', slug: 'samplers' },
	{ upstream: 'web/static/docs/reference/builtins/soundfonts.md', category: 'reference', subcategory: 'builtins', slug: 'soundfonts' },
	{ upstream: 'web/static/docs/reference/builtins/samples-loading.md', category: 'reference', subcategory: 'builtins', slug: 'samples-loading' },
	{ upstream: 'web/static/docs/reference/builtins/filters.md', category: 'reference', subcategory: 'builtins', slug: 'filters' },
	{ upstream: 'web/static/docs/reference/builtins/envelopes.md', category: 'reference', subcategory: 'builtins', slug: 'envelopes' },
	{ upstream: 'web/static/docs/reference/builtins/delays.md', category: 'reference', subcategory: 'builtins', slug: 'delays' },
	{ upstream: 'web/static/docs/reference/builtins/reverbs.md', category: 'reference', subcategory: 'builtins', slug: 'reverbs' },
	{ upstream: 'web/static/docs/reference/builtins/distortion.md', category: 'reference', subcategory: 'builtins', slug: 'distortion' },
	{ upstream: 'web/static/docs/reference/builtins/dynamics.md', category: 'reference', subcategory: 'builtins', slug: 'dynamics' },
	{ upstream: 'web/static/docs/reference/builtins/modulation.md', category: 'reference', subcategory: 'builtins', slug: 'modulation' },
	{ upstream: 'web/static/docs/reference/builtins/math.md', category: 'reference', subcategory: 'builtins', slug: 'math' },
	{ upstream: 'web/static/docs/reference/builtins/sequencing.md', category: 'reference', subcategory: 'builtins', slug: 'sequencing' },
	{ upstream: 'web/static/docs/reference/builtins/polyphony.md', category: 'reference', subcategory: 'builtins', slug: 'polyphony' },
	{ upstream: 'web/static/docs/reference/builtins/timelines.md', category: 'reference', subcategory: 'builtins', slug: 'timelines' },
	{ upstream: 'web/static/docs/reference/builtins/stereo.md', category: 'reference', subcategory: 'builtins', slug: 'stereo' },
	{ upstream: 'web/static/docs/reference/builtins/utility.md', category: 'reference', subcategory: 'builtins', slug: 'utility' },
	{ upstream: 'web/static/docs/reference/builtins/state.md', category: 'reference', subcategory: 'builtins', slug: 'state' },
	{ upstream: 'web/static/docs/reference/builtins/edge.md', category: 'reference', subcategory: 'builtins', slug: 'edge' },
	{ upstream: 'web/static/docs/reference/builtins/audio-input.md', category: 'reference', subcategory: 'builtins', slug: 'audio-input' },
	{ upstream: 'web/static/docs/reference/builtins/visualizations.md', category: 'reference', subcategory: 'builtins', slug: 'visualizations' },
	{ upstream: 'web/static/docs/reference/builtins/oscilloscope.md', category: 'reference', subcategory: 'builtins', slug: 'oscilloscope' },
	{ upstream: 'web/static/docs/reference/builtins/waveform.md', category: 'reference', subcategory: 'builtins', slug: 'waveform' },
	{ upstream: 'web/static/docs/reference/builtins/spectrum.md', category: 'reference', subcategory: 'builtins', slug: 'spectrum' },
	{ upstream: 'web/static/docs/reference/builtins/waterfall.md', category: 'reference', subcategory: 'builtins', slug: 'waterfall' },
	{ upstream: 'web/static/docs/reference/builtins/pianoroll.md', category: 'reference', subcategory: 'builtins', slug: 'pianoroll' },
	// reference / language (7)
	{ upstream: 'web/static/docs/reference/language/pipes.md', category: 'reference', subcategory: 'language', slug: 'pipes' },
	{ upstream: 'web/static/docs/reference/language/operators.md', category: 'reference', subcategory: 'language', slug: 'operators' },
	{ upstream: 'web/static/docs/reference/language/variables.md', category: 'reference', subcategory: 'language', slug: 'variables' },
	{ upstream: 'web/static/docs/reference/language/closures.md', category: 'reference', subcategory: 'language', slug: 'closures' },
	{ upstream: 'web/static/docs/reference/language/conditionals.md', category: 'reference', subcategory: 'language', slug: 'conditionals' },
	{ upstream: 'web/static/docs/reference/language/methods.md', category: 'reference', subcategory: 'language', slug: 'methods' },
	{ upstream: 'web/static/docs/reference/language/arrays.md', category: 'reference', subcategory: 'language', slug: 'arrays' },
	// reference / mini-notation (3)
	{ upstream: 'web/static/docs/reference/mini-notation/basics.md', category: 'reference', subcategory: 'mini-notation', slug: 'basics' },
	{ upstream: 'web/static/docs/reference/mini-notation/microtonal.md', category: 'reference', subcategory: 'mini-notation', slug: 'microtonal' },
	{ upstream: 'web/static/docs/reference/mini-notation/chords.md', category: 'reference', subcategory: 'mini-notation', slug: 'chords' },
	// tutorials (5) — slug strips the numeric `NN-` prefix upstream uses for ordering
	{ upstream: 'web/static/docs/tutorials/01-hello-sine.md', category: 'tutorials', subcategory: '', slug: 'hello-sine' },
	{ upstream: 'web/static/docs/tutorials/02-filters.md', category: 'tutorials', subcategory: '', slug: 'filters' },
	{ upstream: 'web/static/docs/tutorials/03-synthesis.md', category: 'tutorials', subcategory: '', slug: 'synthesis' },
	{ upstream: 'web/static/docs/tutorials/04-rhythm.md', category: 'tutorials', subcategory: '', slug: 'rhythm' },
	{ upstream: 'web/static/docs/tutorials/05-testing-progression.md', category: 'tutorials', subcategory: '', slug: 'testing-progression' }
];

export const MIRROR_BASE_URL =
	process.env.MIRROR_BASE_URL ?? 'https://raw.githubusercontent.com/mlaass/nkido/master';

/**
 * Path to a local clone of the upstream nkido repo. When this directory exists
 * the fetch script reads docs from it directly instead of going to GitHub —
 * faster, and picks up uncommitted edits during local dev. Set MIRROR_NO_LOCAL=1
 * to force the GitHub path (e.g. to test what CI sees).
 */
export const MIRROR_LOCAL_PATH = process.env.MIRROR_LOCAL_PATH ?? '../nkido';
export const MIRROR_NO_LOCAL = process.env.MIRROR_NO_LOCAL === '1';

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
