import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import DocsTOC from './DocsTOC.svelte';
import { tocSpy } from './toc-spy.svelte';

// attachTocSpy uses IntersectionObserver under the hood, which doesn't
// exist in happy-dom. Stub it to a no-op and replace tocSpy with a plain
// object — assertions check the rendered DOM after we set tocSpy.active
// before render(), so reactivity inside the test isn't required.
vi.mock('./toc-spy.svelte', () => {
	const tocSpy: { active: string | null } = { active: null };
	return {
		tocSpy,
		attachTocSpy: () => () => {}
	};
});

const headings = [
	{ slug: 'intro', text: 'Intro', depth: 2 },
	{ slug: 'usage', text: 'Usage', depth: 2 },
	{ slug: 'usage-quick', text: 'Quick start', depth: 3 },
	{ slug: 'caveats', text: 'Caveats', depth: 2 }
];

beforeEach(() => {
	tocSpy.active = null;
});

describe('DocsTOC — sidebar position', () => {
	it('renders nav with aria-label="On this page"', () => {
		const { container } = render(DocsTOC, { headings, position: 'sidebar' });
		const nav = container.querySelector('nav.toc-sidebar');
		expect(nav).toBeTruthy();
		expect(nav?.getAttribute('aria-label')).toBe('On this page');
	});

	it('marks exactly one link with aria-current="location" when active matches a heading', () => {
		tocSpy.active = 'usage';
		const { container } = render(DocsTOC, { headings, position: 'sidebar' });
		const current = container.querySelectorAll('a[aria-current="location"]');
		expect(current.length).toBe(1);
		expect(current[0].getAttribute('href')).toBe('#usage');
	});

	it('marks a nested H3 with aria-current="location" when it is active', () => {
		tocSpy.active = 'usage-quick';
		const { container } = render(DocsTOC, { headings, position: 'sidebar' });
		const current = container.querySelectorAll('a[aria-current="location"]');
		expect(current.length).toBe(1);
		expect(current[0].getAttribute('href')).toBe('#usage-quick');
	});

	it('renders no aria-current when no heading is active', () => {
		const { container } = render(DocsTOC, { headings, position: 'sidebar' });
		expect(container.querySelectorAll('a[aria-current]').length).toBe(0);
	});
});

describe('DocsTOC — inline position', () => {
	it('renders details with aria-current on active link', () => {
		tocSpy.active = 'caveats';
		const { container } = render(DocsTOC, { headings, position: 'inline' });
		expect(container.querySelector('details.toc-inline')).toBeTruthy();
		const current = container.querySelectorAll('a[aria-current="location"]');
		expect(current.length).toBe(1);
		expect(current[0].getAttribute('href')).toBe('#caveats');
	});
});
