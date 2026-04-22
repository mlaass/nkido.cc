<script lang="ts">
	import { BookOpen, ArrowRight } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Concepts — NKIDO Docs</title>
	<meta name="description" content="Learn the core concepts behind NKIDO: signals, DAGs, hot-swap, and mini-notation." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Concepts</h1>
		<p class="intro">
			Understand the ideas that make NKIDO work.
		</p>

		<div class="concepts-list">
			<a href="https://live.nkido.cc/?docs=signals" class="concept-card" target="_blank" rel="noopener">
				<h2>Signals & DAGs</h2>
				<p>How audio flows through NKido's directed acyclic graph architecture.</p>
				<span class="learn-more">
					Learn more <ArrowRight size={14} />
				</span>
			</a>

			<a href="https://live.nkido.cc/?docs=hot-swap" class="concept-card" target="_blank" rel="noopener">
				<h2>Hot-swap Explained</h2>
				<p>Preserving state across code changes — no glitches, no drops.</p>
				<span class="learn-more">
					Learn more <ArrowRight size={14} />
				</span>
			</a>

			<a href="https://live.nkido.cc/?docs=mini-notation" class="concept-card" target="_blank" rel="noopener">
				<h2>Mini-notation</h2>
				<p>Strudel/Tidal-style pattern syntax for rapid musical exploration.</p>
				<span class="learn-more">
					Learn more <ArrowRight size={14} />
				</span>
			</a>

			<a href="https://live.nkido.cc/?docs=akkado" class="concept-card" target="_blank" rel="noopener">
				<h2>The Akkado Language</h2>
				<p>Nkido's domain-specific language for live-coding patterns.</p>
				<span class="learn-more">
					Learn more <ArrowRight size={14} />
				</span>
			</a>
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

	.concepts-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.concept-card {
		display: block;
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text-primary);
		transition: border-color var(--transition-fast);
	}

	.concept-card:hover {
		border-color: var(--border-default);
		text-decoration: none;
	}

	.concept-card h2 {
		font-size: 1.125rem;
		margin-bottom: var(--spacing-xs);
	}

	.concept-card p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.learn-more {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--accent-primary);
		font-size: 0.875rem;
	}
</style>