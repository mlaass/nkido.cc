#!/usr/bin/env bun
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const UPSTREAM = 'https://raw.githubusercontent.com/mlaass/nkido/master/CONTRIBUTING.md';
const OUT_DIR = 'src/routes/community/contributing';
const OUT_FILE = `${OUT_DIR}/+page.md`;
const FALLBACK = 'static/_fallback/CONTRIBUTING.md';

const token = process.env.GITHUB_TOKEN;
const isCI = process.env.CI === 'true';

async function fetchContributing(): Promise<string | null> {
	try {
		const res = await fetch(UPSTREAM, {
			headers: token ? { Authorization: `Bearer ${token}` } : {}
		});
		if (!res.ok) {
			console.warn(`⚠ fetch CONTRIBUTING.md: HTTP ${res.status}`);
			return null;
		}
		return await res.text();
	} catch (err) {
		console.warn(`⚠ fetch CONTRIBUTING.md: ${(err as Error).message}`);
		return null;
	}
}

function loadFallback(): string | null {
	if (!existsSync(FALLBACK)) return null;
	return readFileSync(FALLBACK, 'utf8');
}

const GH_BASE = 'https://github.com/mlaass/nkido/blob/master';

function rewriteRelativeLinks(body: string): string {
	// Markdown links like `[README](README.md)` or `[docs](./foo/bar.md)` only
	// make sense inside the upstream repo. Rewrite them to absolute GitHub URLs
	// so the rendered page isn't a minefield of 404s.
	return body.replace(/\]\(([^)]+)\)/g, (match, target: string) => {
		const [path, frag] = target.split('#', 2);
		if (/^[a-z]+:/i.test(path) || path.startsWith('/') || path.startsWith('#')) {
			return match;
		}
		const normalized = path.replace(/^\.\//, '');
		return `](${GH_BASE}/${normalized}${frag ? '#' + frag : ''})`;
	});
}

function writeWithFrontmatter(body: string): void {
	// Upstream CONTRIBUTING.md starts with `# Contributing to NKIDO` — drop it
	// since the DocLayout renders an H1 from frontmatter.
	const bodyNoH1 = body.trimStart().replace(/^#\s+[^\n]+\n+/, '');
	const bodyLinked = rewriteRelativeLinks(bodyNoH1);
	const content = `---
layout: doc
title: Contributing to NKIDO
description: How to contribute to the NKIDO engine, language, IDE, and addons.
backHref: /community
backLabel: Community
---

${bodyLinked}`;
	mkdirSync(OUT_DIR, { recursive: true });
	writeFileSync(OUT_FILE, content);
}

async function main() {
	let body = await fetchContributing();
	let source: 'live' | 'fallback' = 'live';
	if (body === null) {
		if (isCI) {
			console.error('✗ CONTRIBUTING.md fetch failed in CI — aborting');
			process.exit(1);
		}
		body = loadFallback();
		source = 'fallback';
	}
	if (body === null) {
		console.error(`✗ CONTRIBUTING.md: no live source and no fallback at ${FALLBACK}`);
		process.exit(1);
	}
	writeWithFrontmatter(body);
	console.log(`✓ CONTRIBUTING.md (${source}): ${body.length} chars → ${OUT_FILE}`);
}

await main();
