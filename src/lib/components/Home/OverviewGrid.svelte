<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import overview from '$lib/data/overview.json';
	import OverviewCard from './OverviewCard.svelte';

	// Per-group open state. Initial values are all `true` (the desktop default).
	// On mobile, CSS hides cards regardless of this value until the user taps a
	// heading — so SSR and the first paint stay consistent across viewports.
	let openGroups: Record<string, boolean> = Object.fromEntries(
		overview.groups.map((g) => [g.id, true])
	);

	const totalCards = overview.groups.reduce((n, g) => n + g.cards.length, 0);

	function toggle(id: string) {
		openGroups = { ...openGroups, [id]: !openGroups[id] };
	}
</script>

<section class="overview">
	<div class="overview-inner">
		<header class="overview-header">
			<h2>What's in the box</h2>
			<p class="overview-intro">
				Every instrument, effect, and tool — straight to its docs.
			</p>
			<p class="overview-badge">95+ DSP opcodes · {totalCards} reference pages</p>
		</header>

		{#each overview.groups as group (group.id)}
			<section class="group" data-open={openGroups[group.id]}>
				<button
					type="button"
					class="group-heading"
					aria-expanded={openGroups[group.id]}
					aria-controls="overview-cards-{group.id}"
					on:click={() => toggle(group.id)}
				>
					<span>{group.heading}</span>
					<ChevronDown class="chevron" size={20} aria-hidden="true" />
				</button>
				<div class="cards" id="overview-cards-{group.id}">
					{#if group.cards.length === 0}
						<p class="coming-soon"><em>Coming soon</em></p>
					{:else}
						{#each group.cards as card (card.slug)}
							<OverviewCard {card} />
						{/each}
					{/if}
				</div>
			</section>
		{/each}

		<footer class="overview-footer">
			<a class="cta" href="/docs/reference">View full reference →</a>
		</footer>
	</div>
</section>

<style>
	.overview {
		padding: var(--spacing-3xl) var(--content-padding);
		background: var(--bg-primary);
	}

	.overview-inner {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.overview-header {
		text-align: center;
		margin-bottom: var(--spacing-2xl, 48px);
	}

	.overview-header h2 {
		font-size: 1.75rem;
		margin: 0 0 var(--spacing-sm) 0;
	}

	.overview-intro {
		color: var(--text-secondary);
		font-size: 1rem;
		margin: 0 0 var(--spacing-sm) 0;
	}

	.overview-badge {
		display: inline-block;
		padding: 4px 12px;
		font-size: 0.8125rem;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 999px;
		margin: 0;
	}

	.group {
		margin-bottom: var(--spacing-xl);
	}

	.group-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--spacing-sm) 0;
		margin-bottom: var(--spacing-md, 16px);
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary, inherit);
		background: none;
		border: none;
		border-bottom: 1px solid var(--border-muted);
		cursor: default;
		text-align: left;
		font-family: inherit;
	}

	.group-heading:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 4px;
		border-radius: 4px;
	}

	.group-heading :global(.chevron) {
		opacity: 0;
		transition: transform var(--transition-fast);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--spacing-lg);
	}

	.coming-soon {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		margin: 0;
		grid-column: 1 / -1;
	}

	.overview-footer {
		text-align: center;
		margin-top: var(--spacing-2xl, 48px);
	}

	.cta {
		display: inline-block;
		padding: 8px 20px;
		color: var(--accent-primary);
		font-weight: 600;
		text-decoration: none;
		border: 1px solid var(--accent-primary);
		border-radius: 8px;
		transition: background-color var(--transition-fast);
	}

	.cta:hover,
	.cta:focus-visible {
		background: var(--bg-secondary);
	}

	.cta:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	@media (max-width: 768px) {
		/* Mobile: cards hidden by default; tapping a heading reveals them. The
		   button becomes interactive (cursor + chevron visible). */
		.group-heading {
			cursor: pointer;
		}
		.group-heading :global(.chevron) {
			opacity: 1;
		}
		.group[data-open='false'] .group-heading :global(.chevron) {
			transform: rotate(-90deg);
		}

		.group .cards {
			display: none;
		}
		.group[data-open='true'] .cards {
			display: grid;
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.group-heading :global(.chevron) {
			transition: none;
		}
	}
</style>
