<script lang="ts">
	import { Layers, Zap, Globe, Box, RefreshCw, Scale, Search, BookOpen, Code } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Features | NKIDO</title>
	<meta name="description" content="NKIDO's features: live-coding patterns, 95+ DSP opcodes, hot-swapping, and more." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Features</h1>
		<p class="intro">
			NKIDO combines a powerful pattern language with a high-performance audio engine.
		</p>

		<div class="feature-list">
			<div class="feature-item">
				<div class="feature-icon">
					<Zap size={24} />
				</div>
				<div class="feature-content">
					<h2>Live-coding patterns</h2>
					<p>
						Write code that plays music. Akkado, our pattern DSL, combines the expressiveness
						of Strudel/Tidal with a functional DAG-based audio pipeline. Change code while it
						plays. No restart needed.
					</p>
				</div>
			</div>

			<div class="feature-item">
				<div class="feature-icon">
					<Layers size={24} />
				</div>
				<div class="feature-content">
					<h2>95+ DSP opcodes</h2>
					<p>
						From basic oscillators to advanced algorithmic effects:
					</p>
					<ul>
						<li><strong>Oscillators:</strong> SIN, TRI, SAW, SQR, noise</li>
						<li><strong>Filters:</strong> biquad, SVF, Moog, diode ladder</li>
						<li><strong>Delays:</strong> tape, ping-pong, fractal</li>
						<li><strong>Reverbs:</strong> Dattorro, Freeverb, Lexicon</li>
						<li><strong>Effects:</strong> chorus, flanger, phaser, vocoder, bitcrusher</li>
						<li><strong>Synthesis:</strong> granular, Karplus-Strong, wavetable</li>
					</ul>
				</div>
			</div>

			<div class="feature-item">
				<div class="feature-icon">
					<Globe size={24} />
				</div>
				<div class="feature-content">
					<h2>Runs everywhere</h2>
					<p>
						One codebase, multiple platforms:
					</p>
					<ul>
						<li><strong>Web:</strong> WASM + AudioWorklet in modern browsers</li>
						<li><strong>Native:</strong> CLI player for desktop</li>
						<li><strong>Godot:</strong> addon for GameMusic</li>
						<li><strong>ESP32:</strong> embedded audio kit</li>
					</ul>
				</div>
			</div>

			<div class="feature-item">
				<div class="feature-icon">
					<Box size={24} />
				</div>
				<div class="feature-content">
					<h2>Lightweight runtime</h2>
					<p>
						Cedar is a standalone C++ library with no external dependencies.
						Perfect for embedding in games, plugins, or embedded systems.
					</p>
				</div>
			</div>

			<div class="feature-item">
				<div class="feature-icon">
					<RefreshCw size={24} />
				</div>
				<div class="feature-content">
					<h2>Hot-swap with preserved state</h2>
					<p>
						NKIDO's semantic ID system tracks DSP nodes across code changes.
						Update your patch without glitches. Parameter values, envelope states,
						and delay lines persist through reloads.
					</p>
				</div>
			</div>

			<div class="feature-item">
				<div class="feature-icon">
					<Search size={24} />
				</div>
				<div class="feature-content">
					<h2>Reference in the IDE</h2>
					<p>
						Press <kbd>F1</kbd> in the live IDE to search builtins and opcodes.
						The full reference docs are available in the IDE's docs panel.
					</p>
					<a href="https://live.nkido.cc" target="_blank" rel="noopener">Try it now →</a>
				</div>
			</div>
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

	.feature-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
	}

	.feature-item {
		display: flex;
		gap: var(--spacing-lg);
	}

	.feature-icon {
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-secondary);
		border-radius: 12px;
		color: var(--accent-primary);
	}

	.feature-content h2 {
		margin-bottom: var(--spacing-sm);
	}

	.feature-content p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.feature-content ul {
		margin: 0;
		padding-left: var(--spacing-lg);
		color: var(--text-secondary);
	}

	.feature-content li {
		margin-bottom: var(--spacing-xs);
	}

	.feature-content kbd {
		background: var(--bg-tertiary);
		padding: 2px 6px;
		border-radius: 4px;
		font-family: var(--font-mono);
		font-size: 0.875rem;
	}

	@media (max-width: 640px) {
		.feature-item {
			flex-direction: column;
		}

		.feature-icon {
			width: 40px;
			height: 40px;
		}
	}
</style>