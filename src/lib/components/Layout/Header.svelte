<script lang="ts">
	import { page } from '$app/stores';
</script>

<header class="header">
	<div class="header-inner">
		<a href="/" class="logo-link">
			<img src="/logo.svg" alt="NKIDO" class="logo" />
			<span class="logo-text">nkido</span>
		</a>

		<nav class="nav">
			<a href="https://live.nkido.cc" class="nav-link" target="_blank" rel="noopener">Live</a>
			<a href="/docs" class="nav-link" class:active={$page.url.pathname.startsWith('/docs')}>Docs</a>
			<a href="/godot" class="nav-link" class:active={$page.url.pathname === '/godot'}>Godot</a>
			<a href="/esp32" class="nav-link" class:active={$page.url.pathname === '/esp32'}>ESP32</a>
			<a href="/blog" class="nav-link" class:active={$page.url.pathname.startsWith('/blog')}>Blog</a>
			<a href="https://github.com/mlaass/nkido" class="nav-link" target="_blank" rel="noopener">GitHub</a>
		</nav>
	</div>
</header>

<style>
	.header {
		height: var(--header-height);
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border-muted);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.header-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--content-padding);
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.logo-link {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		text-decoration: none;
		color: var(--text-primary);
	}

	.logo-link:hover {
		text-decoration: none;
	}

	.logo {
		width: 32px;
		height: 32px;
	}

	.logo-text {
		font-weight: 600;
		font-size: 1.25rem;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.nav-link {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.nav-link:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	.nav-link.active {
		color: var(--accent-primary);
	}

	@media (max-width: 640px) {
		.nav {
			gap: var(--spacing-md);
		}

		.nav-link {
			font-size: 0.875rem;
		}

		.logo-text {
			display: none;
		}
	}
</style>