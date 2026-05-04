import { describe, it, expect, beforeEach } from 'vitest';
import { buildOverview } from './build-overview';

type Manifest = Parameters<typeof buildOverview>[0];
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
			'reference/builtins': [],
			'reference/language': [],
			'reference/mini-notation': []
		}
	};
}

describe('buildOverview', () => {
	let warnings: string[];
	let warn: (msg: string) => void;

	beforeEach(() => {
		warnings = [];
		warn = (msg) => warnings.push(msg);
	});

	it('emits one card from an atomic doc (no subfeatures, doc-level tagline)', async () => {
		const m = emptyManifest();
		m.entries['reference/language'].push(
			entry({
				slug: 'pipes',
				title: 'Pipes',
				url: '/docs/reference/language/pipes',
				group: 'language',
				subgroup: 'syntax',
				icon: 'Plug',
				tagline: 'Forward composition.'
			})
		);

		const overview = await buildOverview(m, { warn });
		const cards = overview.groups
			.find((g) => g.id === 'language')!
			.subgroups.find((s) => s.id === 'syntax')!.cards;

		expect(cards).toHaveLength(1);
		expect(cards[0].name).toBe('Pipes');
		expect(cards[0].tagline).toBe('Forward composition.');
		expect(cards[0].url).toBe('/docs/reference/language/pipes');
		expect(cards[0].icon).toBe('Plug');
		expect(cards[0].source.anchor).toBeUndefined();
		expect(cards[0].source.anchorMatched).toBe(true);
		expect(cards[0].snippet).toBeUndefined();
	});

	it('emits N cards for a sub-feature doc, each with a fragment URL', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({
				slug: 'filters',
				title: 'Filters',
				url: '/docs/reference/builtins/filters',
				order: 2,
				group: 'effects',
				subgroup: 'frequency',
				icon: 'Sliders',
				headings: ['lp', 'hp', 'bp'],
				subfeatures: [
					{ name: 'Lowpass', anchor: 'lp', tagline: 'Resonant low-pass.' },
					{ name: 'Highpass', anchor: 'hp', tagline: 'High-pass.' },
					{ name: 'Bandpass', anchor: 'bp', tagline: 'Band-pass.' }
				]
			})
		);

		const overview = await buildOverview(m, { warn });
		const cards = overview.groups
			.find((g) => g.id === 'effects')!
			.subgroups.find((s) => s.id === 'frequency')!.cards;

		expect(cards.map((c) => c.name)).toEqual(['Lowpass', 'Highpass', 'Bandpass']);
		expect(cards[0].url).toBe('/docs/reference/builtins/filters#lp');
		expect(cards.every((c) => c.icon === 'Sliders')).toBe(true);
		expect(cards.every((c) => c.source.anchorMatched)).toBe(true);
	});

	it('orders mixed sub-feature cards in a sub-group by doc order then array index', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({
				slug: 'envelopes',
				title: 'Envelopes',
				url: '/docs/reference/builtins/envelopes',
				order: 4, // higher → should appear after filters
				group: 'effects',
				subgroup: 'frequency',
				icon: 'Activity',
				headings: ['adsr', 'ar'],
				subfeatures: [
					{ name: 'ADSR', anchor: 'adsr', tagline: 'ADSR.' },
					{ name: 'AR', anchor: 'ar', tagline: 'AR.' }
				]
			}),
			entry({
				slug: 'filters',
				title: 'Filters',
				url: '/docs/reference/builtins/filters',
				order: 2,
				group: 'effects',
				subgroup: 'frequency',
				icon: 'Sliders',
				headings: ['lp', 'hp'],
				subfeatures: [
					{ name: 'Lowpass', anchor: 'lp', tagline: 'LP.' },
					{ name: 'Highpass', anchor: 'hp', tagline: 'HP.' }
				]
			})
		);

		const overview = await buildOverview(m, { warn });
		const cards = overview.groups
			.find((g) => g.id === 'effects')!
			.subgroups.find((s) => s.id === 'frequency')!.cards;

		// filters (order 2) before envelopes (order 4); within each, array order preserved.
		expect(cards.map((c) => c.name)).toEqual(['Lowpass', 'Highpass', 'ADSR', 'AR']);
	});

	it('skips a doc that has neither group nor any other v2 fields (silent skip)', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(entry({ slug: 'unknown' }));

		const overview = await buildOverview(m, { warn });
		const allCardNames = overview.groups.flatMap((g) =>
			g.subgroups.flatMap((sg) => sg.cards.map((c) => c.name))
		);

		expect(allCardNames).toEqual([]);
		// Missing group is the most common transient state; it shouldn't spam logs.
		expect(warnings.length).toBe(0);
	});

	it('warns and skips a doc whose group is not one of the 6 known IDs', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({ slug: 'weird', group: 'unknown-group', tagline: 'X.' })
		);

		const overview = await buildOverview(m, { warn });
		expect(overview.groups).toEqual([]);
		expect(warnings.some((w) => w.includes("unknown group 'unknown-group'"))).toBe(true);
	});

	it('warns and skips a doc missing subgroup for a non-flat group', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({ slug: 'orphan', group: 'effects', tagline: 'No subgroup.' })
		);

		const overview = await buildOverview(m, { warn });
		expect(overview.groups).toEqual([]);
		expect(warnings.some((w) => w.includes("missing 'subgroup' for non-flat group"))).toBe(true);
	});

	it('warns and skips a doc with no subfeatures and no tagline', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({ slug: 'bare', group: 'effects', subgroup: 'frequency' })
		);

		const overview = await buildOverview(m, { warn });
		expect(overview.groups).toEqual([]);
		expect(warnings.some((w) => w.includes('neither subfeatures nor tagline'))).toBe(true);
	});

	it('warns on anchor mismatch but ships the card with anchorMatched: false', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({
				slug: 'filters',
				url: '/docs/reference/builtins/filters',
				group: 'effects',
				subgroup: 'frequency',
				icon: 'Sliders',
				headings: ['lp'], // hp missing
				subfeatures: [
					{ name: 'Lowpass', anchor: 'lp', tagline: 'LP.' },
					{ name: 'Highpass', anchor: 'hp', tagline: 'HP.' }
				]
			})
		);

		const overview = await buildOverview(m, { warn });
		const cards = overview.groups[0].subgroups[0].cards;

		expect(cards).toHaveLength(2);
		expect(cards[0].source.anchorMatched).toBe(true);
		expect(cards[1].source.anchorMatched).toBe(false);
		expect(cards[1].url).toBe('/docs/reference/builtins/filters#hp');
		expect(warnings.some((w) => w.includes("anchors to '#hp'"))).toBe(true);
	});

	it('falls back to Box for an unknown icon, with warning', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({
				slug: 'pipes',
				url: '/docs/reference/language/pipes',
				group: 'language',
				subgroup: 'syntax',
				icon: 'NotALucideIcon',
				tagline: 'A doc.'
			})
		);

		const overview = await buildOverview(m, { warn });
		const card = overview.groups[0].subgroups[0].cards[0];

		expect(card.icon).toBe('Box');
		expect(warnings.some((w) => w.includes("unknown icon 'NotALucideIcon'"))).toBe(true);
	});

	it('orders subgroups within a group by lowest contributor order', async () => {
		const m = emptyManifest();
		// Voicing first contributor: order 18
		m.entries['reference/builtins'].push(
			entry({
				slug: 'polyphony',
				url: '/docs/reference/builtins/polyphony',
				order: 18,
				group: 'sequencing',
				subgroup: 'voicing',
				icon: 'Layers',
				tagline: 'Voicing.'
			})
		);
		// Timing first contributor: order 4
		m.entries['reference/builtins'].push(
			entry({
				slug: 'sequencing',
				url: '/docs/reference/builtins/sequencing',
				order: 4,
				group: 'sequencing',
				subgroup: 'timing',
				icon: 'ListMusic',
				tagline: 'Timing.'
			})
		);

		const overview = await buildOverview(m, { warn });
		const subgroupIds = overview.groups
			.find((g) => g.id === 'sequencing')!
			.subgroups.map((s) => s.id);

		expect(subgroupIds).toEqual(['timing', 'voicing']);
	});

	it('omits a top-level group entirely when no docs contribute', async () => {
		const overview = await buildOverview(emptyManifest(), { warn });
		expect(overview.groups).toEqual([]);
	});

	it('preserves canonical top-level group order when all six are populated', async () => {
		const m = emptyManifest();
		const minimal = (slug: string, group: string, subgroup?: string) =>
			entry({
				slug,
				url: `/docs/${slug}`,
				group,
				...(subgroup ? { subgroup } : {}),
				icon: 'Box',
				tagline: 'X.'
			});
		m.entries['reference/builtins'].push(
			minimal('language-doc', 'language', 'syntax'),
			minimal('tools-doc', 'tools', 'math'),
			minimal('viz-doc', 'visualizations'),
			minimal('inst-doc', 'instruments', 'synthesis'),
			minimal('seq-doc', 'sequencing', 'patterns'),
			minimal('eff-doc', 'effects', 'frequency')
		);

		const overview = await buildOverview(m, { warn });
		expect(overview.groups.map((g) => g.id)).toEqual([
			'instruments',
			'effects',
			'sequencing',
			'visualizations',
			'language',
			'tools'
		]);
	});

	it('preserves snippet on cards when present, omits the field when absent', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({
				slug: 'distortion',
				url: '/docs/reference/builtins/distortion',
				group: 'effects',
				subgroup: 'nonlinear',
				icon: 'Zap',
				headings: ['saturate', 'tube'],
				subfeatures: [
					{ name: 'Saturate', anchor: 'saturate', tagline: 'S.', snippet: 'saw -> saturate' },
					{ name: 'Tube', anchor: 'tube', tagline: 'T.' }
				]
			})
		);

		// No highlighter passed → snippet kept as raw string, snippetHtml undefined.
		const overview = await buildOverview(m, { warn });
		const cards = overview.groups[0].subgroups[0].cards;

		expect(cards[0].snippet).toBe('saw -> saturate');
		expect(cards[0].snippetHtml).toBeUndefined();
		expect(cards[1].snippet).toBeUndefined();
	});

	it('respects per-subfeature icon override', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({
				slug: 'distortion',
				url: '/docs/reference/builtins/distortion',
				group: 'effects',
				subgroup: 'nonlinear',
				icon: 'Zap',
				headings: ['bitcrush', 'tube'],
				subfeatures: [
					{ name: 'Bitcrush', anchor: 'bitcrush', tagline: 'B.', icon: 'Binary' },
					{ name: 'Tube', anchor: 'tube', tagline: 'T.' } // inherits doc icon
				]
			})
		);

		const overview = await buildOverview(m, { warn });
		const cards = overview.groups[0].subgroups[0].cards;

		expect(cards[0].icon).toBe('Binary');
		expect(cards[1].icon).toBe('Zap');
	});

	it('renders a flat group as a single implicit subgroup with the group heading', async () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			entry({
				slug: 'oscilloscope',
				title: 'Oscilloscope',
				url: '/docs/reference/builtins/oscilloscope',
				group: 'visualizations',
				icon: 'LineChart',
				tagline: 'Scope.'
			})
		);

		const overview = await buildOverview(m, { warn });
		const visualizations = overview.groups.find((g) => g.id === 'visualizations')!;

		expect(visualizations.subgroups).toHaveLength(1);
		expect(visualizations.subgroups[0].id).toBe('visualizations');
		expect(visualizations.subgroups[0].cards[0].name).toBe('Oscilloscope');
	});
});
