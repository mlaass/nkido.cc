<script lang="ts">
	import { ArrowRight, ArrowLeft } from 'lucide-svelte';

	const concepts = [
		{
			title: 'Signals & DAGs',
			href: '/docs/concepts/signals',
			summary: "How audio flows through NKIDO's directed acyclic graph architecture."
		},
		{
			title: 'Hot-swap explained',
			href: '/docs/concepts/hot-swap',
			summary: 'Preserving state across code changes — no glitches, no drops.'
		},
		{
			title: 'Mini-notation',
			href: '/docs/concepts/mini-notation',
			summary: 'Strudel/Tidal-style pattern syntax for rapid musical exploration.'
		}
	];
</script>

<svelte:head>
	<title>Concepts — NKIDO Docs</title>
	<meta name="description" content="Learn the core concepts behind NKIDO: signals, DAGs, hot-swap, and mini-notation." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<a href="/docs" class="back-link">
			<ArrowLeft size={14} />
			All docs
		</a>
		<h1>Concepts</h1>
		<p class="intro">
			The ideas that make NKIDO work. Start here before jumping into the tutorials.
		</p>

		<div class="concepts-list">
			{#each concepts as concept}
				<a href={concept.href} class="concept-card">
					<h2>{concept.title}</h2>
					<p>{concept.summary}</p>
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

	.concepts-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.concept-card {
		display: block;
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text-primary);
		transition: border-color var(--transition-fast);
	}

	.concept-card:hover {
		border-color: var(--border-default);
		text-decoration: none;
	}

	.concept-card h2 {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-xs);
	}

	.concept-card p {
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
