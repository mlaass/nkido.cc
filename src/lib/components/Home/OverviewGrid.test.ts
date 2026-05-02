import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import OverviewGrid from './OverviewGrid.svelte';

// The component imports overview.json statically. We mock the import so the
// snapshot is stable regardless of the real manifest's churn.
vi.mock('$lib/data/overview.json', () => ({
	default: {
		generatedAt: '2026-01-01T00:00:00.000Z',
		groups: [
			{
				id: 'instruments',
				heading: 'Instruments',
				cards: [
					{
						slug: 'oscillators',
						title: 'Oscillators',
						description: 'Generate periodic waveforms.',
						url: '/docs/reference/builtins/oscillators',
						icon: 'Waves',
						chips: [
							{ keyword: 'osc', anchor: 'osc', href: '/docs/reference/builtins/oscillators#osc' },
							{
								keyword: 'noise',
								anchor: 'noise',
								href: '/docs/reference/builtins/oscillators#noise'
							}
						]
					}
				]
			},
			{
				id: 'effects',
				heading: 'Effects',
				cards: [
					{
						slug: 'filters',
						title: 'Filters',
						description: 'Shape frequency content.',
						url: '/docs/reference/builtins/filters',
						icon: 'Sliders',
						chips: []
					}
				]
			},
			{
				id: 'sequencing',
				heading: 'Sequencing',
				cards: []
			},
			{
				id: 'visualizations',
				heading: 'Visualizations',
				cards: []
			},
			{
				id: 'language',
				heading: 'Language',
				cards: []
			},
			{
				id: 'tools',
				heading: 'Tools',
				cards: []
			}
		]
	}
}));

describe('OverviewGrid', () => {
	it('renders the section header, group headings, and footer CTA', () => {
		const { container, getByText, getAllByRole } = render(OverviewGrid);

		expect(getByText("What's in the box")).toBeTruthy();
		expect(getByText(/95\+ DSP opcodes/)).toBeTruthy();

		const groupHeadings = getAllByRole('button', { expanded: true });
		expect(groupHeadings).toHaveLength(6);

		expect(getByText('View full reference →')).toBeTruthy();
		expect(container.querySelector('.overview-card')).toBeTruthy();
	});

	it('renders empty groups with a "Coming soon" placeholder', () => {
		const { getAllByText } = render(OverviewGrid);
		// 4 of 6 groups are empty in the fixture (sequencing, visualizations,
		// language, tools).
		expect(getAllByText(/Coming soon/i)).toHaveLength(4);
	});

	it('renders cards as links pointing at the doc url', () => {
		const { container } = render(OverviewGrid);
		const titleLink = container.querySelector('.overview-title a') as HTMLAnchorElement | null;
		expect(titleLink?.getAttribute('href')).toBe('/docs/reference/builtins/oscillators');
	});

	it('renders chips as anchor links', () => {
		const { container } = render(OverviewGrid);
		const chips = container.querySelectorAll('.chip');
		expect(chips.length).toBeGreaterThan(0);
		expect((chips[0] as HTMLAnchorElement).href).toContain('#osc');
	});

	it('matches the rendered DOM snapshot', () => {
		const { container } = render(OverviewGrid);
		expect(container.innerHTML).toMatchSnapshot();
	});
});
