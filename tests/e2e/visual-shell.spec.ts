import { test, expect } from '@playwright/test';

const PATH = '/docs/reference/builtins/filters';

for (const scheme of ['light', 'dark'] as const) {
	test(`docs shell renders cleanly in ${scheme} color scheme`, async ({ page }) => {
		await page.emulateMedia({ colorScheme: scheme });
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto(PATH, { waitUntil: 'networkidle' });

		// All three landmarks should be present and visible at desktop width.
		await expect(
			page.locator('nav[aria-label="Documentation navigation"]')
		).toBeVisible();
		await expect(page.locator('nav[aria-label="On this page"]')).toBeVisible();
		await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();

		// The active leaf must surface aria-current="page" — proves the page
		// matched the sidebar tree at this URL.
		const activeLeaf = page.locator('a[aria-current="page"]');
		await expect(activeLeaf).toHaveCount(1);
		await expect(activeLeaf).toHaveAttribute('href', PATH);

		// At 1280×800 the layout must not require horizontal scroll.
		const overflow = await page.evaluate(() => ({
			scrollWidth: document.documentElement.scrollWidth,
			clientWidth: document.documentElement.clientWidth
		}));
		expect(
			overflow.scrollWidth,
			`horizontal overflow at 1280px in ${scheme} mode (scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth})`
		).toBeLessThanOrEqual(overflow.clientWidth);
	});
}

test('mobile drawer toggle replaces sidebar at 1023px', async ({ page }) => {
	await page.setViewportSize({ width: 1023, height: 800 });
	await page.goto(PATH, { waitUntil: 'networkidle' });

	// At narrow widths the inline sidebar is hidden; a Menu button is exposed.
	const menuButton = page.getByRole('button', { name: /menu/i }).first();
	await expect(menuButton).toBeVisible();
});
