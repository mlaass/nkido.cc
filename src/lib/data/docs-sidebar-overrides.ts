/**
 * Hand-curated overrides for sidebar tree generation.
 *
 * The manifest is the source of truth for entries and their subgroups; this
 * file controls the visual order of top-level Reference groups and sub-groups
 * within each. Sub-groups not listed here are appended at the end alphabetically
 * with a build warning (tolerant build, per the v2 overview-grid pattern).
 *
 * Iterate `subgroupOrder.builtins` once `bun run scripts/build-sidebar.ts`
 * starts warning about subgroup slugs that don't appear in the manifest, or
 * vice versa. The PRD's tree diagram is illustrative, not authoritative.
 */

export type ReferenceTopGroup = 'builtins' | 'language' | 'mini-notation';

export const referenceTopOrder: ReferenceTopGroup[] = [
	'builtins',
	'language',
	'mini-notation'
];

export const referenceTopLabels: Record<ReferenceTopGroup, string> = {
	builtins: 'Builtins',
	language: 'Language',
	'mini-notation': 'Mini-notation'
};

export type SubgroupOverride = { slug: string; label: string };

export const subgroupOrder: Record<ReferenceTopGroup, SubgroupOverride[]> = {
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
	'mini-notation': [{ slug: 'patterns', label: 'Patterns' }]
};
