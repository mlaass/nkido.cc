import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import SidebarTree from './SidebarTree.svelte';

const pageState = { url: { pathname: '/docs/reference/builtins/filters' } };

vi.mock('$app/state', () => ({
	get page() {
		return pageState;
	}
}));

const tree = {
	concepts: [
		{ title: 'Signals and DAGs', slug: 'signals', url: '/docs/concepts/signals' },
		{ title: 'Hot-swap explained', slug: 'hot-swap', url: '/docs/concepts/hot-swap' }
	],
	tutorials: [{ title: 'Hello Sine', slug: 'hello-sine', url: '/docs/tutorials/hello-sine' }],
	reference: {
		builtins: [
			{
				slug: 'frequency',
				label: 'Frequency',
				entries: [
					{ title: 'Filters', slug: 'filters', url: '/docs/reference/builtins/filters' },
					{ title: 'Oscillators', slug: 'oscillators', url: '/docs/reference/builtins/oscillators' }
				]
			},
			{
				slug: 'nonlinear',
				label: 'Nonlinear',
				entries: [
					{ title: 'Distortion', slug: 'distortion', url: '/docs/reference/builtins/distortion' }
				]
			}
		],
		language: [
			{
				slug: 'syntax',
				label: 'Syntax',
				entries: [
					{ title: 'Operators', slug: 'operators', url: '/docs/reference/language/operators' }
				]
			}
		],
		'mini-notation': [
			{
				slug: 'patterns',
				label: 'Patterns',
				entries: [
					{ title: 'Basics', slug: 'basics', url: '/docs/reference/mini-notation/basics' }
				]
			}
		]
	}
} as const;

const referenceTopOrder = ['builtins', 'language', 'mini-notation'] as const;
const referenceTopLabels = {
	builtins: 'Builtins',
	language: 'Language',
	'mini-notation': 'Mini-notation'
};

beforeEach(() => {
	pageState.url = { pathname: '/docs/reference/builtins/filters' } as Location;
	try {
		localStorage.clear();
	} catch {
		// happy-dom may not have it; ignore
	}
});

describe('SidebarTree — concepts/tutorials sections', () => {
	it('marks the active concept leaf with aria-current="page"', () => {
		pageState.url = { pathname: '/docs/concepts/signals' } as Location;
		const { container } = render(SidebarTree, {
			section: 'concepts',
			tree: tree as never,
			referenceTopOrder: referenceTopOrder as unknown as Array<keyof typeof tree.reference>,
			referenceTopLabels
		});
		const current = container.querySelectorAll('a[aria-current="page"]');
		expect(current.length).toBe(1);
		expect(current[0].getAttribute('href')).toBe('/docs/concepts/signals');
	});

	it('does not mark any leaf when the current path is not in the tree', () => {
		pageState.url = { pathname: '/docs/concepts/missing' } as Location;
		const { container } = render(SidebarTree, {
			section: 'concepts',
			tree: tree as never,
			referenceTopOrder: referenceTopOrder as unknown as Array<keyof typeof tree.reference>,
			referenceTopLabels
		});
		expect(container.querySelectorAll('a[aria-current="page"]').length).toBe(0);
	});
});

describe('SidebarTree — reference section a11y', () => {
	it('top toggle aria-controls points at the subgroup list id', () => {
		const { container } = render(SidebarTree, {
			section: 'reference',
			tree: tree as never,
			referenceTopOrder: referenceTopOrder as unknown as Array<keyof typeof tree.reference>,
			referenceTopLabels
		});
		// Active leaf is /docs/reference/builtins/filters → builtins top + frequency sub auto-open.
		const topToggle = container.querySelector(
			'button.top-toggle[aria-controls="sidebar-top-builtins"]'
		);
		expect(topToggle).toBeTruthy();
		expect(topToggle?.getAttribute('aria-expanded')).toBe('true');
		expect(container.querySelector('ul#sidebar-top-builtins')).toBeTruthy();
	});

	it('sub toggle aria-controls points at the leaves list id', () => {
		const { container } = render(SidebarTree, {
			section: 'reference',
			tree: tree as never,
			referenceTopOrder: referenceTopOrder as unknown as Array<keyof typeof tree.reference>,
			referenceTopLabels
		});
		const subToggle = container.querySelector(
			'button.sub-toggle[aria-controls="sidebar-sub-builtins-frequency"]'
		);
		expect(subToggle).toBeTruthy();
		expect(subToggle?.getAttribute('aria-expanded')).toBe('true');
		expect(container.querySelector('ul#sidebar-sub-builtins-frequency')).toBeTruthy();
	});

	it('inactive top group is collapsed and toggles on click', async () => {
		const { container } = render(SidebarTree, {
			section: 'reference',
			tree: tree as never,
			referenceTopOrder: referenceTopOrder as unknown as Array<keyof typeof tree.reference>,
			referenceTopLabels
		});
		const langToggle = container.querySelector(
			'button.top-toggle[aria-controls="sidebar-top-language"]'
		) as HTMLButtonElement;
		expect(langToggle).toBeTruthy();
		expect(langToggle.getAttribute('aria-expanded')).toBe('false');
		// Panel is not rendered yet (closed).
		expect(container.querySelector('ul#sidebar-top-language')).toBeNull();

		await fireEvent.click(langToggle);
		expect(langToggle.getAttribute('aria-expanded')).toBe('true');
		expect(container.querySelector('ul#sidebar-top-language')).toBeTruthy();
	});

	it('marks the active reference leaf with aria-current="page"', () => {
		const { container } = render(SidebarTree, {
			section: 'reference',
			tree: tree as never,
			referenceTopOrder: referenceTopOrder as unknown as Array<keyof typeof tree.reference>,
			referenceTopLabels
		});
		const current = container.querySelectorAll('a[aria-current="page"]');
		expect(current.length).toBe(1);
		expect(current[0].getAttribute('href')).toBe('/docs/reference/builtins/filters');
	});
});
