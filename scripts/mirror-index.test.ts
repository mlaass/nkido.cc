import { describe, it, expect, afterAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join as joinFsPath } from 'node:path';
import { discoverEntries, SLUG_OVERRIDES } from './mirror-index';

function makeFixtureRoot(): string {
	const root = mkdtempSync(joinFsPath(tmpdir(), 'mirror-index-test-'));
	const docsRoot = joinFsPath(root, 'web/static/docs');
	mkdirSync(docsRoot, { recursive: true });

	// reference / builtins / oscillators.md
	mkdirSync(joinFsPath(docsRoot, 'reference/builtins'), { recursive: true });
	writeFileSync(joinFsPath(docsRoot, 'reference/builtins/oscillators.md'), '---\ntitle: Oscillators\n---\n');

	// reference / pattern / literals.md  (new subcategory)
	mkdirSync(joinFsPath(docsRoot, 'reference/pattern'), { recursive: true });
	writeFileSync(joinFsPath(docsRoot, 'reference/pattern/literals.md'), '---\ntitle: Pattern Literals\n---\n');

	// tutorials / 06-pattern-modulation.md  (NN- prefix stripped)
	mkdirSync(joinFsPath(docsRoot, 'tutorials'), { recursive: true });
	writeFileSync(joinFsPath(docsRoot, 'tutorials/06-pattern-modulation.md'), '---\ntitle: Pattern Modulation\n---\n');

	// concepts / signals.md  (slug override → mono-stereo-signals)
	mkdirSync(joinFsPath(docsRoot, 'concepts'), { recursive: true });
	writeFileSync(joinFsPath(docsRoot, 'concepts/signals.md'), '---\ntitle: Mono & Stereo Signals\n---\n');

	// non-md file should be skipped
	writeFileSync(joinFsPath(docsRoot, 'reference/builtins/notes.txt'), 'ignore me');

	// dotfile should be skipped
	writeFileSync(joinFsPath(docsRoot, 'reference/builtins/.hidden.md'), '---\ntitle: hidden\n---\n');

	return root;
}

const cleanups: string[] = [];
afterAll(() => {
	for (const dir of cleanups) {
		try {
			rmSync(dir, { recursive: true, force: true });
		} catch {
			// best-effort
		}
	}
});

describe('discoverEntries', () => {
	it('walks the upstream tree and emits one entry per .md file', () => {
		const root = makeFixtureRoot();
		cleanups.push(root);

		const entries = discoverEntries(root);

		// 4 .md files (the .txt and dotfile are skipped).
		expect(entries.length).toBe(4);

		const byUpstream = Object.fromEntries(entries.map((e) => [e.upstream, e]));

		expect(byUpstream['web/static/docs/reference/builtins/oscillators.md']).toEqual({
			upstream: 'web/static/docs/reference/builtins/oscillators.md',
			category: 'reference',
			subcategory: 'builtins',
			slug: 'oscillators'
		});

		// New subcategory `pattern` is derived from the directory layout.
		expect(byUpstream['web/static/docs/reference/pattern/literals.md']).toEqual({
			upstream: 'web/static/docs/reference/pattern/literals.md',
			category: 'reference',
			subcategory: 'pattern',
			slug: 'literals'
		});

		// Tutorials strip the leading `NN-` prefix from the slug.
		expect(byUpstream['web/static/docs/tutorials/06-pattern-modulation.md']).toEqual({
			upstream: 'web/static/docs/tutorials/06-pattern-modulation.md',
			category: 'tutorials',
			subcategory: '',
			slug: 'pattern-modulation'
		});

		// SLUG_OVERRIDES wins over the basename-derived default.
		expect(SLUG_OVERRIDES['web/static/docs/concepts/signals.md']).toBe('mono-stereo-signals');
		expect(byUpstream['web/static/docs/concepts/signals.md']).toEqual({
			upstream: 'web/static/docs/concepts/signals.md',
			category: 'concepts',
			subcategory: '',
			slug: 'mono-stereo-signals'
		});
	});

	it('returns deterministic order (category, subcategory, slug)', () => {
		const root = makeFixtureRoot();
		cleanups.push(root);

		const a = discoverEntries(root);
		const b = discoverEntries(root);
		expect(a.map((e) => e.upstream)).toEqual(b.map((e) => e.upstream));

		// concepts < reference < tutorials by category alphabetical.
		const cats = a.map((e) => e.category);
		const sortedCats = [...cats].sort();
		expect(cats).toEqual(sortedCats);
	});

	it('returns an empty array when the upstream docs root is missing', () => {
		const empty = mkdtempSync(joinFsPath(tmpdir(), 'mirror-index-empty-'));
		cleanups.push(empty);
		// No web/static/docs/ created.
		expect(discoverEntries(empty)).toEqual([]);
	});
});
