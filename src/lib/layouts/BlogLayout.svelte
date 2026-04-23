<script>
	import DocPage from '$lib/components/Docs/DocPage.svelte';

	let {
		title,
		description = '',
		date,
		author = 'mlaass',
		children
	} = $props();

	const formattedDate = $derived(
		new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<DocPage
	{title}
	{description}
	backHref="/blog"
	backLabel="All posts"
>
	<p class="byline">
		<time datetime={date}>{formattedDate}</time> · by {author}
	</p>
	{@render children()}
</DocPage>

<style>
	.byline {
		color: var(--text-secondary);
		font-size: 0.875rem;
		margin-bottom: var(--spacing-xl);
	}
</style>
