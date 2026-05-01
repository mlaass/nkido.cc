<script lang="ts">
	import { ArrowRight, Github, Tag } from 'lucide-svelte';
	import { posts } from '$lib/data/posts';

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Blog | NKIDO</title>
	<meta name="description" content="News and updates from the NKIDO project." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Blog</h1>
		<p class="intro">
			News, updates, and behind-the-scenes stories.
		</p>

		<ul class="posts">
			{#each posts as post}
				<li class="post">
					<a href={post.url} class="post-link">
						<div class="post-meta">
							{#if post.kind === 'release'}
								<span class="kind-tag release">
									<Tag size={12} />
									Release {post.tag}
								</span>
							{:else}
								<span class="kind-tag post-kind">Post</span>
							{/if}
							<time datetime={post.date}>{formatDate(post.date)}</time>
							<span class="divider">·</span>
							<span>{post.author}</span>
						</div>
						<h2>{post.title}</h2>
						<p>{post.excerpt}</p>
						<span class="read-more">
							Read <ArrowRight size={14} />
						</span>
					</a>
				</li>
			{/each}
		</ul>

		<div class="releases-hint">
			<a href="https://github.com/mlaass/nkido/releases" target="_blank" rel="noopener">
				<Github size={16} />
				Full release notes on GitHub
			</a>
		</div>
	</div>
</section>

<style>
	.page {
		padding: var(--spacing-3xl) var(--content-padding);
	}

	.page-inner {
		max-width: 800px;
		margin: 0 auto;
	}

	h1 {
		margin-bottom: var(--spacing-md);
	}

	.intro {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-2xl);
	}

	.posts {
		list-style: none;
		padding: 0;
		margin: 0 0 var(--spacing-2xl) 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.post-link {
		display: block;
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		text-decoration: none;
		color: var(--text-primary);
		transition: border-color var(--transition-fast);
	}

	.post-link:hover {
		border-color: var(--border-default);
		text-decoration: none;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--text-secondary);
		font-size: 0.8125rem;
		margin-bottom: var(--spacing-xs);
		flex-wrap: wrap;
	}

	.kind-tag {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		padding: 1px 6px;
		border-radius: 4px;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-secondary);
		margin-right: var(--spacing-xs);
	}

	.kind-tag.release {
		color: var(--accent-primary);
		border-color: var(--accent-primary);
	}

	.divider {
		color: var(--text-muted);
	}

	.post h2 {
		font-size: 1.25rem;
		margin-bottom: var(--spacing-sm);
	}

	.post p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.read-more {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--accent-primary);
		font-size: 0.875rem;
	}

	.releases-hint {
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--border-muted);
		font-size: 0.875rem;
	}

	.releases-hint a {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--text-secondary);
	}
</style>
