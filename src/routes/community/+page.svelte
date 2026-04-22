<script lang="ts">
	import { Github, Heart } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Community — NKIDO</title>
	<meta name="description" content="Join the NKIDO community — contribute, ask questions, and connect." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Community</h1>
		<p class="intro">
			NKIDO is an open source project. Here's how to get involved.
		</p>

		<section class="contribute">
			<h2>Contributing</h2>
			<p>
				We welcome contributions! Check the GitHub repo for open issues and PRs.
			</p>
			<a href="https://github.com/mlaass/nkido" class="link-button" target="_blank" rel="noopener">
				<Github size={18} />
				View on GitHub
			</a>
		</section>

		<section class="support">
			<h2>Support</h2>
			<p>
				For questions and discussions:
			</p>
			<ul>
				<li>GitHub Issues — bug reports and feature requests</li>
				<li>GitHub Discussions — questions and community chat</li>
			</ul>
		</section>

		<section class="sponsor">
			<h2>Sponsor</h2>
			<p>
				If NKIDO is useful to you, consider sponsoring:
			</p>
			<div class="sponsor-links">
				<a href="https://github.com/sponsors/mlaass" class="sponsor-button" target="_blank" rel="noopener">
					<Heart size={16} />
					GitHub Sponsors
				</a>
				<a href="https://ko-fi.com/mlaass" class="sponsor-button" target="_blank" rel="noopener">
					Ko-fi
				</a>
			</div>
		</section>
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

	section {
		margin-bottom: var(--spacing-2xl);
	}

	section h2 {
		margin-bottom: var(--spacing-sm);
	}

	section p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-md);
	}

	section ul {
		color: var(--text-secondary);
		padding-left: var(--spacing-lg);
	}

	section li {
		padding: var(--spacing-xs) 0;
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

	.sponsor-links {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.sponsor-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--accent-secondary);
		color: var(--bg-primary);
		border-radius: 8px;
		font-weight: 600;
	}
</style>