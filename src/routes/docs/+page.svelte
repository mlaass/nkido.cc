<script lang="ts">
	import { BookOpen, Layers, Code, Zap } from 'lucide-svelte';

	const docsSections = [
		{
			title: 'Concepts',
			icon: Layers,
			description: 'Understand the core ideas behind NKIDO',
			href: '/docs/concepts',
			items: [
				{ title: 'Signals & DAGs', href: '/docs/concepts/signals' },
				{ title: 'Hot-swap explained', href: '/docs/concepts/hot-swap' },
				{ title: 'Mini-notation', href: '/docs/concepts/mini-notation' }
			]
		},
		{
			title: 'Tutorials',
			icon: Zap,
			description: 'Step-by-step guides from first sound to advanced patterns',
			href: '/docs/tutorials',
			items: [
				{ title: 'Hello Sine', href: '/docs/tutorials/hello-sine' },
				{ title: 'Adding filters', href: '/docs/tutorials/filters' },
				{ title: 'Patterns', href: '/docs/tutorials/patterns' }
			]
		},
		{
			title: 'Reference',
			icon: Code,
			description: 'Full opcode and builtin reference',
			href: 'https://live.nkido.cc/?docs=',
			external: true
		}
	];
</script>

<svelte:head>
	<title>Docs — NKIDO</title>
	<meta name="description" content="NKIDO documentation — concepts, tutorials, and reference." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Documentation</h1>
		<p class="intro">
			Learn NKIDO from the ground up.
		</p>

		<div class="docs-grid">
			{#each docsSections as section}
				<div class="docs-card">
					<div class="docs-icon">
						<svelte:component this={section.icon} size={24} />
					</div>
					<h2>{section.title}</h2>
					<p>{section.description}</p>
					{#if section.items}
						<ul class="docs-items">
							{#each section.items as item}
								<li>
									{#if section.external}
										<a href="{section.href}{encodeURIComponent(item.title)}" target="_blank" rel="noopener">
											{item.title} →
										</a>
									{:else}
										<a href="{item.href}">{item.title} →</a>
									{/if}
								</li>
							{/each}
						</ul>
					{/if}
				</div>
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

	h1 {
		margin-bottom: var(--spacing-md);
	}

	.intro {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-2xl);
	}

	.docs-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.docs-card {
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
	}

	.docs-icon {
		color: var(--accent-primary);
		margin-bottom: var(--spacing-md);
	}

	.docs-card h2 {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-sm);
	}

	.docs-card p {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		margin-bottom: var(--spacing-md);
	}

	.docs-items {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.docs-items li {
		padding: var(--spacing-xs) 0;
	}

	.docs-items a {
		font-size: 0.9375rem;
	}

	@media (max-width: 640px) {
		.docs-grid {
			grid-template-columns: 1fr;
		}
	}
</style>