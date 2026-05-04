#!/usr/bin/env bun
/**
 * Build src/lib/data/overview.json from src/lib/data/docs-manifest.json.
 *
 * Reads the v2 manifest fields (group, subgroup, icon, tagline, subfeatures)
 * authored in upstream nkido frontmatter and emits a tree of
 * groups → subgroups → cards. Snippet code is pre-highlighted with Shiki so
 * the landing page doesn't pay a runtime highlighter cost.
 *
 * Tolerant by design: missing required fields log a stderr warning and skip
 * the doc; mismatched anchors warn and ship the card; unknown icons fall back
 * to Box. The build never exits non-zero.
 *
 * Invoked at the end of fetch-mirrored-docs.ts main() so the two artifacts
 * stay in lockstep, and as a CLI for local iteration.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createHighlighter, type Highlighter } from 'shiki';
import { OVERVIEW_ICON_NAMES, isKnownIcon } from '../src/lib/data/overview-icons';

export type OverviewGroupId =
	| 'instruments'
	| 'effects'
	| 'sequencing'
	| 'visualizations'
	| 'language'
	| 'tools';

export type OverviewCardSource = {
	docSlug: string;
	docCategory: string;
	anchor?: string;
	anchorMatched: boolean;
};

export type OverviewCard = {
	name: string;
	tagline: string;
	url: string;
	icon: string;
	snippet?: string;
	snippetHtml?: string;
	source: OverviewCardSource;
};

export type OverviewSubgroup = {
	id: string;
	heading: string;
	cards: OverviewCard[];
};

export type OverviewGroup = {
	id: OverviewGroupId;
	heading: string;
	subgroups: OverviewSubgroup[];
};

export type Overview = {
	generatedAt: string;
	groups: OverviewGroup[];
};

type Subfeature = {
	name: string;
	anchor: string;
	tagline: string;
	snippet?: string;
	icon?: string;
};

type ManifestEntry = {
	title: string;
	description: string;
	slug: string;
	order: number;
	keywords: string[];
	headings: string[];
	url: string;
	source: 'live' | 'fallback' | 'local';
	group?: string;
	subgroup?: string;
	icon?: string;
	tagline?: string;
	subfeatures?: Subfeature[];
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

const FLAT_GROUPS: ReadonlySet<OverviewGroupId> = new Set(['visualizations']);

const VALID_GROUP_IDS: ReadonlySet<string> = new Set(GROUPS.map((g) => g.id));

/** Display label for a subgroup id. Overrides keep specific casings; falls
 *  back to title-casing the dashified id. */
const SUBGROUP_HEADING_OVERRIDES: Record<string, string> = {
	'time-based': 'Time-based',
	'state-io': 'State & I/O',
	'audio-plumbing': 'Audio plumbing',
	'sample-based': 'Sample-based'
};

function subgroupHeading(id: string): string {
	if (SUBGROUP_HEADING_OVERRIDES[id]) return SUBGROUP_HEADING_OVERRIDES[id];
	return id
		.split('-')
		.map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
		.join(' ');
}

function resolveIcon(
	candidate: string | undefined,
	fallback: string | undefined,
	docSlug: string,
	warn: (msg: string) => void
): string {
	for (const name of [candidate, fallback]) {
		if (!name) continue;
		if (isKnownIcon(name)) return name;
		warn(`⚠ overview: unknown icon '${name}' on '${docSlug}' — falling back to Box`);
		return 'Box';
	}
	return 'Box';
}

type CardWithRouting = OverviewCard & {
	_groupId: OverviewGroupId;
	_subgroupId: string | undefined;
	_docOrder: number;
	_arrayIndex: number;
};

export async function buildOverview(
	manifest: Manifest,
	options: { warn?: (msg: string) => void; highlighter?: Highlighter | null } = {}
): Promise<Overview> {
	const warn = options.warn ?? ((msg: string) => console.warn(msg));
	const highlighter = options.highlighter ?? null;

	const allCards: CardWithRouting[] = [];

	for (const [categoryKey, entries] of Object.entries(manifest.entries)) {
		for (const entry of entries) {
			if (!entry.group) continue; // silent skip — most opt-in fields, not all docs need to appear
			if (!VALID_GROUP_IDS.has(entry.group)) {
				warn(`⚠ overview: unknown group '${entry.group}' on '${entry.slug}' — skipping`);
				continue;
			}
			const groupId = entry.group as OverviewGroupId;
			const isFlatGroup = FLAT_GROUPS.has(groupId);

			if (!isFlatGroup && !entry.subgroup) {
				warn(`⚠ overview: '${entry.slug}' missing 'subgroup' for non-flat group '${groupId}' — skipping`);
				continue;
			}
			const subgroupId = isFlatGroup ? undefined : entry.subgroup;

			const subfeatures = entry.subfeatures ?? [];
			const headingSet = new Set(entry.headings ?? []);

			if (subfeatures.length === 0) {
				// Atomic doc → single card from doc-level tagline.
				if (!entry.tagline) {
					warn(`⚠ overview: '${entry.slug}' has neither subfeatures nor tagline — skipping`);
					continue;
				}
				const icon = resolveIcon(entry.icon, undefined, entry.slug, warn);
				allCards.push({
					name: entry.title,
					tagline: entry.tagline,
					url: entry.url,
					icon,
					source: {
						docSlug: entry.slug,
						docCategory: categoryKey,
						anchorMatched: true
					},
					_groupId: groupId,
					_subgroupId: subgroupId,
					_docOrder: entry.order,
					_arrayIndex: 0
				});
				continue;
			}

			// Sub-feature doc → one card per subfeature.
			for (const [arrayIndex, sub] of subfeatures.entries()) {
				const anchorMatched = headingSet.has(sub.anchor);
				if (!anchorMatched) {
					warn(
						`⚠ overview: subfeature '${sub.name}' on '${entry.slug}' anchors to '#${sub.anchor}' but no heading found`
					);
				}
				const icon = resolveIcon(sub.icon, entry.icon, entry.slug, warn);
				const card: CardWithRouting = {
					name: sub.name,
					tagline: sub.tagline,
					url: `${entry.url}#${sub.anchor}`,
					icon,
					source: {
						docSlug: entry.slug,
						docCategory: categoryKey,
						anchor: sub.anchor,
						anchorMatched
					},
					_groupId: groupId,
					_subgroupId: subgroupId,
					_docOrder: entry.order,
					_arrayIndex: arrayIndex
				};
				if (sub.snippet) {
					card.snippet = sub.snippet;
					if (highlighter) {
						try {
							card.snippetHtml = highlighter.codeToHtml(sub.snippet, {
								lang: 'js',
								theme: 'github-dark-dimmed'
							});
						} catch (err) {
							warn(
								`⚠ overview: failed to highlight snippet for '${sub.name}': ${(err as Error).message}`
							);
						}
					}
				}
				allCards.push(card);
			}
		}
	}

	// Group → subgroup → cards tree, preserving subgroup display order by
	// the lowest doc order that contributes to it.
	const groups: OverviewGroup[] = [];
	for (const g of GROUPS) {
		const groupCards = allCards.filter((c) => c._groupId === g.id);
		if (groupCards.length === 0) continue;

		if (FLAT_GROUPS.has(g.id)) {
			// Flat group: one implicit subgroup with all cards.
			const sorted = [...groupCards].sort(
				(a, b) => a._docOrder - b._docOrder || a._arrayIndex - b._arrayIndex
			);
			groups.push({
				id: g.id,
				heading: g.heading,
				subgroups: [
					{
						id: g.id,
						heading: g.heading,
						cards: sorted.map(stripRouting)
					}
				]
			});
			continue;
		}

		// Non-flat: bucket by subgroup and order subgroups by first-contributor doc order.
		const subgroupOrder = new Map<string, number>();
		const subgroupBuckets = new Map<string, CardWithRouting[]>();
		for (const card of groupCards) {
			const sgId = card._subgroupId!;
			const prevMin = subgroupOrder.get(sgId);
			if (prevMin === undefined || card._docOrder < prevMin) {
				subgroupOrder.set(sgId, card._docOrder);
			}
			const bucket = subgroupBuckets.get(sgId) ?? [];
			bucket.push(card);
			subgroupBuckets.set(sgId, bucket);
		}

		const sortedSubgroupIds = [...subgroupOrder.keys()].sort((a, b) => {
			const oa = subgroupOrder.get(a)!;
			const ob = subgroupOrder.get(b)!;
			return oa - ob || a.localeCompare(b);
		});

		const subgroups: OverviewSubgroup[] = sortedSubgroupIds.map((sgId) => {
			const cards = subgroupBuckets.get(sgId)!;
			cards.sort((a, b) => a._docOrder - b._docOrder || a._arrayIndex - b._arrayIndex);
			return {
				id: sgId,
				heading: subgroupHeading(sgId),
				cards: cards.map(stripRouting)
			};
		});

		groups.push({ id: g.id, heading: g.heading, subgroups });
	}

	return {
		generatedAt: new Date().toISOString(),
		groups
	};
}

function stripRouting(card: CardWithRouting): OverviewCard {
	const out: OverviewCard = {
		name: card.name,
		tagline: card.tagline,
		url: card.url,
		icon: card.icon,
		source: card.source
	};
	if (card.snippet !== undefined) out.snippet = card.snippet;
	if (card.snippetHtml !== undefined) out.snippetHtml = card.snippetHtml;
	return out;
}

let cachedHighlighter: Highlighter | null = null;
async function getHighlighter(): Promise<Highlighter> {
	if (cachedHighlighter) return cachedHighlighter;
	cachedHighlighter = await createHighlighter({
		themes: ['github-dark-dimmed'],
		langs: ['js']
	});
	return cachedHighlighter;
}

export async function buildOverviewFromDisk(
	manifestPath = 'src/lib/data/docs-manifest.json'
): Promise<Overview> {
	const raw = readFileSync(manifestPath, 'utf8');
	const manifest = JSON.parse(raw) as Manifest;
	const highlighter = await getHighlighter();
	return buildOverview(manifest, { highlighter });
}

export function writeOverview(overview: Overview, outFile = 'src/lib/data/overview.json'): void {
	mkdirSync(dirname(outFile), { recursive: true });
	writeFileSync(outFile, JSON.stringify(overview, null, 2));
	const groupCount = overview.groups.length;
	const subgroupCount = overview.groups.reduce((n, g) => n + g.subgroups.length, 0);
	const cardCount = overview.groups.reduce(
		(n, g) => n + g.subgroups.reduce((m, sg) => m + sg.cards.length, 0),
		0
	);
	console.log(
		`✓ overview: ${groupCount} groups, ${subgroupCount} subgroups, ${cardCount} cards → ${outFile}`
	);
}

// Re-export the icon list so tests/consumers can introspect the allowlist.
export { OVERVIEW_ICON_NAMES };

if (import.meta.main) {
	const overview = await buildOverviewFromDisk();
	writeOverview(overview);
}
