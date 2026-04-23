<script lang="ts">
	import { ArrowRight, ArrowLeft } from 'lucide-svelte';

	type Entry = { title: string; description?: string; url: string };

	interface Props {
		title: string;
		intro?: string;
		backHref?: string;
		backLabel?: string;
		entries: Entry[];
	}

	let {
		title,
		intro = '',
		backHref = '/docs',
		backLabel = 'All docs',
		entries
	}: Props = $props();
</script>

<svelte:head>
	<title>{title} — NKIDO Docs</title>
	{#if intro}<meta name="description" content={intro} />{/if}
</svelte:head>

<section class="page">
	<div class="page-inner">
		<a href={backHref} class="back-link">
			<ArrowLeft size={14} />
			{backLabel}
		</a>
		<h1>{title}</h1>
		{#if intro}<p class="intro">{intro}</p>{/if}

		<div class="index-list">
			{#each entries as entry}
				<a href={entry.url} class="index-card">
					<h2>{entry.title}</h2>
					{#if entry.description}<p>{entry.description}</p>{/if}
					<span class="learn-more">
						Read <ArrowRight size={14} />
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>

<style>
	.page {
		padding: var(--spacing-3xl) var(--content-padding);
	}

	.page-inner {
		max-width: 800px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.back-link:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	h1 {
		margin-bottom: var(--spacing-md);
	}

	.intro {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-2xl);
	}

	.index-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.index-card {
		display: block;
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text-primary);
		transition: border-color var(--transition-fast);
	}

	.index-card:hover {
		border-color: var(--border-default);
		text-decoration: none;
	}

	.index-card h2 {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-xs);
	}

	.index-card p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.learn-more {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--accent-primary);
		font-size: 0.875rem;
	}
</style>
