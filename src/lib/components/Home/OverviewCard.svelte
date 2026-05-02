<script lang="ts">
	import {
		Activity,
		AreaChart,
		AudioWaveform,
		BarChart,
		Brackets,
		Calculator,
		Clock,
		Database,
		Drum,
		FolderOpen,
		Gauge,
		GitBranch,
		Grid3x3,
		Headphones,
		KeyRound,
		Layers,
		LineChart,
		ListMusic,
		Mic,
		Music,
		Music2,
		Parentheses,
		Piano,
		Plug,
		Radio,
		Repeat2,
		Sigma,
		Sliders,
		Triangle,
		Variable,
		Wand2,
		Waves,
		Wind,
		Workflow,
		Wrench,
		Zap
	} from 'lucide-svelte';

	type Chip = { keyword: string; anchor: string; href: string };
	type Card = {
		slug: string;
		title: string;
		description: string;
		url: string;
		icon: string;
		chips: Chip[];
	};

	export let card: Card;

	const iconMap = {
		Activity,
		AreaChart,
		AudioWaveform,
		BarChart,
		Brackets,
		Calculator,
		Clock,
		Database,
		Drum,
		FolderOpen,
		Gauge,
		GitBranch,
		Grid3x3,
		Headphones,
		KeyRound,
		Layers,
		LineChart,
		ListMusic,
		Mic,
		Music,
		Music2,
		Parentheses,
		Piano,
		Plug,
		Radio,
		Repeat2,
		Sigma,
		Sliders,
		Triangle,
		Variable,
		Wand2,
		Waves,
		Wind,
		Workflow,
		Wrench,
		Zap
	} as const;

	$: Icon = iconMap[card.icon as keyof typeof iconMap] ?? Sliders;
</script>

<article class="overview-card">
	<div class="overview-icon">
		<svelte:component this={Icon} size={24} />
	</div>
	<h3 class="overview-title">
		<a href={card.url} aria-label="{card.title} reference">{card.title}</a>
	</h3>
	<p class="overview-description">{card.description}</p>
	{#if card.chips.length > 0}
		<ul class="overview-chips" aria-label="Topics in {card.title}">
			{#each card.chips as chip (chip.anchor)}
				<li>
					<a class="chip" href={chip.href}>{chip.keyword}</a>
				</li>
			{/each}
		</ul>
	{/if}
</article>

<style>
	.overview-card {
		display: flex;
		flex-direction: column;
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		transition: border-color var(--transition-fast);
	}

	.overview-card:hover {
		border-color: var(--border-default);
	}

	.overview-icon {
		color: var(--accent-primary);
		margin-bottom: var(--spacing-sm);
	}

	.overview-title {
		font-size: 1.0625rem;
		margin: 0 0 var(--spacing-xs) 0;
	}

	.overview-title a {
		color: inherit;
		text-decoration: none;
	}

	.overview-title a:hover,
	.overview-title a:focus-visible {
		color: var(--accent-primary);
	}

	.overview-title a:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
		border-radius: 2px;
	}

	.overview-description {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin: 0 0 var(--spacing-sm) 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
	}

	.overview-chips {
		list-style: none;
		padding: 0;
		margin: auto 0 0 0;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.chip {
		display: inline-block;
		padding: 2px 8px;
		font-size: 0.75rem;
		font-family: var(--font-mono, monospace);
		color: var(--text-secondary);
		background: var(--bg-primary);
		border: 1px solid var(--border-muted);
		border-radius: 999px;
		text-decoration: none;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.chip:hover,
	.chip:focus-visible {
		color: var(--accent-primary);
		border-color: var(--accent-primary);
	}

	.chip:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}
</style>
