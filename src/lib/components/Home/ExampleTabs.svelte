<script lang="ts">
	import type { LandingExample } from '$lib/data/landing-examples';

	interface Props {
		examples: LandingExample[];
		active: string;
		onSelect: (slug: string) => void;
	}

	let { examples, active, onSelect }: Props = $props();
</script>

<div class="tabs" role="tablist" aria-label="Example demos">
	{#each examples as example (example.slug)}
		<button
			role="tab"
			class="tab"
			class:active={example.slug === active}
			aria-selected={example.slug === active}
			aria-controls="example-frame"
			title={example.description}
			onclick={() => onSelect(example.slug)}
		>
			{example.label}
		</button>
	{/each}
</div>

<style>
	.tabs {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-lg);
	}

	.tab {
		padding: var(--spacing-sm) var(--spacing-md);
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border-default);
		border-radius: 999px;
		font-family: inherit;
		font-size: 0.9375rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background var(--transition-fast),
			color var(--transition-fast),
			border-color var(--transition-fast);
		white-space: nowrap;
	}

	.tab:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
		border-color: var(--border-default);
	}

	.tab.active {
		background: var(--accent-primary);
		color: var(--bg-primary);
		border-color: var(--accent-primary);
	}

	.tab.active:hover {
		background: var(--accent-primary);
		color: var(--bg-primary);
	}

	.tab:focus-visible {
		outline: 2px solid var(--accent-primary);
		outline-offset: 2px;
	}

	@media (max-width: 480px) {
		.tab {
			font-size: 0.8125rem;
			padding: 6px 10px;
		}
	}
</style>
