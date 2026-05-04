import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import OverviewGrid from './OverviewGrid.svelte';

// The component imports overview.json statically. Mock it so the fixture
// covers v2 shape (groups → subgroups → cards) and exercises every render path:
// flat group, nested groups, atomic + sub-feature cards, with/without snippet,
// custom + default icon, anchorMatched true & false.
vi.mock('$lib/data/overview.json', () => ({
	default: {
		generatedAt: '2026-01-01T00:00:00.000Z',
		groups: [
			{
				id: 'instruments',
				heading: 'Instruments',
				subgroups: [
					{
						id: 'synthesis',
						heading: 'Synthesis',
						cards: [
							{
								name: 'Oscillators',
								tagline: 'Periodic waveforms.',
								url: '/docs/reference/builtins/oscillators',
								icon: 'Waves',
								source: {
									docSlug: 'oscillators',
									docCategory: 'reference/builtins',
									anchorMatched: true
								}
							}
						]
					}
				]
			},
			{
				id: 'effects',
				heading: 'Effects',
				subgroups: [
					{
						id: 'frequency',
						heading: 'Frequency',
						cards: [
							{
								name: 'Lowpass',
								tagline: 'Resonant low-pass.',
								url: '/docs/reference/builtins/filters#lp',
								icon: 'Sliders',
								snippet: 'saw 110 -> lp 800 .5',
								source: {
									docSlug: 'filters',
									docCategory: 'reference/builtins',
									anchor: 'lp',
									anchorMatched: true
								}
							},
							{
								name: 'Highpass',
								tagline: 'Resonant high-pass.',
								url: '/docs/reference/builtins/filters#hp',
								icon: 'Sliders',
								source: {
									docSlug: 'filters',
									docCategory: 'reference/builtins',
									anchor: 'hp',
									anchorMatched: true
								}
							}
						]
					},
					{
						id: 'nonlinear',
						heading: 'Nonlinear',
						cards: [
							{
								name: 'Saturate',
								tagline: 'Tape-style saturation.',
								url: '/docs/reference/builtins/distortion#saturate',
								icon: 'Zap',
								snippet: 'saw 110 -> saturate .5',
								source: {
									docSlug: 'distortion',
									docCategory: 'reference/builtins',
									anchor: 'saturate',
									anchorMatched: true
								}
							},
							{
								name: 'Bitcrush',
								tagline: '8-bit lo-fi color.',
								url: '/docs/reference/builtins/distortion#bitcrush',
								icon: 'Binary', // per-subfeature override
								snippet: 'noise -> bitcrush 4 .25',
								source: {
									docSlug: 'distortion',
									docCategory: 'reference/builtins',
									anchor: 'bitcrush',
									anchorMatched: true
								}
							},
							{
								name: 'Broken',
								tagline: 'Anchor mismatch.',
								url: '/docs/reference/builtins/distortion#missing',
								icon: 'Zap',
								source: {
									docSlug: 'distortion',
									docCategory: 'reference/builtins',
									anchor: 'missing',
									anchorMatched: false
								}
							}
						]
					}
				]
			},
			{
				id: 'visualizations',
				heading: 'Visualizations',
				subgroups: [
					{
						id: 'visualizations',
						heading: 'Visualizations',
						cards: [
							{
								name: 'Oscilloscope',
								tagline: 'Triggered time-domain.',
								url: '/docs/reference/builtins/oscilloscope',
								icon: 'LineChart',
								source: {
									docSlug: 'oscilloscope',
									docCategory: 'reference/builtins',
									anchorMatched: true
								}
							}
						]
					}
				]
			}
		]
	}
}));

describe('OverviewGrid', () => {
	it('renders the section header and footer CTA', () => {
		const { getByText } = render(OverviewGrid);
		expect(getByText("What's in the box")).toBeTruthy();
		expect(getByText(/sub-features across/)).toBeTruthy();
		expect(getByText('View full reference →')).toBeTruthy();
	});

	it('renders one filter pill per group plus an "All" pill', () => {
		const { container } = render(OverviewGrid);
		const pills = container.querySelectorAll('button.pill');
		// 3 groups in fixture + 1 "All".
		expect(pills.length).toBe(4);
		expect(pills[0].textContent?.trim()).toBe('All');
		expect(pills[0].getAttribute('aria-pressed')).toBe('true');
	});

	it('renders sub-group headings for non-flat groups only', () => {
		const { container } = render(OverviewGrid);
		const subgroupHeadings = Array.from(
			container.querySelectorAll('button.subgroup-heading')
		).map((el) => el.textContent?.trim());
		// Effects has 'Frequency' and 'Nonlinear'; Instruments has 'Synthesis'.
		// Visualizations is flat → no subgroup heading button.
		expect(subgroupHeadings).toEqual(['Synthesis', 'Frequency', 'Nonlinear']);
	});

	it('renders cards as anchor links to their URLs', () => {
		const { container } = render(OverviewGrid);
		const titleLinks = Array.from(
			container.querySelectorAll('.overview-title a')
		) as HTMLAnchorElement[];
		const hrefs = titleLinks.map((a) => a.getAttribute('href'));
		expect(hrefs).toContain('/docs/reference/builtins/distortion#saturate');
		expect(hrefs).toContain('/docs/reference/builtins/oscilloscope'); // atomic, no fragment
	});

	it('renders snippets only for cards that have them', () => {
		const { container } = render(OverviewGrid);
		const snippets = container.querySelectorAll('.overview-snippet');
		// Lowpass, Saturate, Bitcrush each have a snippet (3); Highpass, Broken,
		// Oscillators (atomic), Oscilloscope (atomic) don't.
		expect(snippets.length).toBe(3);
	});

	it('matches the rendered DOM snapshot', () => {
		const { container } = render(OverviewGrid);
		expect(container.innerHTML).toMatchSnapshot();
	});
});
