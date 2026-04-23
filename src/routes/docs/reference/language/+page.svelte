<script lang="ts">
	import DocIndex from '$lib/components/Docs/DocIndex.svelte';
	import manifest from '$lib/data/docs-manifest.json';

	type ManifestEntry = { title: string; description?: string; url: string };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const entries = (manifest as Manifest).entries['reference/language'] ?? [];
</script>

<DocIndex
	title="Language"
	intro="Akkado syntax: pipes, operators, variables, closures."
	backHref="/docs/reference"
	backLabel="Reference"
	{entries}
/>
