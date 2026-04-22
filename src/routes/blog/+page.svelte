<script lang="ts">
	import { FileText, ArrowRight, Github } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Blog — NKIDO</title>
	<meta name="description" content="News and updates from the NKIDO project." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Blog</h1>
		<p class="intro">
			News, updates, and behind-the-scenes stories.
		</p>

		<div class="posts-placeholder">
			<p>Coming soon — launch announcement and dev journal posts.</p>
			<a href="https://github.com/mlaass/nkido/releases" class="link-button" target="_blank" rel="noopener">
				<Github size={18} />
				View Releases on GitHub
				<ArrowRight size={16} />
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

	.posts-placeholder {
		padding: var(--spacing-2xl);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		text-align: center;
	}

	.posts-placeholder p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.link-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-default);
		border-radius: 8px;
	}
</style>