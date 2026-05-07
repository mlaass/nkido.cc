<script lang="ts">
	interface Props {
		open?: boolean;
		children: import('svelte').Snippet;
	}

	let { open = $bindable(false), children }: Props = $props();

	let panelEl: HTMLElement | undefined = $state();
	let lastFocused: HTMLElement | null = null;

	function focusableEls(): HTMLElement[] {
		if (!panelEl) return [];
		return Array.from(
			panelEl.querySelectorAll<HTMLElement>(
				'a, button, input, [tabindex]:not([tabindex="-1"])'
			)
		).filter((el) => !el.hasAttribute('disabled'));
	}

	$effect(() => {
		if (!open) return;
		lastFocused = document.activeElement as HTMLElement;
		document.body.style.overflow = 'hidden';

		queueMicrotask(() => focusableEls()[0]?.focus());

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				open = false;
				return;
			}
			if (e.key !== 'Tab') return;
			const els = focusableEls();
			if (els.length === 0) return;
			const first = els[0];
			const last = els[els.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.overflow = '';
			lastFocused?.focus?.();
		};
	});
</script>

{#if open}
	<div
		class="backdrop"
		role="presentation"
		onclick={() => (open = false)}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') open = false;
		}}
	></div>
	<div
		class="panel"
		role="dialog"
		aria-modal="true"
		aria-label="Documentation menu"
		bind:this={panelEl}
	>
		<button class="close" type="button" onclick={() => (open = false)} aria-label="Close menu">
			×
		</button>
		<div class="panel-body">
			{@render children()}
		</div>
	</div>
{/if}

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(4px);
		z-index: 100;
	}

	.panel {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: min(320px, 90vw);
		background: var(--bg-secondary);
		border-right: 1px solid var(--border-default);
		z-index: 101;
		padding: var(--spacing-lg);
		overflow-y: auto;
		animation: slide-in var(--transition-normal, 0.2s) ease-out;
	}

	.panel-body {
		padding-top: var(--spacing-xl);
	}

	.close {
		position: absolute;
		top: var(--spacing-sm);
		right: var(--spacing-sm);
		background: none;
		border: 0;
		color: var(--text-primary);
		font-size: 1.75rem;
		line-height: 1;
		cursor: pointer;
		padding: var(--spacing-xs) var(--spacing-sm);
	}

	.close:hover {
		color: var(--accent-primary);
	}

	@keyframes slide-in {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}

	@media (min-width: 1024px) {
		.backdrop,
		.panel {
			display: none;
		}
	}
</style>
