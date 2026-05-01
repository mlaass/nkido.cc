<script lang="ts">
	import { Zap, Layers, Globe, Box, RefreshCw, Scale, Sliders, Palette, BookOpen } from 'lucide-svelte';

	const features = [
		{
			icon: Zap,
			title: 'Live-coding patterns',
			description: 'Akkado + Strudel-style mini-notation for rapid musical exploration.'
		},
		{
			icon: Layers,
			title: '95+ DSP opcodes',
			description: 'Oscillators, filters, reverbs, granular, vocoder, Karplus-Strong, and more.'
		},
		{
			icon: Globe,
			title: 'Runs everywhere',
			description: 'Native, web, Godot addon, ESP32. One codebase, any platform.'
		},
		{
			icon: Sliders,
			title: 'Runtime parameter controls',
			description: 'Define sliders, toggles, buttons, and dropdowns in code, rendered as interactive UI controls in the web app.'
		},
		{
			icon: Palette,
			title: 'Customizable web UI',
			description: '7 preset themes, custom theme editor, and CSS variable-based theming for personalized workflows.'
		},
		{
			icon: BookOpen,
			title: 'Instant documentation lookup',
			description: 'Press F1 to search a pre-built keyword index with links to docs for builtins, mini-notation, and concepts.'
		},
		{
			icon: Box,
			title: 'Lightweight runtime',
			description: 'Cedar is a standalone C++ library, easy to embed anywhere.'
		},
		{
			icon: RefreshCw,
			title: 'Hot-swap preserved',
			description: 'Change code while it plays, no glitches or dropped notes.'
		},
		{
			icon: Scale,
			title: 'MIT licensed',
			description: 'Permissive open source, embed in closed-source projects.'
		},
	];
</script>

<section class="features">
	<div class="features-inner">
		<div class="feature-grid">
			{#each features as feature}
				<div class="feature-card">
					<div class="feature-icon">
						<svelte:component this={feature.icon} size={24} />
					</div>
					<h3 class="feature-title">{feature.title}</h3>
					<p class="feature-description">{feature.description}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.features {
		padding: var(--spacing-3xl) var(--content-padding);
		background: var(--bg-primary);
	}

	.features-inner {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-lg);
	}

	.feature-card {
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		transition: border-color var(--transition-fast);
	}

	.feature-card:hover {
		border-color: var(--border-default);
	}

	.feature-icon {
		color: var(--accent-primary);
		margin-bottom: var(--spacing-sm);
	}

	.feature-title {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-xs);
	}

	.feature-description {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		margin: 0;
	}

	@media (max-width: 640px) {
		.feature-grid {
			grid-template-columns: 1fr;
		}
	}
</style>