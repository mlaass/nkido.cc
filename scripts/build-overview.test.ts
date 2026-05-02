import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildOverview } from './build-overview';

type Manifest = Parameters<typeof buildOverview>[0];

function manifestEntry(overrides: Partial<{
	title: string;
	description: string;
	slug: string;
	order: number;
	keywords: string[];
	headings: string[];
	url: string;
}>): Manifest['entries'][string][number] {
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
	} as Manifest['entries'][string][number];
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

	it('omits a card when its slug is missing from the manifest, and warns', () => {
		const overview = buildOverview(emptyManifest(), { warn });
		const instruments = overview.groups.find((g) => g.id === 'instruments')!;

		// All five instrument slugs are missing → 0 cards in the group.
		expect(instruments.cards).toEqual([]);
		expect(warnings.some((w) => w.includes("missing manifest entry for slug 'oscillators'"))).toBe(true);
	});

	it('emits exactly 5 chips in keyword order when all chips resolve', () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			manifestEntry({
				slug: 'filters',
				title: 'Filters',
				description: 'desc',
				order: 2,
				keywords: ['lp', 'hp', 'bp', 'moog', 'sallenkey', 'extra'],
				headings: ['lp', 'hp', 'bp', 'moog', 'sallenkey'],
				url: '/docs/reference/builtins/filters'
			})
		);

		const overview = buildOverview(m, { warn });
		const card = overview.groups
			.find((g) => g.id === 'effects')!
			.cards.find((c) => c.slug === 'filters')!;

		expect(card.chips).toHaveLength(5);
		expect(card.chips.map((c) => c.keyword)).toEqual(['lp', 'hp', 'bp', 'moog', 'sallenkey']);
		expect(card.chips[0]).toEqual({
			keyword: 'lp',
			anchor: 'lp',
			href: '/docs/reference/builtins/filters#lp'
		});
	});

	it('drops keywords whose slugified form does not match a heading, and warns', () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			manifestEntry({
				slug: 'filters',
				title: 'Filters',
				keywords: ['lp', 'NOT-A-HEADING', 'hp', 'ALSO-MISSING', 'bp'],
				headings: ['lp', 'hp', 'bp']
			})
		);

		const overview = buildOverview(m, { warn });
		const card = overview.groups
			.find((g) => g.id === 'effects')!
			.cards.find((c) => c.slug === 'filters')!;

		expect(card.chips.map((c) => c.keyword)).toEqual(['lp', 'hp', 'bp']);
		expect(warnings.filter((w) => w.includes('has no matching heading')).length).toBe(2);
	});

	it('sorts cards within a group by manifest order, ties broken by slug', () => {
		const m = emptyManifest();
		// Both effects, both order 99, slugs sort as: delays < distortion < dynamics.
		m.entries['reference/builtins'].push(
			manifestEntry({ slug: 'distortion', order: 99 }),
			manifestEntry({ slug: 'delays', order: 99 }),
			manifestEntry({ slug: 'dynamics', order: 99 })
		);

		const overview = buildOverview(m, { warn });
		const slugs = overview.groups
			.find((g) => g.id === 'effects')!
			.cards.map((c) => c.slug);

		// Other Effects slugs are missing — only these three render.
		expect(slugs).toEqual(['delays', 'distortion', 'dynamics']);
	});

	it('skips manifest entries whose slug is not in GROUP_MAPPING', () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			manifestEntry({ slug: 'tutorials-hello-sine' }),
			manifestEntry({ slug: 'unknown-builtin' })
		);

		const overview = buildOverview(m, { warn });
		const allSlugs = overview.groups.flatMap((g) => g.cards.map((c) => c.slug));

		expect(allSlugs).not.toContain('tutorials-hello-sine');
		expect(allSlugs).not.toContain('unknown-builtin');
		// No warning for these — they're filtered at the GROUP_MAPPING step,
		// not the missing-entry step.
		expect(warnings.some((w) => w.includes('tutorials-hello-sine'))).toBe(false);
	});

	it('renders a group with empty cards when every slug in it is missing', () => {
		const overview = buildOverview(emptyManifest(), { warn: () => {} });
		const visualizations = overview.groups.find((g) => g.id === 'visualizations')!;

		expect(visualizations.cards).toEqual([]);
		expect(visualizations.heading).toBe('Visualizations');
	});

	it('emits no chips when keywords is empty, without warning', () => {
		const m = emptyManifest();
		m.entries['reference/builtins'].push(
			manifestEntry({ slug: 'filters', keywords: [], headings: ['lp', 'hp'] })
		);

		const overview = buildOverview(m, { warn });
		const card = overview.groups
			.find((g) => g.id === 'effects')!
			.cards.find((c) => c.slug === 'filters')!;

		expect(card.chips).toEqual([]);
	});

	it('returns groups in the canonical order regardless of manifest insertion', () => {
		const overview = buildOverview(emptyManifest(), { warn: () => {} });
		expect(overview.groups.map((g) => g.id)).toEqual([
			'instruments',
			'effects',
			'sequencing',
			'visualizations',
			'language',
			'tools'
		]);
	});
});
