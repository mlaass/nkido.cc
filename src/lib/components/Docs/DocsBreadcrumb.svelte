<script lang="ts">
	import { page } from '$app/state';
	import manifest from '$lib/data/docs-manifest.json';
	import { computeBreadcrumb } from './breadcrumb';

	const segments = $derived(computeBreadcrumb(page.url.pathname, manifest as any));
</script>

<nav class="breadcrumb" aria-label="breadcrumb">
	<ol>
		{#each segments as seg, i (seg.href)}
			<li>
				{#if seg.current}
					<span aria-current="page">{seg.label}</span>
				{:else}
					<a href={seg.href}>{seg.label}</a>
				{/if}
				{#if i < segments.length - 1}
					<span class="sep" aria-hidden="true">/</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb ol {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.breadcrumb li {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.breadcrumb a {
		color: var(--text-secondary);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		color: var(--text-primary);
		text-decoration: underline;
	}

	.breadcrumb [aria-current='page'] {
		color: var(--text-primary);
		font-weight: 500;
	}

	.sep {
		color: var(--text-muted);
	}
</style>
