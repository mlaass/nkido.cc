import { describe, it, expect } from 'vitest';
import { resolveHeadings, shouldRenderTOC, nestHeadings, tocSlugs } from './headings';

const manifest = {
	entries: {
		concepts: [
			{
				url: '/docs/concepts/signals',
				headings: [
					{ slug: 'a', text: 'A', depth: 2 },
					{ slug: 'a1', text: 'A1', depth: 3 },
					{ slug: 'b', text: 'B', depth: 2 },
					{ slug: 'c', text: 'C', depth: 2 }
				]
			},
			{ url: '/docs/concepts/short', headings: [{ slug: 'only', text: 'Only', depth: 2 }] },
			{ url: '/docs/concepts/no-headings' }
		],
		tutorials: [
			{ url: '/docs/tutorials/hello-sine', headings: [{ slug: 'h', text: 'H', depth: 2 }] }
		],
		'reference/builtins': [
			{
				url: '/docs/reference/builtins/distortion',
				headings: [
					{ slug: 'one', text: 'One', depth: 2 },
					{ slug: 'two', text: 'Two', depth: 2 },
					{ slug: 'three', text: 'Three', depth: 2 }
				]
			}
		]
	}
};

describe('resolveHeadings', () => {
	it('finds a concept entry by exact URL match', () => {
		const h = resolveHeadings('/docs/concepts/signals', manifest);
		expect(h).toHaveLength(4);
		expect(h[0].slug).toBe('a');
	});

	it('finds a reference leaf entry', () => {
		const h = resolveHeadings('/docs/reference/builtins/distortion', manifest);
		expect(h.map((x) => x.slug)).toEqual(['one', 'two', 'three']);
	});

	it('returns [] when entry is missing', () => {
		expect(resolveHeadings('/docs/nope', manifest)).toEqual([]);
	});

	it('returns [] when entry has no headings field', () => {
		expect(resolveHeadings('/docs/concepts/no-headings', manifest)).toEqual([]);
	});

	it('tolerates a trailing slash on the input pathname', () => {
		const h = resolveHeadings('/docs/concepts/signals/', manifest);
		expect(h).toHaveLength(4);
	});
});

describe('shouldRenderTOC', () => {
	it('is false for 0 H2s', () => {
		expect(shouldRenderTOC([])).toBe(false);
	});

	it('is false for 1 H2', () => {
		expect(shouldRenderTOC([{ slug: 'a', text: 'A', depth: 2 }])).toBe(false);
	});

	it('is false for 2 H2s', () => {
		expect(
			shouldRenderTOC([
				{ slug: 'a', text: 'A', depth: 2 },
				{ slug: 'b', text: 'B', depth: 2 }
			])
		).toBe(false);
	});

	it('is true for 3 H2s', () => {
		expect(
			shouldRenderTOC([
				{ slug: 'a', text: 'A', depth: 2 },
				{ slug: 'b', text: 'B', depth: 2 },
				{ slug: 'c', text: 'C', depth: 2 }
			])
		).toBe(true);
	});

	it('does not count H3s toward the threshold', () => {
		expect(
			shouldRenderTOC([
				{ slug: 'a', text: 'A', depth: 2 },
				{ slug: 'b', text: 'B', depth: 3 },
				{ slug: 'c', text: 'C', depth: 3 },
				{ slug: 'd', text: 'D', depth: 3 }
			])
		).toBe(false);
	});
});

describe('nestHeadings', () => {
	it('groups H3s under the preceding H2', () => {
		const nested = nestHeadings([
			{ slug: 'a', text: 'A', depth: 2 },
			{ slug: 'a1', text: 'A1', depth: 3 },
			{ slug: 'a2', text: 'A2', depth: 3 },
			{ slug: 'b', text: 'B', depth: 2 },
			{ slug: 'b1', text: 'B1', depth: 3 }
		]);
		expect(nested).toHaveLength(2);
		expect(nested[0].children.map((c) => c.slug)).toEqual(['a1', 'a2']);
		expect(nested[1].children.map((c) => c.slug)).toEqual(['b1']);
	});

	it('ignores H4+ headings', () => {
		const nested = nestHeadings([
			{ slug: 'a', text: 'A', depth: 2 },
			{ slug: 'a1', text: 'A1', depth: 3 },
			{ slug: 'a1a', text: 'A1A', depth: 4 },
			{ slug: 'a1b', text: 'A1B', depth: 5 }
		]);
		expect(nested).toHaveLength(1);
		expect(nested[0].children.map((c) => c.slug)).toEqual(['a1']);
	});

	it('drops orphan H3s with no preceding H2', () => {
		const nested = nestHeadings([
			{ slug: 'orphan', text: 'Orphan', depth: 3 },
			{ slug: 'a', text: 'A', depth: 2 },
			{ slug: 'a1', text: 'A1', depth: 3 }
		]);
		expect(nested).toHaveLength(1);
		expect(nested[0].slug).toBe('a');
		expect(nested[0].children.map((c) => c.slug)).toEqual(['a1']);
	});
});

describe('tocSlugs', () => {
	it('returns slugs of H2 and H3 headings only', () => {
		expect(
			tocSlugs([
				{ slug: 'a', text: 'A', depth: 2 },
				{ slug: 'a1', text: 'A1', depth: 3 },
				{ slug: 'a1a', text: 'A1A', depth: 4 },
				{ slug: 'b', text: 'B', depth: 2 }
			])
		).toEqual(['a', 'a1', 'b']);
	});
});
