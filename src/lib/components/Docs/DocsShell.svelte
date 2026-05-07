<script lang="ts">
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import { Menu } from 'lucide-svelte';
	import DocsSidebar from './DocsSidebar.svelte';
	import DocsBreadcrumb from './DocsBreadcrumb.svelte';
	import MobileDrawer from './MobileDrawer.svelte';
	import DocsTOC from './DocsTOC.svelte';
	import { DOCS_SHELL_KEY, type DocsShellContext } from './docs-shell-context';
	import { resolveHeadings, shouldRenderTOC } from './headings';
	import manifest from '$lib/data/docs-manifest.json';

	type Section = 'concepts' | 'tutorials' | 'reference';

	let { children }: { children: import('svelte').Snippet } = $props();

	setContext<DocsShellContext>(DOCS_SHELL_KEY, { inDocsShell: true });

	const HUB_PATHS = new Set([
		'/docs',
		'/docs/concepts',
		'/docs/tutorials',
		'/docs/reference',
		'/docs/reference/builtins',
		'/docs/reference/language',
		'/docs/reference/mini-notation'
	]);

	const normalizedPath = $derived(page.url.pathname.replace(/\/$/, '') || '/');

	const section = $derived.by<Section | null>(() => {
		const p = normalizedPath;
		if (p === '/docs') return null;
		if (p.startsWith('/docs/concepts')) return 'concepts';
		if (p.startsWith('/docs/tutorials')) return 'tutorials';
		if (p.startsWith('/docs/reference')) return 'reference';
		return null;
	});

	const isHub = $derived(HUB_PATHS.has(normalizedPath));
	const headings = $derived(resolveHeadings(normalizedPath, manifest));
	const hasTOC = $derived(!isHub && shouldRenderTOC(headings));

	let drawerOpen = $state(false);
</script>

{#if section === null}
	{@render children()}
{:else}
	<div class="docs-shell" class:has-toc={hasTOC}>
		<aside class="sidebar-desktop">
			<DocsSidebar {section} />
		</aside>

		<div class="content-col">
			<header class="content-header">
				<button
					class="drawer-toggle"
					type="button"
					onclick={() => (drawerOpen = true)}
					aria-label="Open docs menu"
				>
					<Menu size={16} />
					<span>Docs menu</span>
				</button>
				{#if !isHub}
					<DocsBreadcrumb />
				{/if}
				{#if hasTOC}
					<DocsTOC {headings} position="inline" />
				{/if}
			</header>

			<main class="content-body" data-pagefind-body data-toc-root>
				{@render children()}
			</main>
		</div>

		{#if hasTOC}
			<aside class="toc-desktop">
				<DocsTOC {headings} position="sidebar" />
			</aside>
		{/if}

		<MobileDrawer bind:open={drawerOpen}>
			<DocsSidebar {section} />
		</MobileDrawer>
	</div>
{/if}

<style>
	.docs-shell {
		display: grid;
		grid-template-columns: 260px 1fr;
		gap: var(--spacing-xl);
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--content-padding);
		flex: 1;
		width: 100%;
	}

	.sidebar-desktop {
		position: sticky;
		top: var(--header-height, 64px);
		align-self: start;
		max-height: calc(100vh - var(--header-height, 64px));
		overflow-y: auto;
		padding-top: var(--spacing-md);
		padding-bottom: var(--spacing-lg);
	}

	.toc-desktop {
		display: none;
		position: sticky;
		top: var(--header-height, 64px);
		align-self: start;
		max-height: calc(100vh - var(--header-height, 64px));
		overflow-y: auto;
		padding-top: var(--spacing-md);
		padding-bottom: var(--spacing-lg);
	}

	.content-col {
		min-width: 0;
		display: flex;
		flex-direction: column;
	}

	.content-header {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) 0 var(--spacing-sm);
	}

	.content-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.drawer-toggle {
		display: none;
		align-items: center;
		gap: var(--spacing-xs);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		border-radius: 6px;
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.875rem;
		color: var(--text-secondary);
		cursor: pointer;
		align-self: flex-start;
	}

	.drawer-toggle:hover {
		color: var(--text-primary);
		border-color: var(--border-default);
	}

	@media (min-width: 1280px) {
		.docs-shell.has-toc {
			grid-template-columns: 260px minmax(0, 1fr) 220px;
		}
		.docs-shell.has-toc .toc-desktop {
			display: block;
		}
		.docs-shell.has-toc :global(.toc-inline) {
			display: none;
		}
	}

	@media (max-width: 1023px) {
		.docs-shell {
			grid-template-columns: 1fr;
		}
		.sidebar-desktop {
			display: none;
		}
		.drawer-toggle {
			display: inline-flex;
		}
	}

	@media print {
		.sidebar-desktop,
		.toc-desktop,
		.drawer-toggle {
			display: none;
		}
		.docs-shell,
		.docs-shell.has-toc {
			grid-template-columns: 1fr;
		}
		:global(.toc-inline) {
			display: none;
		}
	}
</style>
