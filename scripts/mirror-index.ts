/**
 * Discovery helpers for docs mirrored from upstream nkido.
 * Source of truth: github.com/mlaass/nkido master branch,
 * under `web/static/docs/`.
 *
 * Walking the upstream tree (rather than maintaining a hand-curated allowlist)
 * means new upstream docs flow into the site automatically. Per-file content is
 * still resolved with the live → fallback → local-clone tiers in
 * `fetch-mirrored-docs.ts`; this file only handles path → entry derivation.
 */

import { readdirSync, statSync } from 'node:fs';
import { join as joinFsPath } from 'node:path';

export type MirrorEntry = {
	/** Upstream path under the nkido repo root (e.g. `web/static/docs/reference/builtins/filters.md`). */
	upstream: string;
	/** Top-level section on nkido.cc. */
	category: string;
	/** Reference-only sub-grouping ('' for tutorials/concepts). */
	subcategory: string;
	/** URL slug: /docs/<category>/[<subcategory>/]<slug>. */
	slug: string;
};

/**
 * Per-upstream-path slug overrides for collisions and explicit renames.
 * Keyed by full upstream path; value is the slug to use in place of the
 * basename-derived default.
 */
export const SLUG_OVERRIDES: Record<string, string> = {
	// Local `concepts/signals` ("Signals and DAGs") is a different document
	// from upstream's "Mono & Stereo Signals". Keep both.
	'web/static/docs/concepts/signals.md': 'mono-stereo-signals'
};

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

/** Path to the committed snapshot used when no local clone is available. */
export const MIRROR_FALLBACK_ROOT = 'static/_mirror-fallback';

/** Upstream root under any source tree (clone or fallback). */
export const UPSTREAM_DOCS_ROOT = 'web/static/docs';

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
	return `${MIRROR_FALLBACK_ROOT}/${entry.upstream}`;
}

/**
 * Default slug rules:
 *  - tutorials: strip a leading `\d+-` prefix (the numeric prefix gives
 *    visual ordering upstream; URLs read better without it).
 *  - everything else: filename basename.
 *
 * Override via SLUG_OVERRIDES for collisions and explicit renames.
 */
function deriveSlug(upstream: string, category: string, basename: string): string {
	const override = SLUG_OVERRIDES[upstream];
	if (override) return override;
	if (category === 'tutorials') return basename.replace(/^\d+-/, '');
	return basename;
}

function listMarkdownRecursive(absDir: string, relDir: string, out: string[]): void {
	let dirents: ReturnType<typeof readdirSync> = [];
	try {
		dirents = readdirSync(absDir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const d of dirents) {
		if (d.name.startsWith('.')) continue;
		const childAbs = joinFsPath(absDir, d.name);
		const childRel = relDir ? `${relDir}/${d.name}` : d.name;
		if (d.isDirectory()) {
			listMarkdownRecursive(childAbs, childRel, out);
		} else if (d.isFile() && d.name.endsWith('.md')) {
			out.push(childRel);
		}
	}
}

/**
 * Walk `<rootPath>/web/static/docs/` and emit one MirrorEntry per `.md` file.
 *
 * The directory layout is the schema:
 *   - reference/<sub>/<file>.md → category=reference, subcategory=<sub>
 *   - reference/<file>.md       → category=reference, subcategory=''
 *   - tutorials/<file>.md       → category=tutorials, subcategory='', slug strips `\d+-`
 *   - concepts/<file>.md        → category=concepts,  subcategory=''
 *
 * Other top-level categories are mirrored as-is (category=<dir>, subcategory='').
 * Files at the very top of `web/static/docs/` (no category dir) are skipped
 * with a warning since we can't place them.
 *
 * The result is sorted deterministically (category, subcategory, slug).
 */
export function discoverEntries(rootPath: string): MirrorEntry[] {
	const docsRootAbs = joinFsPath(rootPath, UPSTREAM_DOCS_ROOT);
	try {
		if (!statSync(docsRootAbs).isDirectory()) return [];
	} catch {
		return [];
	}

	const relPaths: string[] = [];
	listMarkdownRecursive(docsRootAbs, '', relPaths);

	const entries: MirrorEntry[] = [];
	for (const rel of relPaths) {
		const upstream = `${UPSTREAM_DOCS_ROOT}/${rel}`;
		const parts = rel.split('/');
		if (parts.length < 2) {
			console.warn(`⚠ ${upstream}: top-level docs file with no category — skipping`);
			continue;
		}
		const category = parts[0];
		const fileName = parts[parts.length - 1];
		const basename = fileName.replace(/\.md$/, '');
		// Anything between category and filename collapses into subcategory; for
		// a deeper-than-one-level layout we join with '/' so the route still works.
		const subcategory = parts.slice(1, -1).join('/');
		const slug = deriveSlug(upstream, category, basename);
		entries.push({ upstream, category, subcategory, slug });
	}

	entries.sort((a, b) => {
		if (a.category !== b.category) return a.category.localeCompare(b.category);
		if (a.subcategory !== b.subcategory) return a.subcategory.localeCompare(b.subcategory);
		return a.slug.localeCompare(b.slug);
	});

	return entries;
}
