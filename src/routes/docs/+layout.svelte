<script lang="ts">
	import DocsShell from '$lib/components/Docs/DocsShell.svelte';

	let { children } = $props();
</script>

<DocsShell>
	{@render children()}
</DocsShell>
