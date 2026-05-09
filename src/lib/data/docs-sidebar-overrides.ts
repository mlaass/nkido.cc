/**
 * Hand-curated overrides for sidebar tree generation.
 *
 * The manifest is the source of truth for entries and their subgroups; this
 * file controls the visual order of top-level Reference groups and sub-groups
 * within each. Top-groups and sub-groups not listed here are appended at the
 * end alphabetically with a build warning (tolerant build, per the v2
 * overview-grid pattern).
 *
 * Iterate the lists below once `bun run scripts/build-sidebar.ts` starts
 * warning about slugs that don't appear in the manifest, or vice versa.
 */

export const referenceTopOrder: string[] = [
	'builtins',
	'language',
	'mini-notation',
	'pattern'
];

export const referenceTopLabels: Record<string, string> = {
	builtins: 'Builtins',
	language: 'Language',
	'mini-notation': 'Mini-notation',
	pattern: 'Pattern'
};

export type SubgroupOverride = { slug: string; label: string };

export const subgroupOrder: Record<string, SubgroupOverride[]> = {
	// Order mirrors the v2 overview grid's reading flow: instruments → effects
	// → sequencing → visualizations → tools. Slugs and labels match what the
	// manifest emits today; visualizations entries currently ship with no
	// `subgroup`, so build-sidebar falls back to `group: visualizations`.
	builtins: [
		{ slug: 'synthesis', label: 'Synthesis' },
		{ slug: 'sample-based', label: 'Sample-based' },
		{ slug: 'frequency', label: 'Frequency' },
		{ slug: 'time-based', label: 'Time-based' },
		{ slug: 'nonlinear', label: 'Nonlinear' },
		{ slug: 'dynamics', label: 'Dynamics' },
		{ slug: 'timing', label: 'Timing' },
		{ slug: 'voicing', label: 'Voicing' },
		{ slug: 'visualizations', label: 'Visualizations' },
		{ slug: 'audio-plumbing', label: 'Audio plumbing' },
		{ slug: 'state-io', label: 'State & I/O' },
		{ slug: 'math', label: 'Math' }
	],
	language: [
		{ slug: 'syntax', label: 'Syntax' },
		{ slug: 'data', label: 'Data' }
	],
	'mini-notation': [{ slug: 'patterns', label: 'Patterns' }],
	pattern: []
};
