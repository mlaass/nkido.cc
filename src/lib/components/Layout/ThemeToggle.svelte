<script lang="ts">
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { theme, type ThemePref } from '$lib/stores/theme.svelte';

	const NEXT: Record<ThemePref, ThemePref> = {
		system: 'light',
		light: 'dark',
		dark: 'system'
	};

	const LABEL: Record<ThemePref, string> = {
		system: 'system',
		light: 'light',
		dark: 'dark'
	};
</script>

<button
	type="button"
	class="theme-toggle"
	onclick={() => theme.cycle()}
	aria-label={`Theme: ${LABEL[theme.preference]}. Switch to ${LABEL[NEXT[theme.preference]]}.`}
	title={`Theme: ${LABEL[theme.preference]} — click for ${LABEL[NEXT[theme.preference]]}`}
>
	{#if theme.preference === 'system'}
		<Monitor size={18} aria-hidden="true" />
	{:else if theme.preference === 'light'}
		<Sun size={18} aria-hidden="true" />
	{:else}
		<Moon size={18} aria-hidden="true" />
	{/if}
</button>

<style>
	.theme-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 6px;
		color: var(--text-secondary);
		transition:
			color var(--transition-fast),
			background-color var(--transition-fast);
	}

	.theme-toggle:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
	}
</style>
