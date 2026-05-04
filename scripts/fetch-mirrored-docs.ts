#!/usr/bin/env bun
import { mkdirSync, writeFileSync, readFileSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve as resolveFsPath, join as joinFsPath } from 'node:path';
import matter from 'gray-matter';
import { resolve as resolvePath, dirname as dirnamePath } from 'node:path/posix';
import GithubSlugger from 'github-slugger';
import {
	MIRROR_INDEX,
	MIRROR_BASE_URL,
	MIRROR_LOCAL_PATH,
	MIRROR_NO_LOCAL,
	routePath,
	urlPath,
	fallbackPath,
	type MirrorEntry
} from './mirror-index';
import { buildOverviewFromDisk, writeOverview } from './build-overview';

// Heading levels exposed as chip-resolvable anchors. Start narrow; widen if too
// many keywords fail to resolve. H1 is excluded — DocPage renders the title from
// frontmatter, and the leading H1 is stripped from the body.
const HEADING_LEVELS = { min: 2, max: 5 } as const;

/** Upstream path → local URL, for rewriting cross-doc `.md` links. */
const UPSTREAM_TO_URL: Record<string, string> = Object.fromEntries(
	MIRROR_INDEX.map((e) => [e.upstream, urlPath(e)])
);

type MirrorSource = 'local' | 'live' | 'fallback';

type Subfeature = {
	name: string;
	anchor: string;
	tagline: string;
	snippet?: string;
	icon?: string;
};

type MirrorResult = {
	entry: MirrorEntry;
	source: MirrorSource;
	title: string;
	description: string;
	order: number;
	keywords: string[];
	headings: string[];
	group?: string;
	subgroup?: string;
	icon?: string;
	tagline?: string;
	subfeatures?: Subfeature[];
};

const localRoot = resolveFsPath(MIRROR_LOCAL_PATH);
const useLocal = (() => {
	if (MIRROR_NO_LOCAL) return false;
	try {
		return statSync(localRoot).isDirectory();
	} catch {
		return false;
	}
})();

function loadLocalUpstream(entry: MirrorEntry): string | null {
	const path = joinFsPath(localRoot, entry.upstream);
	if (!existsSync(path)) return null;
	try {
		return readFileSync(path, 'utf8');
	} catch {
		return null;
	}
}

const REQUIRED_FRONTMATTER = ['title'];
const token = process.env.GITHUB_TOKEN;
const isCI = process.env.CI === 'true';

async function fetchUpstream(
	entry: MirrorEntry,
	warnings: string[]
): Promise<string | null> {
	const url = `${MIRROR_BASE_URL}/${entry.upstream}`;
	try {
		const res = await fetch(url, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		if (!res.ok) {
			warnings.push(`⚠ fetch ${entry.upstream}: HTTP ${res.status}`);
			return null;
		}
		return await res.text();
	} catch (err) {
		warnings.push(`⚠ fetch ${entry.upstream}: ${(err as Error).message}`);
		return null;
	}
}

const PROGRESS_BAR_WIDTH = 30;
const isTTY = Boolean(process.stderr.isTTY);

function renderProgress(done: number, total: number): void {
	if (!isTTY) {
		// Non-TTY (CI, piped): print a single line per 10% so logs stay readable.
		const decile = Math.floor((done / total) * 10);
		const lastDecile = Math.floor(((done - 1) / total) * 10);
		if (done === total || decile > lastDecile) {
			process.stderr.write(`  mirror: ${done}/${total}\n`);
		}
		return;
	}
	const filled = Math.floor((done / total) * PROGRESS_BAR_WIDTH);
	const bar = '█'.repeat(filled) + '░'.repeat(PROGRESS_BAR_WIDTH - filled);
	process.stderr.write(`\r  [${bar}] ${done}/${total}`);
}

const FETCH_CONCURRENCY = 16;

async function runWithConcurrency<T, R>(
	items: T[],
	limit: number,
	worker: (item: T, index: number) => Promise<R>
): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let next = 0;
	const lanes = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (true) {
			const i = next++;
			if (i >= items.length) return;
			results[i] = await worker(items[i], i);
		}
	});
	await Promise.all(lanes);
	return results;
}

function loadFallback(entry: MirrorEntry): string | null {
	const path = fallbackPath(entry);
	if (!existsSync(path)) return null;
	return readFileSync(path, 'utf8');
}

/**
 * Rewrite markdown-style relative `.md` links to our mirrored route URLs.
 * E.g. in tutorials/02-filters.md, a link `[x](../builtins/reverbs.md)` gets
 * resolved against `web/static/docs/tutorials/` → `web/static/docs/builtins/reverbs.md`,
 * looked up in the mirror index, and rewritten to `/docs/reference/builtins/reverbs`.
 */
function rewriteCrossDocLinks(entry: MirrorEntry, body: string): string {
	const dir = dirnamePath(entry.upstream);
	return body.replace(/\]\(([^)]+)\)/g, (match, target: string) => {
		// Split off optional #fragment.
		const [path, frag] = target.split('#', 2);
		if (!path.endsWith('.md')) return match;
		// Only rewrite relative links. Absolute URLs (http, /...) are left alone.
		if (/^[a-z]+:/i.test(path) || path.startsWith('/')) return match;

		const absolute = resolvePath('/' + dir, path).slice(1);
		let mapped = UPSTREAM_TO_URL[absolute];
		// Upstream tutorials sometimes write `../builtins/x.md` when they
		// should be `../reference/builtins/x.md`. Try that fallback.
		if (!mapped && absolute.startsWith('web/static/docs/')) {
			const rel = absolute.slice('web/static/docs/'.length);
			mapped = UPSTREAM_TO_URL[`web/static/docs/reference/${rel}`];
		}
		if (!mapped) return match;
		return `](${mapped}${frag ? '#' + frag : ''})`;
	});
}

/**
 * Escape stray `<` in prose that mdsvex would otherwise interpret as the start
 * of an HTML/Svelte tag. Only affects text outside fenced code blocks and
 * inline-code spans. We look for `<` followed by whitespace, a digit, or common
 * punctuation — patterns that can't start a valid tag name.
 */
function escapeProseLTs(body: string): string {
	const lines = body.split('\n');
	let inFence = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (/^```/.test(line.trimStart())) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		// Preserve inline code spans `...` — escape only outside backticks.
		let out = '';
		let inCode = false;
		for (let j = 0; j < line.length; j++) {
			const c = line[j];
			if (c === '`') {
				inCode = !inCode;
				out += c;
				continue;
			}
			if (!inCode && c === '<') {
				const next = line[j + 1] ?? '';
				// Allow `<letter`, `</letter`, `<!`, `<{` (HTML/Svelte tag starts).
				if (/[A-Za-z/!{]/.test(next)) {
					out += c;
				} else {
					out += '&lt;';
				}
			} else {
				out += c;
			}
		}
		lines[i] = out;
	}
	return lines.join('\n');
}

/**
 * Extract slugified markdown headings from the body, restricted to the level
 * range in `HEADING_LEVELS`. Slug rules match `github-slugger`, which is what
 * `rehype-slug` (configured in `svelte.config.js`) uses to generate anchor IDs
 * in the rendered HTML — so chips that match a returned slug are guaranteed to
 * resolve in the browser.
 *
 * Skips fenced code blocks so headings inside ```` ``` ```` aren't picked up.
 */
function extractHeadings(body: string): string[] {
	const slugger = new GithubSlugger();
	const slugs: string[] = [];
	let inFence = false;
	for (const line of body.split('\n')) {
		if (/^```/.test(line.trimStart())) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		const m = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
		if (!m) continue;
		const level = m[1].length;
		if (level < HEADING_LEVELS.min || level > HEADING_LEVELS.max) continue;
		const text = m[2]
			.replace(/`([^`]+)`/g, '$1')
			.replace(/\*\*([^*]+)\*\*/g, '$1')
			.replace(/\*([^*]+)\*/g, '$1')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.trim();
		if (!text) continue;
		slugs.push(slugger.slug(text));
	}
	return slugs;
}

function synthesizeDescription(body: string): string {
	const lines = body.split('\n');
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (!line) continue;
		if (line.startsWith('#')) continue;
		if (line.startsWith('```') || line.startsWith('|') || line.startsWith('---')) continue;
		const cleaned = line
			.replace(/\*\*([^*]+)\*\*/g, '$1')
			.replace(/\*([^*]+)\*/g, '$1')
			.replace(/`([^`]+)`/g, '$1')
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
			.replace(/\s+/g, ' ')
			.trim();
		if (cleaned.length < 20) continue;
		return cleaned.length > 160 ? cleaned.slice(0, 157).trimEnd() + '…' : cleaned;
	}
	return '';
}

function validateFrontmatter(entry: MirrorEntry, data: Record<string, unknown>): void {
	const missing = REQUIRED_FRONTMATTER.filter(
		(k) => data[k] === undefined || data[k] === null || data[k] === ''
	);
	if (missing.length > 0) {
		throw new Error(
			`${entry.upstream}: missing required frontmatter field(s): ${missing.join(', ')}`
		);
	}
}

function parseSubfeatures(entry: MirrorEntry, value: unknown): Subfeature[] | undefined {
	if (value === undefined || value === null) return undefined;
	if (!Array.isArray(value)) {
		console.warn(`⚠ ${entry.upstream}: subfeatures must be an array`);
		return undefined;
	}
	const out: Subfeature[] = [];
	for (const [i, raw] of value.entries()) {
		if (raw === null || typeof raw !== 'object') {
			console.warn(`⚠ ${entry.upstream}: subfeatures[${i}] is not an object`);
			continue;
		}
		const sub = raw as Record<string, unknown>;
		const name = typeof sub.name === 'string' ? sub.name : '';
		const anchor = typeof sub.anchor === 'string' ? sub.anchor : '';
		const tagline = typeof sub.tagline === 'string' ? sub.tagline : '';
		if (!name || !anchor || !tagline) {
			console.warn(
				`⚠ ${entry.upstream}: subfeatures[${i}] missing required field (name/anchor/tagline)`
			);
			continue;
		}
		const snippet = typeof sub.snippet === 'string' ? sub.snippet : undefined;
		const icon = typeof sub.icon === 'string' ? sub.icon : undefined;
		out.push({ name, anchor, tagline, ...(snippet ? { snippet } : {}), ...(icon ? { icon } : {}) });
	}
	return out;
}

function writeEntry(entry: MirrorEntry, raw: string, source: MirrorSource): MirrorResult {
	const { data, content: body } = matter(raw);
	validateFrontmatter(entry, data);

	const description: string =
		typeof data.description === 'string' && data.description.trim().length > 0
			? data.description
			: synthesizeDescription(body);

	const order = typeof data.order === 'number' ? data.order : 999;
	const keywords: string[] = Array.isArray(data.keywords)
		? data.keywords.map(String)
		: typeof data.keywords === 'string'
			? [data.keywords]
			: [];

	const headings = extractHeadings(body);

	const group = typeof data.group === 'string' ? data.group : undefined;
	const subgroup = typeof data.subgroup === 'string' ? data.subgroup : undefined;
	const icon = typeof data.icon === 'string' ? data.icon : undefined;
	const tagline = typeof data.tagline === 'string' ? data.tagline : undefined;
	const subfeatures = parseSubfeatures(entry, data.subfeatures);

	const backHref = entry.category === 'tutorials' ? '/docs/tutorials' : `/docs/reference/${entry.subcategory}`;
	const backLabel = entry.category === 'tutorials' ? 'Tutorials' : entry.subcategory.replace('-', ' ');

	const outFrontmatter: Record<string, unknown> = {
		layout: 'doc',
		title: data.title,
		description,
		category: entry.category,
		...(entry.subcategory ? { subcategory: entry.subcategory } : {}),
		slug: entry.slug,
		order,
		keywords,
		backHref,
		backLabel,
		referenceKeyword: keywords[0] ?? entry.slug
	};

	const yaml = Object.entries(outFrontmatter)
		.map(([k, v]) => {
			if (Array.isArray(v)) return `${k}: [${v.map((x) => JSON.stringify(x)).join(', ')}]`;
			if (typeof v === 'string') return `${k}: ${JSON.stringify(v)}`;
			return `${k}: ${v}`;
		})
		.join('\n');

	// Strip any leading H1 from the body — DocPage renders the title from frontmatter.
	const bodyNoH1 = body.trimStart().replace(/^#\s+[^\n]+\n+/, '');
	const bodyLinked = rewriteCrossDocLinks(entry, bodyNoH1);
	const bodyEscaped = escapeProseLTs(bodyLinked);
	const out = `---\n${yaml}\n---\n\n${bodyEscaped}`;

	const outDir = routePath(entry);
	const outFile = `${outDir}/+page.md`;
	mkdirSync(outDir, { recursive: true });
	writeFileSync(outFile, out);

	return {
		entry,
		source,
		title: String(data.title),
		description,
		order,
		keywords,
		headings,
		...(group ? { group } : {}),
		...(subgroup ? { subgroup } : {}),
		...(icon ? { icon } : {}),
		...(tagline ? { tagline } : {}),
		...(subfeatures ? { subfeatures } : {})
	};
}

type Outcome =
	| { kind: 'ok'; result: MirrorResult; source: MirrorSource }
	| { kind: 'missing'; entry: MirrorEntry }
	| { kind: 'error'; entry: MirrorEntry; error: Error };

async function main() {
	const total = MIRROR_INDEX.length;
	const fetchWarnings: string[] = [];
	let completed = 0;

	const sourceLabel = useLocal ? `local clone at ${localRoot}` : 'upstream';
	process.stderr.write(`Mirroring ${total} docs from ${sourceLabel}...\n`);
	renderProgress(0, total);

	const outcomes = await runWithConcurrency<MirrorEntry, Outcome>(
		MIRROR_INDEX,
		FETCH_CONCURRENCY,
		async (entry) => {
			let raw: string | null = null;
			let source: MirrorSource = 'fallback';
			if (useLocal) {
				raw = loadLocalUpstream(entry);
				if (raw !== null) source = 'local';
			}
			if (raw === null) {
				raw = await fetchUpstream(entry, fetchWarnings);
				if (raw !== null) source = 'live';
			}
			if (raw === null) {
				raw = loadFallback(entry);
				if (raw !== null) source = 'fallback';
			}
			let outcome: Outcome;
			if (raw === null) {
				outcome = { kind: 'missing', entry };
			} else {
				try {
					const result = writeEntry(entry, raw, source);
					outcome = { kind: 'ok', result, source };
				} catch (err) {
					outcome = { kind: 'error', entry, error: err as Error };
				}
			}
			completed++;
			renderProgress(completed, total);
			return outcome;
		}
	);

	if (isTTY) process.stderr.write('\n');

	// Surface queued fetch warnings now that the progress bar has finished.
	for (const w of fetchWarnings) console.warn(w);

	const results: MirrorResult[] = [];
	let localCount = 0;
	let liveCount = 0;
	let fallbackCount = 0;
	let missingCount = 0;
	for (const o of outcomes) {
		if (o.kind === 'missing') {
			missingCount++;
			console.error(`✗ ${o.entry.upstream}: no local clone, no live source, no fallback`);
		} else if (o.kind === 'error') {
			console.error(`✗ ${o.entry.upstream}: ${o.error.message}`);
			process.exit(1);
		} else {
			results.push(o.result);
			if (o.source === 'local') localCount++;
			else if (o.source === 'live') liveCount++;
			else fallbackCount++;
		}
	}

	if (missingCount > 0) {
		if (isCI) {
			console.error(`\n✗ ${missingCount} entries missing in CI. Aborting.`);
			process.exit(1);
		}
		console.warn(`⚠ ${missingCount} entries missing — continuing in local dev`);
	}

	writeManifest(results);

	const parts: string[] = [];
	if (localCount) parts.push(`${localCount} local`);
	if (liveCount) parts.push(`${liveCount} live`);
	if (fallbackCount) parts.push(`${fallbackCount} fallback`);
	if (missingCount) parts.push(`${missingCount} missing`);
	console.log(`✓ mirror: ${parts.join(', ')}`);

	// Keep overview.json in sync with the manifest. Warnings go to stderr; the
	// build is never blocked by chip-resolution or missing-slug issues.
	writeOverview(await buildOverviewFromDisk());
}

function writeManifest(results: MirrorResult[]): void {
	const byCategory: Record<string, Array<Record<string, unknown>>> = {};
	for (const r of results) {
		const key = r.entry.subcategory
			? `${r.entry.category}/${r.entry.subcategory}`
			: r.entry.category;
		byCategory[key] ??= [];
		byCategory[key].push({
			title: r.title,
			description: r.description,
			slug: r.entry.slug,
			order: r.order,
			keywords: r.keywords,
			headings: r.headings,
			url: urlPath(r.entry),
			source: r.source,
			...(r.group ? { group: r.group } : {}),
			...(r.subgroup ? { subgroup: r.subgroup } : {}),
			...(r.icon ? { icon: r.icon } : {}),
			...(r.tagline ? { tagline: r.tagline } : {}),
			...(r.subfeatures ? { subfeatures: r.subfeatures } : {})
		});
	}
	for (const key of Object.keys(byCategory)) {
		byCategory[key].sort(
			(a, b) => (a.order as number) - (b.order as number) || String(a.title).localeCompare(String(b.title))
		);
	}
	const manifest = {
		generatedAt: new Date().toISOString(),
		entries: byCategory
	};
	const file = 'src/lib/data/docs-manifest.json';
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, JSON.stringify(manifest, null, 2));
}

await main();
