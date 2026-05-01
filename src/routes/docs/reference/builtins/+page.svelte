<script lang="ts">
	import DocIndex from '$lib/components/Docs/DocIndex.svelte';
	import manifest from '$lib/data/docs-manifest.json';

	type ManifestEntry = { title: string; description?: string; url: string };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const entries = (manifest as Manifest).entries['reference/builtins'] ?? [];
</script>

<DocIndex
	title="Builtins"
	intro="Oscillators, filters, delays, effects: the DSP primitives you combine into patches."
	backHref="/docs/reference"
	backLabel="Reference"
	{entries}
/>
