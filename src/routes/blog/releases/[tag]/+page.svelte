<script lang="ts">
	import { ArrowLeft, ExternalLink, Github } from 'lucide-svelte';
	import { renderMarkdown } from '$lib/utils/md';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const release = $derived(data.release);

	const formattedDate = $derived(
		new Date(release.date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);

	const bodyHtml = $derived(renderMarkdown(release.body));
</script>

<svelte:head>
	<title>{release.title} | NKIDO Release Notes</title>
	<meta name="description" content="Release notes for NKIDO {release.tag}." />
	<meta property="og:title" content="{release.title} | NKIDO" />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nkido.cc/blog/releases/{release.tag}" />
</svelte:head>

<article class="doc">
	<div class="doc-inner">
		<a href="/blog" class="back-link">
			<ArrowLeft size={14} />
			All posts
		</a>

		<div class="head">
			<span class="tag" class:pre={release.prerelease}>
				<Github size={14} />
				{release.tag}{#if release.prerelease}&nbsp;· pre-release{/if}
			</span>
			<h1>{release.title}</h1>
			<p class="byline">
				<time datetime={release.date}>{formattedDate}</time>
				<span class="divider">·</span>
				<a href={release.url} target="_blank" rel="noopener">
					On GitHub
					<ExternalLink size={12} />
				</a>
			</p>
		</div>

		<div class="body">
			{@html bodyHtml}
		</div>
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

	.head {
		margin-bottom: var(--spacing-2xl);
	}

	.tag {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: 2px 8px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		border-radius: 4px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.tag.pre {
		border-color: var(--accent-warning, var(--border-default));
		color: var(--accent-warning, var(--text-secondary));
	}

	h1 {
		margin-bottom: var(--spacing-sm);
	}

	.byline {
		color: var(--text-secondary);
		font-size: 0.875rem;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.byline a {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		color: var(--text-secondary);
	}

	.divider {
		color: var(--text-muted);
	}

	.body :global(h2) {
		margin-top: var(--spacing-xl);
		margin-bottom: var(--spacing-sm);
		font-size: 1.25rem;
	}

	.body :global(h3) {
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
		font-size: 1rem;
	}

	.body :global(ul),
	.body :global(ol) {
		color: var(--text-primary);
		line-height: 1.7;
		padding-left: var(--spacing-lg);
	}

	.body :global(li) {
		margin-bottom: var(--spacing-xs);
	}

	.body :global(p) {
		line-height: 1.7;
	}

	.body :global(code) {
		background: var(--bg-tertiary);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.875em;
	}

	.body :global(pre) {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		padding: var(--spacing-md);
		border-radius: 8px;
		overflow-x: auto;
		margin: var(--spacing-md) 0;
	}
</style>
