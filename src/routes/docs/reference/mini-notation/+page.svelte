<script lang="ts">
	import DocIndex from '$lib/components/Docs/DocIndex.svelte';
	import manifest from '$lib/data/docs-manifest.json';

	type ManifestEntry = { title: string; description?: string; url: string };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const entries = (manifest as Manifest).entries['reference/mini-notation'] ?? [];
</script>

<DocIndex
	title="Mini-notation reference"
	intro="Pattern-syntax reference. For a gentler intro, see the mini-notation concept page."
	backHref="/docs/reference"
	backLabel="Reference"
	{entries}
/>
