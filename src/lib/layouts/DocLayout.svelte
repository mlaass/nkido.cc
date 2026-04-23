<script>
	import DocPage from '$lib/components/Docs/DocPage.svelte';

	let {
		title,
		description = '',
		backHref = '/docs',
		backLabel = 'All docs',
		referenceKeyword,
		children
	} = $props();
</script>

<DocPage
	{title}
	{description}
	{backHref}
	{backLabel}
	{referenceKeyword}
>
	{@render children()}
</DocPage>
