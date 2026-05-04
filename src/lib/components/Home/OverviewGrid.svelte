<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import overview from '$lib/data/overview.json';
	import OverviewCard from './OverviewCard.svelte';

	type GroupId = (typeof overview.groups)[number]['id'];
	type FilterValue = GroupId | 'all';

	let activeFilter: FilterValue = 'all';

	// Per-subgroup open state. Keyed `${groupId}/${subgroupId}`. CSS hides
	// cards on mobile by default; user toggles flip data-open which then
	// drives both desktop (no effect) and mobile (reveal cards).
	let openSubgroups: Record<string, boolean> = Object.fromEntries(
		overview.groups.flatMap((g) =>
			g.subgroups.map((sg) => [`${g.id}/${sg.id}`, true])
		)
	);

	const totalCards = overview.groups.reduce(
		(n, g) => n + g.subgroups.reduce((m, sg) => m + sg.cards.length, 0),
		0
	);

	const flatGroupIds: ReadonlySet<string> = new Set(['visualizations']);

	function isGroupVisible(groupId: GroupId): boolean {
		return activeFilter === 'all' || activeFilter === groupId;
	}

	function toggleSubgroup(groupId: string, subgroupId: string) {
		const key = `${groupId}/${subgroupId}`;
		openSubgroups = { ...openSubgroups, [key]: !openSubgroups[key] };
	}

	/** Move focus across pills with Left/Right arrows when a pill has focus. */
	function onPillKeydown(event: KeyboardEvent) {
		const dir = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (dir === 0) return;
		const target = event.currentTarget as HTMLButtonElement;
		event.preventDefault();
		const pills = Array.from(
			(target.parentElement?.querySelectorAll('button.pill') ?? []) as NodeListOf<HTMLButtonElement>
		);
		const i = pills.indexOf(target);
		const next = pills[(i + dir + pills.length) % pills.length];
		next?.focus();
	}
</script>

<section class="overview">
	<div class="overview-inner">
		<header class="overview-header">
			<h2>What's in the box</h2>
			<p class="overview-intro">
				Every instrument, effect, and tool — straight to its docs.
			</p>
			<p class="overview-badge">{totalCards} sub-features across {overview.groups.length} groups</p>
		</header>

		<div class="pill-row" aria-label="Filter overview by section">
			<button
				type="button"
				class="pill"
				class:active={activeFilter === 'all'}
				aria-pressed={activeFilter === 'all'}
				on:click={() => (activeFilter = 'all')}
				on:keydown={onPillKeydown}
			>All</button>
			{#each overview.groups as group (group.id)}
				<button
					type="button"
					class="pill"
					class:active={activeFilter === group.id}
					aria-pressed={activeFilter === group.id}
					on:click={() => (activeFilter = group.id as FilterValue)}
					on:keydown={onPillKeydown}
				>{group.heading}</button>
			{/each}
		</div>

		{#each overview.groups as group (group.id)}
			<section class="group" hidden={!isGroupVisible(group.id as GroupId)}>
				<h3 class="group-heading">{group.heading}</h3>

				{#each group.subgroups as subgroup (subgroup.id)}
					{@const isFlat = flatGroupIds.has(group.id) && subgroup.id === group.id}
					{@const key = `${group.id}/${subgroup.id}`}
					<div class="subgroup" data-open={openSubgroups[key]}>
						{#if !isFlat}
							<button
								type="button"
								class="subgroup-heading"
								aria-expanded={openSubgroups[key]}
								aria-controls="overview-cards-{group.id}-{subgroup.id}"
								on:click={() => toggleSubgroup(group.id, subgroup.id)}
							>
								<span>{subgroup.heading}</span>
								<ChevronDown class="chevron" size={18} aria-hidden="true" />
							</button>
						{/if}
						<div class="cards" id="overview-cards-{group.id}-{subgroup.id}">
							{#each subgroup.cards as card (card.url)}
								<OverviewCard {card} />
							{/each}
						</div>
					</div>
				{/each}
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
		margin-bottom: var(--spacing-xl);
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

	.pill-row {
		position: sticky;
		top: var(--header-height);
		z-index: 5;
		display: flex;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) 0;
		margin-bottom: var(--spacing-xl);
		background: color-mix(in srgb, var(--bg-primary) 88%, transparent);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		overflow-x: auto;
		scrollbar-width: thin;
	}

	.pill {
		flex: 0 0 auto;
		padding: 6px 14px;
		font: inherit;
		font-size: 0.875rem;
		color: var(--text-secondary);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 999px;
		cursor: pointer;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast),
			background-color var(--transition-fast);
		scroll-snap-align: start;
	}

	.pill:hover {
		color: var(--text-primary);
		border-color: var(--accent-primary);
	}

	.pill.active {
		color: var(--bg-primary);
		background: var(--accent-primary);
		border-color: var(--accent-primary);
	}

	.pill:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	.group {
		margin-bottom: var(--spacing-2xl);
	}

	.group-heading {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0 0 var(--spacing-md) 0;
		padding-bottom: var(--spacing-sm);
		border-bottom: 1px solid var(--border-muted);
	}

	.subgroup {
		margin-bottom: var(--spacing-lg);
	}

	.subgroup-heading {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		width: 100%;
		padding: var(--spacing-xs) 0;
		margin-bottom: var(--spacing-sm);
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-secondary);
		background: none;
		border: none;
		cursor: default;
		text-align: left;
		font-family: inherit;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.subgroup-heading:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 4px;
		border-radius: 4px;
	}

	.subgroup-heading :global(.chevron) {
		opacity: 0;
		transition: transform var(--transition-fast);
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: var(--spacing-lg);
		align-items: stretch;
	}

	.overview-footer {
		text-align: center;
		margin-top: var(--spacing-2xl);
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
		.subgroup-heading {
			cursor: pointer;
		}
		.subgroup-heading :global(.chevron) {
			opacity: 1;
		}
		.subgroup[data-open='false'] .subgroup-heading :global(.chevron) {
			transform: rotate(-90deg);
		}

		.subgroup .cards {
			display: none;
		}
		.subgroup[data-open='true'] .cards {
			display: grid;
			grid-template-columns: 1fr;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.subgroup-heading :global(.chevron),
		.pill,
		.cta {
			transition: none;
		}
	}
</style>
