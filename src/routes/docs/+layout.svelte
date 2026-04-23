<script lang="ts">
	import { page } from '$app/state';
	import SearchBox from '$lib/components/Docs/SearchBox.svelte';

	let { children } = $props();

	const sections = [
		{ label: 'Concepts', href: '/docs/concepts' },
		{ label: 'Tutorials', href: '/docs/tutorials' },
		{ label: 'Reference', href: '/docs/reference' }
	];

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/docs/concepts') return path.startsWith('/docs/concepts');
		if (href === '/docs/tutorials') return path.startsWith('/docs/tutorials');
		if (href === '/docs/reference') return path.startsWith('/docs/reference');
		return false;
	}
</script>

<div class="docs-shell">
	<nav class="docs-nav" aria-label="Docs sections">
		<div class="docs-nav-inner">
			<div class="tabs">
				{#each sections as s}
					<a href={s.href} class:active={isActive(s.href)}>{s.label}</a>
				{/each}
			</div>
			<SearchBox />
		</div>
	</nav>
	<div class="docs-content" data-pagefind-body>
		{@render children()}
	</div>
</div>

<style>
	.docs-shell {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.docs-nav {
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-muted);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.docs-nav-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: var(--spacing-sm) var(--content-padding);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
	}

	.tabs {
		display: flex;
		gap: var(--spacing-sm);
	}

	.tabs a {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.875rem;
		color: var(--text-secondary);
		border-radius: 6px;
	}

	.tabs a:hover {
		color: var(--text-primary);
		text-decoration: none;
		background: var(--bg-tertiary);
	}

	.tabs a.active {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}

	.docs-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	@media (max-width: 640px) {
		.docs-nav-inner {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-sm);
		}

		.tabs {
			justify-content: center;
		}
	}
</style>
