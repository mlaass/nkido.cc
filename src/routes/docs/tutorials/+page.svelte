<script lang="ts">
	import DocIndex from '$lib/components/Docs/DocIndex.svelte';
	import manifest from '$lib/data/docs-manifest.json';

	type ManifestEntry = { title: string; description?: string; url: string };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const entries = (manifest as Manifest).entries['tutorials'] ?? [];
</script>

<DocIndex
	title="Tutorials"
	intro="Progressive, runnable walk-throughs. Start with Hello Sine and work your way down."
	{entries}
/>
