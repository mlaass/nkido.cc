<script lang="ts">
	import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-svelte';
	import manifest from '$lib/data/docs-manifest.json';

	interface Props {
		title: string;
		description?: string;
		backHref?: string;
		backLabel?: string;
		referenceKeyword?: string;
		children: import('svelte').Snippet;
	}

	let {
		title,
		description = '',
		backHref = '/docs',
		backLabel = 'All docs',
		referenceKeyword,
		children
	}: Props = $props();

	type ManifestEntry = { title: string; slug: string; url: string; keywords: string[] };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const referenceMatch = $derived.by(() => {
		if (!referenceKeyword) return null;
		const keyword = referenceKeyword.toLowerCase();
		const all = Object.values((manifest as Manifest).entries).flat();
		const exact = all.find(
			(e) => e.slug === keyword || e.keywords?.some((k) => k.toLowerCase() === keyword)
		);
		if (exact) return exact;
		const partial = all.find(
			(e) => e.keywords?.some((k) => k.toLowerCase().includes(keyword))
		);
		return partial ?? null;
	});
</script>

<svelte:head>
	<title>{title} — NKIDO Docs</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:title" content="{title} — NKIDO" />
	<meta property="og:type" content="article" />
</svelte:head>

<article class="doc">
	<div class="doc-inner">
		<a href={backHref} class="back-link">
			<ArrowLeft size={14} />
			{backLabel}
		</a>

		<h1>{title}</h1>
		{#if description}
			<p class="doc-lead">{description}</p>
		{/if}

		<div class="doc-body">
			{@render children()}
		</div>

		{#if referenceMatch}
			<footer class="doc-footer">
				<a href={referenceMatch.url}>
					<BookOpen size={16} />
					Reference: <code>{referenceMatch.title}</code>
					<ArrowRight size={14} />
				</a>
			</footer>
		{/if}
	</div>
</article>

<style>
	.doc {
		padding: var(--spacing-3xl) var(--content-padding);
	}

	.doc-inner {
		max-width: 760px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.back-link:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	h1 {
		margin-bottom: var(--spacing-md);
	}

	.doc-lead {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-2xl);
	}

	.doc-body :global(h2) {
		margin-top: var(--spacing-2xl);
		margin-bottom: var(--spacing-sm);
		font-size: 1.5rem;
	}

	.doc-body :global(h3) {
		margin-top: var(--spacing-xl);
		margin-bottom: var(--spacing-sm);
		font-size: 1.125rem;
	}

	.doc-body :global(p) {
		color: var(--text-primary);
		line-height: 1.7;
	}

	.doc-body :global(ul),
	.doc-body :global(ol) {
		color: var(--text-primary);
		line-height: 1.7;
		padding-left: var(--spacing-lg);
	}

	.doc-body :global(li) {
		margin-bottom: var(--spacing-xs);
	}

	.doc-body :global(code) {
		background: var(--bg-tertiary);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.875em;
	}

	.doc-body :global(pre) {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		padding: var(--spacing-md);
		border-radius: 8px;
		overflow-x: auto;
		margin: var(--spacing-md) 0;
	}

	.doc-body :global(pre code) {
		background: transparent;
		padding: 0;
		font-size: 0.875rem;
	}

	.doc-body :global(blockquote) {
		border-left: 3px solid var(--accent-primary);
		padding-left: var(--spacing-md);
		margin: var(--spacing-md) 0;
		color: var(--text-secondary);
		font-style: italic;
	}

	.doc-body :global(.ascii) {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		padding: var(--spacing-md);
		border-radius: 8px;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.4;
		white-space: pre;
		overflow-x: auto;
		margin: var(--spacing-md) 0;
	}

	.doc-footer {
		margin-top: var(--spacing-2xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--border-muted);
	}

	.doc-footer a {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 8px;
		font-size: 0.9375rem;
	}

	.doc-footer a:hover {
		border-color: var(--border-default);
		text-decoration: none;
	}

	.doc-footer code {
		background: var(--bg-tertiary);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 0.875em;
	}
</style>
