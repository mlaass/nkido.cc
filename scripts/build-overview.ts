#!/usr/bin/env bun
/**
 * Build src/lib/data/overview.json from src/lib/data/docs-manifest.json.
 *
 * The OverviewGrid landing-page section consumes overview.json. This script
 * applies a hardcoded group + icon mapping to the manifest, resolves chip
 * anchors against each entry's `headings` field (populated by
 * fetch-mirrored-docs.ts), and emits a sorted, deduped, validated artifact.
 *
 * Cards whose slug is absent from the manifest are silently omitted with a
 * warning. Chips whose keyword does not match a heading are silently dropped.
 * Either way the build never fails — see PRD §10 for the degradation rules.
 *
 * Invoked at the end of fetch-mirrored-docs.ts main() so the two artifacts
 * stay in lockstep, and also as a CLI for local iteration when only the
 * mapping has changed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import GithubSlugger from 'github-slugger';

export type OverviewGroupId = 'instruments' | 'effects' | 'sequencing' | 'visualizations' | 'language' | 'tools';

export type OverviewChip = {
	keyword: string;
	anchor: string;
	href: string;
};

export type OverviewCard = {
	slug: string;
	title: string;
	description: string;
	url: string;
	icon: string;
	chips: OverviewChip[];
};

export type OverviewGroup = {
	id: OverviewGroupId;
	heading: string;
	cards: OverviewCard[];
};

export type Overview = {
	generatedAt: string;
	groups: OverviewGroup[];
};

type ManifestEntry = {
	title: string;
	description: string;
	slug: string;
	order: number;
	keywords: string[];
	headings: string[];
	url: string;
	source: 'live' | 'fallback';
};

type Manifest = {
	generatedAt: string;
	entries: Record<string, ManifestEntry[]>;
};

const GROUPS: { id: OverviewGroupId; heading: string }[] = [
	{ id: 'instruments', heading: 'Instruments' },
	{ id: 'effects', heading: 'Effects' },
	{ id: 'sequencing', heading: 'Sequencing' },
	{ id: 'visualizations', heading: 'Visualizations' },
	{ id: 'language', heading: 'Language' },
	{ id: 'tools', heading: 'Tools' }
];

type GroupRow = {
	group: OverviewGroupId;
	slug: string;
	manifestKey: string; // 'reference/builtins' etc.
	icon: string;
};

/**
 * Hardcoded mapping: for each card, which group it belongs to, which manifest
 * category/subcategory bucket to look it up in, and which Lucide icon to use.
 * Order within a group on the rendered page is determined by the manifest's
 * `order` field (ties broken by slug); the order of rows here is purely
 * cosmetic.
 */
const GROUP_MAPPING: GroupRow[] = [
	// Instruments (5)
	{ group: 'instruments', slug: 'oscillators', manifestKey: 'reference/builtins', icon: 'Waves' },
	{ group: 'instruments', slug: 'fm-synthesis', manifestKey: 'reference/builtins', icon: 'Radio' },
	{ group: 'instruments', slug: 'samplers', manifestKey: 'reference/builtins', icon: 'Drum' },
	{ group: 'instruments', slug: 'soundfonts', manifestKey: 'reference/builtins', icon: 'Piano' },
	{ group: 'instruments', slug: 'samples-loading', manifestKey: 'reference/builtins', icon: 'FolderOpen' },

	// Effects (7)
	{ group: 'effects', slug: 'filters', manifestKey: 'reference/builtins', icon: 'Sliders' },
	{ group: 'effects', slug: 'envelopes', manifestKey: 'reference/builtins', icon: 'Activity' },
	{ group: 'effects', slug: 'delays', manifestKey: 'reference/builtins', icon: 'Repeat2' },
	{ group: 'effects', slug: 'reverbs', manifestKey: 'reference/builtins', icon: 'Wind' },
	{ group: 'effects', slug: 'modulation', manifestKey: 'reference/builtins', icon: 'Wand2' },
	{ group: 'effects', slug: 'distortion', manifestKey: 'reference/builtins', icon: 'Zap' },
	{ group: 'effects', slug: 'dynamics', manifestKey: 'reference/builtins', icon: 'Gauge' },

	// Sequencing (6)
	{ group: 'sequencing', slug: 'sequencing', manifestKey: 'reference/builtins', icon: 'ListMusic' },
	{ group: 'sequencing', slug: 'polyphony', manifestKey: 'reference/builtins', icon: 'Layers' },
	{ group: 'sequencing', slug: 'timelines', manifestKey: 'reference/builtins', icon: 'Clock' },
	{ group: 'sequencing', slug: 'basics', manifestKey: 'reference/mini-notation', icon: 'Music' },
	{ group: 'sequencing', slug: 'microtonal', manifestKey: 'reference/mini-notation', icon: 'KeyRound' },
	{ group: 'sequencing', slug: 'chords', manifestKey: 'reference/mini-notation', icon: 'Music2' },

	// Visualizations (5)
	{ group: 'visualizations', slug: 'oscilloscope', manifestKey: 'reference/builtins', icon: 'LineChart' },
	{ group: 'visualizations', slug: 'waveform', manifestKey: 'reference/builtins', icon: 'AudioWaveform' },
	{ group: 'visualizations', slug: 'spectrum', manifestKey: 'reference/builtins', icon: 'BarChart' },
	{ group: 'visualizations', slug: 'waterfall', manifestKey: 'reference/builtins', icon: 'AreaChart' },
	{ group: 'visualizations', slug: 'pianoroll', manifestKey: 'reference/builtins', icon: 'Grid3x3' },

	// Language (7)
	{ group: 'language', slug: 'pipes', manifestKey: 'reference/language', icon: 'Plug' },
	{ group: 'language', slug: 'variables', manifestKey: 'reference/language', icon: 'Variable' },
	{ group: 'language', slug: 'operators', manifestKey: 'reference/language', icon: 'Calculator' },
	{ group: 'language', slug: 'closures', manifestKey: 'reference/language', icon: 'Parentheses' },
	{ group: 'language', slug: 'arrays', manifestKey: 'reference/language', icon: 'Brackets' },
	{ group: 'language', slug: 'methods', manifestKey: 'reference/language', icon: 'Workflow' },
	{ group: 'language', slug: 'conditionals', manifestKey: 'reference/language', icon: 'GitBranch' },

	// Tools (6)
	{ group: 'tools', slug: 'math', manifestKey: 'reference/builtins', icon: 'Sigma' },
	{ group: 'tools', slug: 'utility', manifestKey: 'reference/builtins', icon: 'Wrench' },
	{ group: 'tools', slug: 'state', manifestKey: 'reference/builtins', icon: 'Database' },
	{ group: 'tools', slug: 'edge', manifestKey: 'reference/builtins', icon: 'Triangle' },
	{ group: 'tools', slug: 'stereo', manifestKey: 'reference/builtins', icon: 'Headphones' },
	{ group: 'tools', slug: 'audio-input', manifestKey: 'reference/builtins', icon: 'Mic' }
];

const MAX_CHIPS_PER_CARD = 5;

export function buildOverview(manifest: Manifest, options: { warn?: (msg: string) => void } = {}): Overview {
	const warn = options.warn ?? ((msg: string) => console.warn(msg));
	const slugger = new GithubSlugger();

	const groupMap = new Map<OverviewGroupId, OverviewCard[]>();
	for (const g of GROUPS) groupMap.set(g.id, []);

	for (const row of GROUP_MAPPING) {
		const bucket = manifest.entries[row.manifestKey];
		const entry = bucket?.find((e) => e.slug === row.slug);
		if (!entry) {
			warn(`⚠ overview: missing manifest entry for slug '${row.slug}' in '${row.manifestKey}'`);
			continue;
		}

		const headingSet = new Set(entry.headings ?? []);
		const chips: OverviewChip[] = [];
		for (const keyword of entry.keywords ?? []) {
			if (chips.length >= MAX_CHIPS_PER_CARD) break;
			slugger.reset();
			const anchor = slugger.slug(String(keyword));
			if (!headingSet.has(anchor)) {
				warn(`⚠ overview: chip '${keyword}' on '${row.slug}' has no matching heading`);
				continue;
			}
			chips.push({
				keyword: String(keyword),
				anchor,
				href: `${entry.url}#${anchor}`
			});
		}

		const card: OverviewCard = {
			slug: row.slug,
			title: entry.title,
			description: entry.description,
			url: entry.url,
			icon: row.icon,
			chips
		};
		groupMap.get(row.group)!.push(card);
	}

	const groups: OverviewGroup[] = GROUPS.map((g) => {
		const cards = groupMap.get(g.id)!;
		cards.sort((a, b) => {
			const ao = lookupOrder(manifest, GROUP_MAPPING.find((r) => r.slug === a.slug)!.manifestKey, a.slug);
			const bo = lookupOrder(manifest, GROUP_MAPPING.find((r) => r.slug === b.slug)!.manifestKey, b.slug);
			return ao - bo || a.slug.localeCompare(b.slug);
		});
		return { id: g.id, heading: g.heading, cards };
	});

	return {
		generatedAt: new Date().toISOString(),
		groups
	};
}

function lookupOrder(manifest: Manifest, key: string, slug: string): number {
	const e = manifest.entries[key]?.find((x) => x.slug === slug);
	return e?.order ?? 999;
}

export function buildOverviewFromDisk(manifestPath = 'src/lib/data/docs-manifest.json'): Overview {
	const raw = readFileSync(manifestPath, 'utf8');
	const manifest = JSON.parse(raw) as Manifest;
	return buildOverview(manifest);
}

export function writeOverview(overview: Overview, outFile = 'src/lib/data/overview.json'): void {
	mkdirSync(dirname(outFile), { recursive: true });
	writeFileSync(outFile, JSON.stringify(overview, null, 2));
	const total = overview.groups.reduce((n, g) => n + g.cards.length, 0);
	console.log(`✓ overview: ${overview.groups.length} groups, ${total} cards → ${outFile}`);
}

if (import.meta.main) {
	const overview = buildOverviewFromDisk();
	writeOverview(overview);
}
