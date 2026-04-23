#!/usr/bin/env bun
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const API_URL = 'https://api.github.com/repos/mlaass/nkido/releases?per_page=100';
const OUT_FILE = 'src/lib/data/releases.json';

const token = process.env.GITHUB_TOKEN;

type GithubRelease = {
	tag_name: string;
	name: string | null;
	body: string | null;
	published_at: string | null;
	created_at: string | null;
	draft: boolean;
	prerelease: boolean;
	html_url: string;
};

type ReleaseEntry = {
	tag: string;
	title: string;
	body: string;
	date: string;
	prerelease: boolean;
	url: string;
};

async function fetchReleases(): Promise<GithubRelease[] | null> {
	try {
		const res = await fetch(API_URL, {
			headers: {
				Accept: 'application/vnd.github+json',
				'X-GitHub-Api-Version': '2022-11-28',
				...(token ? { Authorization: `Bearer ${token}` } : {})
			}
		});
		if (!res.ok) {
			console.warn(`⚠ fetch releases: HTTP ${res.status}`);
			return null;
		}
		return (await res.json()) as GithubRelease[];
	} catch (err) {
		console.warn(`⚠ fetch releases: ${(err as Error).message}`);
		return null;
	}
}

function keepLastGood(): ReleaseEntry[] {
	if (!existsSync(OUT_FILE)) return [];
	try {
		const parsed = JSON.parse(readFileSync(OUT_FILE, 'utf8'));
		return Array.isArray(parsed.releases) ? parsed.releases : [];
	} catch {
		return [];
	}
}

async function main() {
	const live = await fetchReleases();
	let releases: ReleaseEntry[];
	let source: 'live' | 'fallback';

	if (live === null) {
		releases = keepLastGood();
		source = 'fallback';
	} else {
		releases = live
			.filter((r) => !r.draft)
			.map<ReleaseEntry>((r) => ({
				tag: r.tag_name,
				title: r.name && r.name.length > 0 ? r.name : r.tag_name,
				body: r.body ?? '',
				date: (r.published_at ?? r.created_at ?? new Date().toISOString()).slice(0, 10),
				prerelease: r.prerelease,
				url: r.html_url
			}))
			.sort((a, b) => b.date.localeCompare(a.date));
		source = 'live';
	}

	mkdirSync(dirname(OUT_FILE), { recursive: true });
	writeFileSync(
		OUT_FILE,
		JSON.stringify({ generatedAt: new Date().toISOString(), releases }, null, 2)
	);
	console.log(`✓ releases (${source}): ${releases.length} entries → ${OUT_FILE}`);
}

await main();
