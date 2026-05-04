<script lang="ts">
	import {
		Activity,
		AreaChart,
		AudioWaveform,
		BarChart,
		Binary,
		Box,
		Brackets,
		Calculator,
		Clock,
		Cylinder,
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

	type Card = {
		name: string;
		tagline: string;
		url: string;
		icon: string;
		snippet?: string;
		snippetHtml?: string;
		source: {
			docSlug: string;
			docCategory: string;
			anchor?: string;
			anchorMatched: boolean;
		};
	};

	export let card: Card;

	const iconMap = {
		Activity,
		AreaChart,
		AudioWaveform,
		BarChart,
		Binary,
		Box,
		Brackets,
		Calculator,
		Clock,
		Cylinder,
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

	$: Icon = iconMap[card.icon as keyof typeof iconMap] ?? Box;
</script>

<article class="overview-card">
	<div class="overview-icon">
		<svelte:component this={Icon} size={24} />
	</div>
	<h3 class="overview-title">
		<a href={card.url} aria-label="{card.name} reference">{card.name}</a>
	</h3>
	<p class="overview-tagline">{card.tagline}</p>
	{#if card.snippetHtml}
		<div class="overview-snippet">{@html card.snippetHtml}</div>
	{:else if card.snippet}
		<div class="overview-snippet"><pre><code>{card.snippet}</code></pre></div>
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
		border-color: var(--accent-primary);
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

	.overview-tagline {
		color: var(--text-secondary);
		font-size: 0.9rem;
		margin: 0 0 var(--spacing-sm) 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
		overflow: hidden;
	}

	/* Snippet block: Shiki HTML renders its own <pre>/<code> with inline
	   styles for the github-dark-dimmed theme. We just provide the outer
	   block layout and the fallback monospace styling for pre-tag content
	   when snippetHtml is absent. */
	.overview-snippet {
		margin: auto 0 0 0;
		font-size: 0.78rem;
		font-family: var(--font-mono, monospace);
		overflow-x: auto;
	}

	.overview-snippet :global(pre) {
		margin: 0;
		padding: 8px 10px;
		background: var(--bg-primary);
		border: 1px solid var(--border-muted);
		border-radius: 8px;
		overflow-x: auto;
	}

	.overview-snippet :global(code) {
		background: transparent;
		padding: 0;
		color: var(--text-secondary);
		font-family: inherit;
	}
</style>
