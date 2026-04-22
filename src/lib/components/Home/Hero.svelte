<script lang="ts">
	import { ArrowRight, Github } from 'lucide-svelte';
</script>

<section class="hero">
	<div class="hero-content">
		<h1 class="hero-title">
			High-performance<br />
			<span class="highlight">live-coded</span> audio synthesis.
		</h1>
		<p class="hero-subtitle">
			A DAG-based DSP engine + pattern DSL that runs in the browser, on desktop, in Godot, and on ESP32.
		</p>
		<div class="hero-ctas">
			<a href="https://live.nkido.cc" class="cta-primary" target="_blank" rel="noopener">
				Try it in your browser
				<ArrowRight size={18} />
			</a>
			<a href="https://github.com/mlaass/nkido" class="cta-secondary" target="_blank" rel="noopener">
				<Github size={18} />
				View on GitHub
			</a>
		</div>
	</div>
</section>

<style>
	.hero {
		padding: var(--spacing-3xl) var(--content-padding);
		text-align: center;
		background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
	}

	.hero-content {
		max-width: 800px;
		margin: 0 auto;
	}

	.hero-title {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 700;
		margin-bottom: var(--spacing-lg);
		line-height: 1.1;
	}

	.highlight {
		color: var(--accent-primary);
	}

	.hero-subtitle {
		font-size: clamp(1rem, 2vw, 1.25rem);
		color: var(--text-secondary);
		margin-bottom: var(--spacing-xl);
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.hero-ctas {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		flex-wrap: wrap;
	}

	.cta-primary, .cta-secondary {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: 8px;
		font-weight: 600;
		font-size: 1rem;
		text-decoration: none;
		transition: all var(--transition-fast);
	}

	.cta-primary {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.cta-primary:hover {
		background: #4f9ae8;
		text-decoration: none;
	}

	.cta-secondary {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border: 1px solid var(--border-default);
	}

	.cta-secondary:hover {
		background: var(--bg-hover);
		border-color: var(--text-muted);
		text-decoration: none;
	}

	@media (max-width: 480px) {
		.hero {
			padding: var(--spacing-2xl) var(--content-padding);
		}

		.hero-ctas {
			flex-direction: column;
			align-items: stretch;
		}

		.cta-primary, .cta-secondary {
			justify-content: center;
		}
	}
</style>