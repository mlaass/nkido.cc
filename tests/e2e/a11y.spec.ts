import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
	{ path: '/getting-started', label: 'getting-started' },
	{ path: '/docs/reference/builtins/filters', label: 'reference leaf' }
];

for (const { path, label } of PAGES) {
	test(`axe: ${label} has no serious or critical violations`, async ({ page }) => {
		await page.goto(path, { waitUntil: 'networkidle' });

		const results = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
			.analyze();

		const blocking = results.violations.filter(
			(v) => v.impact === 'serious' || v.impact === 'critical'
		);

		if (blocking.length > 0) {
			console.error(
				`axe violations on ${path}:\n` +
					blocking
						.map(
							(v) =>
								`  [${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes
									.map((n) => n.target.join(' '))
									.join('\n    ')}`
						)
						.join('\n')
			);
		}

		expect(blocking, `serious/critical axe violations on ${path}`).toEqual([]);
	});
}
