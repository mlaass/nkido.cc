import { describe, it, expect, beforeEach } from 'vitest';
import { buildSidebar, type Manifest } from './build-sidebar';

type ManifestEntry = Manifest['entries'][string][number];

function entry(overrides: Partial<ManifestEntry>): ManifestEntry {
	return {
		title: 'Title',
		description: 'Description',
		slug: 'slug',
		order: 1,
		keywords: [],
		headings: [],
		url: '/docs/reference/builtins/slug',
		source: 'live',
		...overrides
	} as ManifestEntry;
}

function emptyManifest(): Manifest {
	return {
		generatedAt: '2026-01-01T00:00:00.000Z',
		entries: {
			concepts: [],
			tutorials: [],
			'reference/builtins': [],
			'reference/language': [],
			'reference/mini-notation': []
		}
	};
}

describe('buildSidebar', () => {
	let warnings: string[];
	let warn: (msg: string) => void;

	beforeEach(() => {
		warnings = [];
		warn = (msg) => warnings.push(msg);
	});

	it('emits a flat list for concepts ordered by frontmatter order', () => {
		const m = emptyManifest();
		m.entries.concepts.push(
			entry({ slug: 'mini-notation', title: 'Mini-notation', url: '/docs/concepts/mini-notation', order: 3 }),
			entry({ slug: 'signals', title: 'Signals and DAGs', url: '/docs/concepts/signals', order: 1 }),
			entry({ slug: 'hot-swap', title: 'Hot-swap explained', url: '/docs/concepts/hot-swap', order: 2 })
		);

		const sidebar = buildSidebar(m, { warn });

		expect(sidebar.tree.concepts.map((e) => e.slug)).toEqual(['signals', 'hot-swap', 'mini-notation']);
		expect(sidebar.tree.concepts[0].title).toBe('Signals and DAGs');
		expect(sidebar.tree.concepts[0].url).toBe('/docs/concepts/signals');
		expect(warnings).toEqual([]);
	});

	it('emits a flat list for tutorials ordered by frontmatter order', () => {
		const m = emptyManifest();
		m.entries.tutorials.push(
			entry({ slug: 'rhythm', title: 'Rhythm', url: '/docs/tutorials/rhythm', order: 4 }),
			entry({ slug: 'hello-sine', title: 'Hello Sine', url: '/docs/tutorials/hello-sine', order: 1 }),
			entry({ slug: 'filters', title: 'Filters', url: '/docs/tutorials/filters', order: 2 })
		);

		const sidebar = buildSidebar(m, { warn });

		expect(sidebar.tree.tutorials.map((e) => e.slug)).toEqual(['hello-sine', 'filters', 'rhythm']);
		expect(warnings).toEqual([]);
	});

	it('buckets reference entries by manifest subgroup, in override order', () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({ slug: 'oscillators', title: 'Oscillators', url: '/docs/reference/builtins/oscillators', order: 1, subgroup: 'synthesis' }),
			entry({ slug: 'filters', title: 'Filters', url: '/docs/reference/builtins/filters', order: 6, subgroup: 'frequency' }),
			entry({ slug: 'distortion', title: 'Distortion', url: '/docs/reference/builtins/distortion', order: 10, subgroup: 'nonlinear' }),
			entry({ slug: 'fm-synthesis', title: 'FM synthesis', url: '/docs/reference/builtins/fm-synthesis', order: 2, subgroup: 'synthesis' })
		);

		const sidebar = buildSidebar(m, { warn });
		const builtins = sidebar.tree.reference.builtins;

		// Override order: synthesis → frequency → ... → nonlinear
		const slugs = builtins.map((sg) => sg.slug);
		expect(slugs).toEqual(['synthesis', 'frequency', 'nonlinear']);

		// Within synthesis: by order then slug
		const synthesis = builtins.find((sg) => sg.slug === 'synthesis')!;
		expect(synthesis.entries.map((e) => e.slug)).toEqual(['oscillators', 'fm-synthesis']);
		expect(synthesis.label).toBe('Synthesis');
		expect(warnings).toEqual([]);
	});

	it('buckets a missing-subgroup entry into "misc" with a warning', () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({ slug: 'orphan', url: '/docs/reference/builtins/orphan' })
			// no subgroup
		);

		const sidebar = buildSidebar(m, { warn });
		const builtins = sidebar.tree.reference.builtins;

		expect(builtins.length).toBe(1);
		expect(builtins[0].slug).toBe('misc');
		expect(builtins[0].label).toBe('Misc');
		expect(builtins[0].entries.map((e) => e.slug)).toEqual(['orphan']);
		expect(warnings.some((w) => w.includes("'orphan' has no subgroup"))).toBe(true);
	});

	it('appends an unknown subgroup at the end with a warning', () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({ slug: 'oscillators', url: '/docs/reference/builtins/oscillators', order: 1, subgroup: 'synthesis' }),
			entry({ slug: 'experimental', url: '/docs/reference/builtins/experimental', order: 2, subgroup: 'wibbly-wobbly' })
		);

		const sidebar = buildSidebar(m, { warn });
		const slugs = sidebar.tree.reference.builtins.map((sg) => sg.slug);

		// 'wibbly-wobbly' is unknown — appears after all known subgroups, label title-cased
		expect(slugs).toEqual(['synthesis', 'wibbly-wobbly']);
		const unknown = sidebar.tree.reference.builtins[1];
		expect(unknown.label).toBe('Wibbly Wobbly');
		expect(warnings.some((w) => w.includes("subgroup 'wibbly-wobbly' not in override"))).toBe(true);
	});

	it('language and mini-notation fall back to single-bucket subgroups', () => {
		const m = emptyManifest();
		m.entries['reference/language'].push(
			entry({ slug: 'pipes', url: '/docs/reference/language/pipes', order: 1, subgroup: 'syntax' }),
			entry({ slug: 'operators', url: '/docs/reference/language/operators', order: 2, subgroup: 'syntax' })
		);
		m.entries['reference/mini-notation'].push(
			entry({ slug: 'basics', url: '/docs/reference/mini-notation/basics', order: 1, subgroup: 'patterns' }),
			entry({ slug: 'chords', url: '/docs/reference/mini-notation/chords', order: 2, subgroup: 'patterns' })
		);

		const sidebar = buildSidebar(m, { warn });

		expect(sidebar.tree.reference.language.length).toBe(1);
		expect(sidebar.tree.reference.language[0].slug).toBe('syntax');
		expect(sidebar.tree.reference.language[0].entries.map((e) => e.slug)).toEqual(['pipes', 'operators']);

		expect(sidebar.tree.reference['mini-notation'].length).toBe(1);
		expect(sidebar.tree.reference['mini-notation'][0].slug).toBe('patterns');
		expect(sidebar.tree.reference['mini-notation'][0].entries.map((e) => e.slug)).toEqual(['basics', 'chords']);
		expect(warnings).toEqual([]);
	});

	it('breaks order ties by slug and warns about the collision', () => {
		const m = emptyManifest();
		m.entries.tutorials.push(
			entry({ slug: 'beta', url: '/docs/tutorials/beta', order: 5 }),
			entry({ slug: 'alpha', url: '/docs/tutorials/alpha', order: 5 })
		);

		const sidebar = buildSidebar(m, { warn });

		expect(sidebar.tree.tutorials.map((e) => e.slug)).toEqual(['alpha', 'beta']);
		expect(warnings.some((w) => w.includes('order 5 shared'))).toBe(true);
	});

	it('emits empty arrays when manifest sections are absent', () => {
		const m: Manifest = { generatedAt: '2026-01-01T00:00:00.000Z', entries: {} };
		const sidebar = buildSidebar(m, { warn });

		expect(sidebar.tree.concepts).toEqual([]);
		expect(sidebar.tree.tutorials).toEqual([]);
		expect(sidebar.tree.reference.builtins).toEqual([]);
		expect(sidebar.tree.reference.language).toEqual([]);
		expect(sidebar.tree.reference['mini-notation']).toEqual([]);
		expect(warnings).toEqual([]);
	});

	it('exposes referenceTopOrder and referenceTopLabels for the consumer', () => {
		const sidebar = buildSidebar(emptyManifest(), { warn });
		expect(sidebar.referenceTopOrder).toEqual(['builtins', 'language', 'mini-notation']);
		expect(sidebar.referenceTopLabels.builtins).toBe('Builtins');
		expect(sidebar.referenceTopLabels['mini-notation']).toBe('Mini-notation');
	});
});
