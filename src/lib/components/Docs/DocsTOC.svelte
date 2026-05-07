<script lang="ts">
	import { tocSpy, attachTocSpy } from './toc-spy.svelte';
	import { nestHeadings, shouldRenderTOC, tocSlugs, type Heading } from './headings';

	let {
		headings,
		position
	}: { headings: Heading[]; position: 'sidebar' | 'inline' } = $props();

	const visible = $derived(shouldRenderTOC(headings));
	const nested = $derived(nestHeadings(headings));
	const slugs = $derived(tocSlugs(headings));

	$effect(() => {
		if (!visible) return;
		const root = document.querySelector('[data-toc-root]');
		const detach = attachTocSpy(slugs, root);
		return detach;
	});
</script>

{#if visible}
	{#if position === 'sidebar'}
		<nav class="toc-sidebar" aria-label="On this page">
			<p class="toc-title">On this page</p>
			<ul>
				{#each nested as h (h.slug)}
					<li>
						<a href="#{h.slug}" data-active={tocSpy.active === h.slug}>{h.text}</a>
						{#if h.children.length > 0}
							<ul class="toc-children">
								{#each h.children as c (c.slug)}
									<li>
										<a href="#{c.slug}" data-active={tocSpy.active === c.slug}>{c.text}</a>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>
	{:else}
		<details class="toc-inline">
			<summary>Contents</summary>
			<ul>
				{#each nested as h (h.slug)}
					<li>
						<a href="#{h.slug}" data-active={tocSpy.active === h.slug}>{h.text}</a>
						{#if h.children.length > 0}
							<ul class="toc-children">
								{#each h.children as c (c.slug)}
									<li>
										<a href="#{c.slug}" data-active={tocSpy.active === c.slug}>{c.text}</a>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</details>
	{/if}
{/if}

<style>
	.toc-sidebar {
		font-size: 0.875rem;
		line-height: 1.45;
	}

	.toc-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-secondary);
		margin: 0 0 var(--spacing-sm);
	}

	.toc-sidebar ul,
	.toc-inline ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.toc-sidebar li,
	.toc-inline li {
		margin: 0;
		padding: 0;
	}

	.toc-sidebar a,
	.toc-inline a {
		display: block;
		padding: 4px 0 4px 12px;
		border-left: 2px solid transparent;
		color: var(--text-secondary);
		text-decoration: none;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}

	.toc-sidebar a:hover,
	.toc-inline a:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	.toc-sidebar a[data-active='true'],
	.toc-inline a[data-active='true'] {
		color: var(--text-primary);
		border-left-color: var(--accent-primary);
	}

	.toc-children {
		padding-left: var(--spacing-sm);
	}

	.toc-children a {
		font-size: 0.8125rem;
	}

	.toc-inline {
		margin: var(--spacing-md) 0;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 6px;
	}

	.toc-inline summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 0.875rem;
		color: var(--text-secondary);
		list-style: none;
	}

	.toc-inline summary::-webkit-details-marker {
		display: none;
	}

	.toc-inline summary::before {
		content: '▶';
		display: inline-block;
		margin-right: var(--spacing-xs);
		font-size: 0.625rem;
		transition: transform 120ms ease;
	}

	.toc-inline[open] summary::before {
		transform: rotate(90deg);
	}

	.toc-inline > ul {
		margin-top: var(--spacing-sm);
	}

	@media (prefers-reduced-motion: reduce) {
		.toc-sidebar a,
		.toc-inline a,
		.toc-inline summary::before {
			transition: none;
		}
	}
</style>
