#!/usr/bin/env bun
/**
 * Build src/lib/data/docs-sidebar.json from src/lib/data/docs-manifest.json.
 *
 * Emits a section-scoped tree the docs layout can render directly:
 *   - concepts:  flat list ordered by frontmatter `order`
 *   - tutorials: flat list ordered by frontmatter `order`
 *   - reference: { builtins, language, 'mini-notation' } each grouped by
 *                manifest `subgroup`, with sub-groups ordered per
 *                docs-sidebar-overrides.ts.
 *
 * Tolerant by design (matches `build-overview.ts`): missing subgroups are
 * bucketed into 'misc' with a warning; unknown subgroups appear at the end
 * with a warning. The build never exits non-zero.
 *
 * Wired into `package.json` `prebuild` after `fetch-mirrored-docs.ts`. Also
 * runnable directly for local iteration: `bun run scripts/build-sidebar.ts`.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import {
	referenceTopOrder,
	referenceTopLabels,
	subgroupOrder
} from '../src/lib/data/docs-sidebar-overrides';

type Heading = { slug: string; text: string; depth: number };

type ManifestEntry = {
	title: string;
	description: string;
	slug: string;
	order: number;
	keywords: string[];
	headings: Heading[];
	url: string;
	source: 'live' | 'fallback' | 'local';
	group?: string;
	subgroup?: string;
	icon?: string;
	tagline?: string;
};

export type Manifest = {
	generatedAt: string;
	entries: Record<string, ManifestEntry[]>;
};

export type SidebarLeaf = {
	title: string;
	url: string;
	slug: string;
};

export type SidebarSubgroup = {
	slug: string;
	label: string;
	entries: SidebarLeaf[];
};

export type SidebarTree = {
	concepts: SidebarLeaf[];
	tutorials: SidebarLeaf[];
	reference: Record<string, SidebarSubgroup[]>;
};

export type Sidebar = {
	generatedAt: string;
	referenceTopOrder: string[];
	referenceTopLabels: Record<string, string>;
	tree: SidebarTree;
};

function toLeaf(e: ManifestEntry): SidebarLeaf {
	return { title: e.title, url: e.url, slug: e.slug };
}

function flatList(entries: ManifestEntry[], warn: (msg: string) => void, sectionLabel: string): SidebarLeaf[] {
	const sorted = [...entries].sort(
		(a, b) => a.order - b.order || a.slug.localeCompare(b.slug)
	);
	// Warn on order collisions so the human notices and fixes them.
	for (let i = 1; i < sorted.length; i++) {
		if (sorted[i].order === sorted[i - 1].order) {
			warn(
				`${sectionLabel}: order ${sorted[i].order} shared by '${sorted[i - 1].slug}' and '${sorted[i].slug}'; sorting by slug`
			);
		}
	}
	return sorted.map(toLeaf);
}

function titleCase(s: string): string {
	return s
		.split('-')
		.map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
		.join(' ');
}

function buildReferenceSubtree(
	topGroup: string,
	entries: ManifestEntry[],
	warn: (msg: string) => void
): SidebarSubgroup[] {
	const buckets = new Map<string, ManifestEntry[]>();
	for (const e of entries) {
		// Bucket priority: explicit subgroup → fall back to group (covers
		// visualizations entries that ship without a subgroup but share a
		// group) → 'misc'. Missing subgroup AND missing group warns; the
		// group fallback alone is silent because it's a deliberate pattern.
		let key: string;
		if (e.subgroup) {
			key = e.subgroup;
		} else if (e.group) {
			key = e.group;
		} else {
			key = 'misc';
			warn(`reference/${topGroup}: '${e.slug}' has no subgroup or group; bucketing into 'misc'`);
		}
		const bucket = buckets.get(key) ?? [];
		bucket.push(e);
		buckets.set(key, bucket);
	}

	const ordered = subgroupOrder[topGroup] ?? [];
	const seen = new Set<string>();
	const out: SidebarSubgroup[] = [];

	for (const { slug, label } of ordered) {
		const bucket = buckets.get(slug);
		if (!bucket) continue;
		out.push({
			slug,
			label,
			entries: flatList(bucket, warn, `reference/${topGroup}/${slug}`)
		});
		seen.add(slug);
	}

	const remaining = [...buckets.keys()].filter((k) => !seen.has(k)).sort();
	for (const k of remaining) {
		if (k !== 'misc') {
			warn(`reference/${topGroup}: subgroup '${k}' not in override; appending at end`);
		}
		out.push({
			slug: k,
			label: k === 'misc' ? 'Misc' : titleCase(k),
			entries: flatList(buckets.get(k)!, warn, `reference/${topGroup}/${k}`)
		});
	}
	return out;
}

export function buildSidebar(
	manifest: Manifest,
	options: { warn?: (msg: string) => void } = {}
): Sidebar {
	const warn = options.warn ?? ((msg: string) => console.warn(`⚠ ${msg}`));

	// Discover reference top-groups from manifest keys shaped `reference/<sub>`.
	// Override `referenceTopOrder` lists known groups in the curated visual
	// order; any discovered group not in the override is appended (with a
	// warn) so new upstream subcategories show up without code changes.
	const discovered = new Set<string>();
	for (const key of Object.keys(manifest.entries)) {
		if (key.startsWith('reference/')) discovered.add(key.slice('reference/'.length));
	}
	// Always include the override-listed groups too — gives stable empty
	// subtrees when the manifest is sparse (matches the prior behavior the
	// emptyManifest tests rely on).
	for (const t of referenceTopOrder) discovered.add(t);

	const orderedTopGroups: string[] = [];
	const seen = new Set<string>();
	for (const t of referenceTopOrder) {
		if (discovered.has(t)) {
			orderedTopGroups.push(t);
			seen.add(t);
		}
	}
	const remaining = [...discovered].filter((t) => !seen.has(t)).sort();
	for (const t of remaining) {
		warn(`reference: top-group '${t}' not in override; appending at end`);
		orderedTopGroups.push(t);
	}

	const referenceTree: Record<string, SidebarSubgroup[]> = {};
	for (const top of orderedTopGroups) {
		referenceTree[top] = buildReferenceSubtree(
			top,
			manifest.entries[`reference/${top}`] ?? [],
			warn
		);
	}

	const tree: SidebarTree = {
		concepts: flatList(manifest.entries['concepts'] ?? [], warn, 'concepts'),
		tutorials: flatList(manifest.entries['tutorials'] ?? [], warn, 'tutorials'),
		reference: referenceTree
	};

	// Emit labels for every top-group in the tree, falling back to title-cased
	// slug for groups the override hasn't named yet.
	const labels: Record<string, string> = {};
	for (const top of orderedTopGroups) {
		labels[top] = referenceTopLabels[top] ?? titleCase(top);
	}

	return {
		generatedAt: new Date().toISOString(),
		referenceTopOrder: orderedTopGroups,
		referenceTopLabels: labels,
		tree
	};
}

export function buildSidebarFromDisk(
	manifestPath = 'src/lib/data/docs-manifest.json'
): Sidebar {
	const raw = readFileSync(manifestPath, 'utf8');
	const manifest = JSON.parse(raw) as Manifest;
	return buildSidebar(manifest);
}

export function writeSidebar(sidebar: Sidebar, outFile = 'src/lib/data/docs-sidebar.json'): void {
	mkdirSync(dirname(outFile), { recursive: true });
	writeFileSync(outFile, JSON.stringify(sidebar, null, 2) + '\n');
	const conceptCount = sidebar.tree.concepts.length;
	const tutorialCount = sidebar.tree.tutorials.length;
	const refCount = sidebar.referenceTopOrder.reduce((n, top) => {
		const subgroups = sidebar.tree.reference[top] ?? [];
		return n + subgroups.reduce((m, sg) => m + sg.entries.length, 0);
	}, 0);
	console.log(
		`✓ sidebar: ${conceptCount} concepts, ${tutorialCount} tutorials, ${refCount} reference → ${outFile}`
	);
}

if (import.meta.main) {
	const sidebar = buildSidebarFromDisk();
	writeSidebar(sidebar);
}
