<script lang="ts">
	import { Layers, Code, Zap } from 'lucide-svelte';
	import manifest from '$lib/data/docs-manifest.json';

	type ManifestEntry = { title: string; url: string };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const m = manifest as Manifest;
	const referenceTotal =
		(m.entries['reference/builtins']?.length ?? 0) +
		(m.entries['reference/language']?.length ?? 0) +
		(m.entries['reference/mini-notation']?.length ?? 0);
	const tutorialsTotal = m.entries['tutorials']?.length ?? 0;
	const firstTutorial = m.entries['tutorials']?.[0]?.url ?? '/docs/tutorials';

	const sections = [
		{
			title: 'Concepts',
			icon: Layers,
			description: 'The mental model: signals, DAGs, hot-swap, and mini-notation.',
			href: '/docs/concepts',
			linkLabel: 'Start reading →'
		},
		{
			title: `Tutorials (${tutorialsTotal})`,
			icon: Zap,
			description: 'Step-by-step guides from first sound to testing a progression.',
			href: '/docs/tutorials',
			linkLabel: `Open tutorials →`
		},
		{
			title: `Reference (${referenceTotal})`,
			icon: Code,
			description: 'Every builtin, operator, and mini-notation token, searchable and linkable.',
			href: '/docs/reference',
			linkLabel: 'Open reference →'
		}
	];

	const jumpStart = [
		{ title: 'Hello Sine', href: firstTutorial, kind: 'tutorial' },
		{ title: 'Signals & DAGs', href: '/docs/concepts/signals', kind: 'concept' },
		{ title: 'Oscillators', href: '/docs/reference/builtins/oscillators', kind: 'reference' }
	];
</script>

<svelte:head>
	<title>Docs — NKIDO</title>
	<meta name="description" content="NKIDO documentation — concepts, tutorials, and reference." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Documentation</h1>
		<p class="intro">Learn NKIDO from the ground up.</p>

		<div class="docs-grid">
			{#each sections as section}
				<a href={section.href} class="docs-card">
					<div class="docs-icon">
						<svelte:component this={section.icon} size={24} />
					</div>
					<h2>{section.title}</h2>
					<p>{section.description}</p>
					<span class="cta">{section.linkLabel}</span>
				</a>
			{/each}
		</div>

		<h2 class="jump-heading">Jump in</h2>
		<ul class="jump-list">
			{#each jumpStart as item}
				<li><a href={item.href}>{item.title}</a> <span class="kind">{item.kind}</span></li>
			{/each}
		</ul>
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
		display: block;
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text-primary);
		transition: border-color var(--transition-fast);
	}

	.docs-card:hover {
		border-color: var(--border-default);
		text-decoration: none;
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

	.cta {
		color: var(--accent-primary);
		font-size: 0.875rem;
	}

	.jump-heading {
		margin-top: var(--spacing-3xl);
		margin-bottom: var(--spacing-sm);
		font-size: 1.125rem;
	}

	.jump-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.jump-list li {
		font-size: 0.9375rem;
	}

	.kind {
		display: inline-block;
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-left: var(--spacing-sm);
	}

	@media (max-width: 640px) {
		.docs-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
