<script lang="ts">
	import type { ComponentType } from 'svelte';
	import {
		Zap,
		Layers,
		Globe,
		Box,
		RefreshCw,
		Scale,
		Sliders,
		Palette,
		BookOpen,
		Disc,
		Code2,
		Gamepad2,
		ArrowUpRight,
	} from 'lucide-svelte';

	type Feature = {
		icon: ComponentType;
		title: string;
		description: string;
		href?: string;
		external?: boolean;
	};

	const features: Feature[] = [
		{
			icon: Zap,
			title: 'Live-coding patterns',
			description: 'Akkado + Strudel-style mini-notation for rapid musical exploration.',
			href: '/docs/concepts/mini-notation',
		},
		{
			icon: Layers,
			title: '95+ DSP opcodes',
			description: 'Oscillators, filters, reverbs, granular, vocoder, Karplus-Strong, and more.',
			href: '/docs/reference/builtins',
		},
		{
			icon: Disc,
			title: 'Samples & SoundFonts',
			description: 'Load WAVs from GitHub or HTTP, play SF2/SF3 soundfonts straight from code.',
			href: '/docs/reference/builtins/samples-loading',
		},
		{
			icon: RefreshCw,
			title: 'Hot-swap preserved',
			description: 'Change code while it plays, no glitches or dropped notes.',
			href: '/docs/concepts/hot-swap',
		},
		{
			icon: Globe,
			title: 'Runs everywhere',
			description: 'Native, web, and ESP32. One codebase, any platform.',
			href: 'https://github.com/mlaass/nkido',
			external: true,
		},
		{
			icon: Code2,
			title: 'VS Code extension',
			description: 'Syntax highlighting, autocomplete, live diagnostics, and hot-swap from your editor.',
			href: 'https://github.com/mlaass/nkido-vscode',
			external: true,
		},
		{
			icon: Gamepad2,
			title: 'Godot game-audio addon',
			description: 'Embed Nkido in Godot 4 for adaptive game audio with parameter binding and inspector UI.',
			href: 'https://github.com/mlaass/godot-nkido-addon',
			external: true,
		},
		{
			icon: Box,
			title: 'Lightweight runtime',
			description: 'Cedar is a standalone C++ library, easy to embed anywhere.',
			href: 'https://github.com/mlaass/nkido',
			external: true,
		},
		{
			icon: Sliders,
			title: 'Runtime parameter controls',
			description: 'Define sliders, toggles, buttons, and dropdowns in code, rendered as interactive UI controls in the web app.',
		},
		{
			icon: Palette,
			title: 'Customizable web UI',
			description: '7 preset themes, custom theme editor, and CSS variable-based theming for personalized workflows.',
		},
		{
			icon: BookOpen,
			title: 'Instant documentation lookup',
			description: 'Press F1 to search a pre-built keyword index with links to docs for builtins, mini-notation, and concepts.',
			href: '/docs',
		},
		{
			icon: Scale,
			title: 'MIT licensed',
			description: 'Permissive open source, embed in closed-source projects.',
			href: 'https://github.com/mlaass/nkido/blob/master/LICENSE',
			external: true,
		},
	];
</script>

<section class="features">
	<div class="features-inner">
		<div class="feature-grid">
			{#each features as feature}
				{#if feature.href}
					<a
						class="feature-card feature-card--link"
						href={feature.href}
						target={feature.external ? '_blank' : undefined}
						rel={feature.external ? 'noopener noreferrer' : undefined}
					>
						<div class="feature-icon">
							<svelte:component this={feature.icon} size={24} />
						</div>
						<h3 class="feature-title">{feature.title}</h3>
						<p class="feature-description">{feature.description}</p>
						{#if feature.external}
							<span class="feature-external" aria-hidden="true">
								<ArrowUpRight size={14} />
							</span>
						{/if}
					</a>
				{:else}
					<div class="feature-card">
						<div class="feature-icon">
							<svelte:component this={feature.icon} size={24} />
						</div>
						<h3 class="feature-title">{feature.title}</h3>
						<p class="feature-description">{feature.description}</p>
					</div>
				{/if}
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
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-lg);
	}

	.feature-card {
		position: relative;
		display: block;
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		color: inherit;
		text-decoration: none;
		transition: border-color var(--transition-fast);
	}

	.feature-card:hover {
		border-color: var(--border-default);
	}

	.feature-card--link:hover {
		border-color: var(--accent-primary);
	}

	.feature-card--link:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
		border-color: var(--accent-primary);
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

	.feature-external {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		color: var(--text-tertiary, var(--text-secondary));
		opacity: 0.6;
		display: inline-flex;
		transition: opacity var(--transition-fast), color var(--transition-fast);
	}

	.feature-card--link:hover .feature-external,
	.feature-card--link:focus-visible .feature-external {
		opacity: 1;
		color: var(--accent-primary);
	}

	@media (max-width: 640px) {
		.feature-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
