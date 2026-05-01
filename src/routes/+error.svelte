<script lang="ts">
	import { Home } from 'lucide-svelte';
</script>

<svelte:head>
	<title>404 Page Not Found | NKIDO</title>
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>404</h1>
		<p class="message">Page not found</p>
		<a href="/" class="home-link">
			<Home size={18} />
			Go home
		</a>
	</div>
</section>

<style>
	.page {
		padding: var(--spacing-3xl) var(--content-padding);
		text-align: center;
	}

	.page-inner {
		max-width: 800px;
		margin: 0 auto;
	}

	h1 {
		font-size: 6rem;
		margin-bottom: var(--spacing-sm);
		color: var(--accent-primary);
	}

	.message {
		font-size: 1.5rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-xl);
	}

	.home-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: 8px;
	}
</style>