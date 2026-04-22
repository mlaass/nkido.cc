<script lang="ts">
	import { Monitor, Terminal, Puzzle, Cpu } from 'lucide-svelte';
</script>

<section class="runs">
	<div class="runs-inner">
		<h2 class="runs-title">Where it runs</h2>
		<div class="runs-grid">
			<div class="run-item">
				<Monitor size={32} />
				<span>Web IDE</span>
			</div>
			<div class="run-item">
				<Terminal size={32} />
				<span>Native CLI</span>
			</div>
			<div class="run-item">
				<Puzzle size={32} />
				<span>Godot addon</span>
			</div>
			<div class="run-item">
				<Cpu size={32} />
				<span>ESP32</span>
			</div>
		</div>
	</div>
</section>

<style>
	.runs {
		padding: var(--spacing-3xl) var(--content-padding);
		background: var(--bg-secondary);
	}

	.runs-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		text-align: center;
	}

	.runs-title {
		font-size: 1.5rem;
		margin-bottom: var(--spacing-xl);
	}

	.runs-grid {
		display: flex;
		justify-content: center;
		gap: var(--spacing-2xl);
		flex-wrap: wrap;
	}

	.run-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--text-secondary);
		font-size: 1rem;
	}

	.run-item :global(svg) {
		color: var(--accent-primary);
	}
</style>