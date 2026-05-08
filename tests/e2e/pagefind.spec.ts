import { test, expect, type Page } from '@playwright/test';

// Pagefind ranking smoke-tests, per PRD §13.4. The search UI is the
// `SearchBox.svelte` component; we drive the real component rather than
// loading the Pagefind index in Node, so the assertion mirrors what a
// reader experiences.

async function search(page: Page, query: string): Promise<string[]> {
	// /docs (hub) intentionally renders without the sidebar, which is where
	// SearchBox lives. Navigate to a leaf doc page so the search trigger is
	// mounted and the `/` keyboard shortcut is registered.
	await page.goto('/docs/reference/builtins/filters', { waitUntil: 'networkidle' });

	const trigger = page.getByRole('button', { name: 'Search docs' }).first();
	await trigger.click();

	const input = page.locator('div[role="dialog"] input[type="search"]');
	await input.waitFor({ state: 'visible' });
	await input.fill(query);

	const resultLinks = page.locator('div[role="dialog"] .results ul li a');
	// The component debounces input by 120ms, then runs an async search; wait
	// until at least one result anchor is rendered before reading.
	await expect(resultLinks.first()).toBeVisible({ timeout: 5_000 });

	const hrefs = await resultLinks.evaluateAll((els) =>
		(els as HTMLAnchorElement[]).map((a) => a.getAttribute('href') ?? '')
	);
	return hrefs;
}

test('top hit for "kick" is the cookbook', async ({ page }) => {
	const hrefs = await search(page, 'kick');
	expect(hrefs[0], `top hit for "kick" should be cookbook, got: ${hrefs.join(' | ')}`).toContain(
		'/docs/tutorials/cookbook'
	);
});

test('top hit for "tidal" is the migrating page', async ({ page }) => {
	const hrefs = await search(page, 'tidal');
	expect(hrefs[0], `top hit for "tidal" should be migrating, got: ${hrefs.join(' | ')}`).toContain(
		'/docs/tutorials/migrating'
	);
});

test('top hit for "DAG" is signals; thinking-in-nkido in top 5', async ({ page }) => {
	const hrefs = await search(page, 'DAG');
	expect(hrefs[0], `top hit for "DAG" should be signals, got: ${hrefs.join(' | ')}`).toContain(
		'/docs/concepts/signals'
	);
	const top5 = hrefs.slice(0, 5).join('\n');
	expect(top5, `thinking-in-nkido should be in top 5 for "DAG", got:\n${top5}`).toContain(
		'/docs/concepts/thinking-in-nkido'
	);
});

test('top hit for "bitcrush" is the distortion reference', async ({ page }) => {
	const hrefs = await search(page, 'bitcrush');
	expect(
		hrefs[0],
		`top hit for "bitcrush" should be distortion, got: ${hrefs.join(' | ')}`
	).toContain('/docs/reference/builtins/distortion');
});
