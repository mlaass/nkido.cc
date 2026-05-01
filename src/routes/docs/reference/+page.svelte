<script lang="ts">
	import DocIndex from '$lib/components/Docs/DocIndex.svelte';
	import manifest from '$lib/data/docs-manifest.json';

	type ManifestEntry = { title: string; description?: string; url: string };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const m = manifest as Manifest;

	function countIn(key: string): number {
		return m.entries[key]?.length ?? 0;
	}

	const entries = [
		{
			title: `Builtins (${countIn('reference/builtins')})`,
			description: 'Every oscillator, filter, delay, and effect that ships with NKIDO.',
			url: '/docs/reference/builtins'
		},
		{
			title: `Language (${countIn('reference/language')})`,
			description: 'Pipe operator, hole, variables, closures: the Akkado syntax reference.',
			url: '/docs/reference/language'
		},
		{
			title: `Mini-notation (${countIn('reference/mini-notation')})`,
			description: 'Pattern-syntax cheat sheet: events, subdivisions, microtonal, and more.',
			url: '/docs/reference/mini-notation'
		}
	];
</script>

<DocIndex
	title="Reference"
	intro="Every builtin, every operator, every syntax rule. Mirrored from the nkido repo so the web IDE and this site never drift."
	{entries}
/>
