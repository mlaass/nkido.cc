import { describe, it, expect } from 'vitest';
import { computeBreadcrumb } from './breadcrumb';

const manifest = {
	entries: {
		concepts: [
			{ title: 'Signals and DAGs', slug: 'signals', url: '/docs/concepts/signals' },
			{ title: 'Hot-swap explained', slug: 'hot-swap', url: '/docs/concepts/hot-swap' },
			{ title: 'Mini-notation', slug: 'mini-notation', url: '/docs/concepts/mini-notation' }
		],
		tutorials: [
			{ title: 'Hello Sine', slug: 'hello-sine', url: '/docs/tutorials/hello-sine' }
		],
		'reference/builtins': [
			{ title: 'Filters', slug: 'filters', url: '/docs/reference/builtins/filters' },
			{ title: 'Distortion', slug: 'distortion', url: '/docs/reference/builtins/distortion' }
		],
		'reference/language': [
			{ title: 'Operators', slug: 'operators', url: '/docs/reference/language/operators' }
		],
		'reference/mini-notation': [
			{ title: 'Basics', slug: 'basics', url: '/docs/reference/mini-notation/basics' }
		]
	}
};

describe('computeBreadcrumb', () => {
	it('builds 4 segments for a reference leaf path', () => {
		const segs = computeBreadcrumb('/docs/reference/builtins/filters', manifest);
		expect(segs).toEqual([
			{ label: 'Docs', href: '/docs', current: false },
			{ label: 'Reference', href: '/docs/reference', current: false },
			{ label: 'Builtins', href: '/docs/reference/builtins', current: false },
			{ label: 'Filters', href: '/docs/reference/builtins/filters', current: true }
		]);
	});

	it('builds 3 segments for a concept page using manifest title', () => {
		const segs = computeBreadcrumb('/docs/concepts/signals', manifest);
		expect(segs).toEqual([
			{ label: 'Docs', href: '/docs', current: false },
			{ label: 'Concepts', href: '/docs/concepts', current: false },
			{ label: 'Signals and DAGs', href: '/docs/concepts/signals', current: true }
		]);
	});

	it('builds 3 segments for a tutorial page', () => {
		const segs = computeBreadcrumb('/docs/tutorials/hello-sine', manifest);
		expect(segs).toEqual([
			{ label: 'Docs', href: '/docs', current: false },
			{ label: 'Tutorials', href: '/docs/tutorials', current: false },
			{ label: 'Hello Sine', href: '/docs/tutorials/hello-sine', current: true }
		]);
	});

	it('hyphenates Mini-notation top-level label correctly', () => {
		const segs = computeBreadcrumb('/docs/reference/mini-notation/basics', manifest);
		expect(segs.map((s) => s.label)).toEqual(['Docs', 'Reference', 'Mini-notation', 'Basics']);
	});

	it('marks reference top-level hub as current when leaf is missing', () => {
		const segs = computeBreadcrumb('/docs/reference/builtins', manifest);
		expect(segs).toEqual([
			{ label: 'Docs', href: '/docs', current: false },
			{ label: 'Reference', href: '/docs/reference', current: false },
			{ label: 'Builtins', href: '/docs/reference/builtins', current: true }
		]);
	});

	it('marks reference root hub as current', () => {
		const segs = computeBreadcrumb('/docs/reference', manifest);
		expect(segs).toEqual([
			{ label: 'Docs', href: '/docs', current: false },
			{ label: 'Reference', href: '/docs/reference', current: true }
		]);
	});

	it('marks concepts hub as current when no leaf', () => {
		const segs = computeBreadcrumb('/docs/concepts', manifest);
		expect(segs).toEqual([
			{ label: 'Docs', href: '/docs', current: false },
			{ label: 'Concepts', href: '/docs/concepts', current: true }
		]);
	});

	it('marks /docs itself as current', () => {
		const segs = computeBreadcrumb('/docs', manifest);
		expect(segs).toEqual([{ label: 'Docs', href: '/docs', current: true }]);
	});

	it('falls back to slug when manifest entry is missing', () => {
		const segs = computeBreadcrumb('/docs/concepts/unknown-page', manifest);
		expect(segs[2]).toEqual({
			label: 'unknown-page',
			href: '/docs/concepts/unknown-page',
			current: true
		});
	});

	it('tolerates trailing slashes', () => {
		const segs = computeBreadcrumb('/docs/concepts/signals/', manifest);
		expect(segs[2].label).toBe('Signals and DAGs');
		expect(segs[2].current).toBe(true);
	});
});
