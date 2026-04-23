<script>
	import DocPage from '$lib/components/Docs/DocPage.svelte';

	let {
		title,
		description = '',
		date,
		author = 'mlaass',
		draft = false,
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

<svelte:head>
	{#if draft}
		<meta name="robots" content="noindex, nofollow" />
	{/if}
</svelte:head>

<DocPage
	{title}
	{description}
	backHref="/blog"
	backLabel="All posts"
>
	{#if draft}
		<div class="draft-banner" role="note">
			<strong>Draft.</strong> This post isn't published yet — it's visible only
			via its direct URL and not linked from <a href="/blog">/blog</a>. Review, then remove
			<code>draft: true</code> from the frontmatter to publish.
		</div>
	{/if}
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

	.draft-banner {
		padding: var(--spacing-sm) var(--spacing-md);
		margin-bottom: var(--spacing-lg);
		background: var(--bg-tertiary);
		border: 1px dashed var(--accent-warning, var(--border-default));
		border-radius: 8px;
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.draft-banner code {
		background: var(--bg-secondary);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 0.875em;
	}
</style>
