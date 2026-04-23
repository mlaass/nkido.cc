#!/usr/bin/env bun
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import matter from 'gray-matter';
import { resolve as resolvePath, dirname as dirnamePath } from 'node:path/posix';
import {
	MIRROR_INDEX,
	MIRROR_BASE_URL,
	routePath,
	urlPath,
	fallbackPath,
	type MirrorEntry
} from './mirror-index';

/** Upstream path → local URL, for rewriting cross-doc `.md` links. */
const UPSTREAM_TO_URL: Record<string, string> = Object.fromEntries(
	MIRROR_INDEX.map((e) => [e.upstream, urlPath(e)])
);

type MirrorResult = {
	entry: MirrorEntry;
	source: 'live' | 'fallback';
	title: string;
	description: string;
	order: number;
	keywords: string[];
};

const REQUIRED_FRONTMATTER = ['title'];
const token = process.env.GITHUB_TOKEN;
const isCI = process.env.CI === 'true';

async function fetchUpstream(entry: MirrorEntry): Promise<string | null> {
	const url = `${MIRROR_BASE_URL}/${entry.upstream}`;
	try {
		const res = await fetch(url, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		if (!res.ok) {
			console.warn(`⚠ fetch ${entry.upstream}: HTTP ${res.status}`);
			return null;
		}
		return await res.text();
	} catch (err) {
		console.warn(`⚠ fetch ${entry.upstream}: ${(err as Error).message}`);
		return null;
	}
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

function writeEntry(entry: MirrorEntry, raw: string, source: 'live' | 'fallback'): MirrorResult {
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
		keywords
	};
}

async function main() {
	const results: MirrorResult[] = [];
	let liveCount = 0;
	let fallbackCount = 0;
	let missingCount = 0;

	for (const entry of MIRROR_INDEX) {
		let raw = await fetchUpstream(entry);
		let source: 'live' | 'fallback' = 'live';
		if (raw === null) {
			raw = loadFallback(entry);
			source = 'fallback';
		}
		if (raw === null) {
			missingCount++;
			console.error(`✗ ${entry.upstream}: no live source AND no fallback`);
			continue;
		}

		try {
			const result = writeEntry(entry, raw, source);
			results.push(result);
			if (source === 'live') liveCount++;
			else fallbackCount++;
		} catch (err) {
			console.error(`✗ ${entry.upstream}: ${(err as Error).message}`);
			process.exit(1);
		}
	}

	if (missingCount > 0) {
		if (isCI) {
			console.error(`\n✗ ${missingCount} entries missing both live source and fallback in CI. Aborting.`);
			process.exit(1);
		}
		console.warn(`\n⚠ ${missingCount} entries missing — continuing in local dev`);
	}

	writeManifest(results);

	const tot = MIRROR_INDEX.length;
	console.log(
		`✓ mirror: ${liveCount}/${tot} live, ${fallbackCount} fallback, ${missingCount} missing`
	);
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
			url: urlPath(r.entry),
			source: r.source
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
