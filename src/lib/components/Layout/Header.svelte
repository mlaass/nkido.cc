<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$lib/components/Logo/Logo.svelte';
	import { Menu, X } from 'lucide-svelte';

	let open = $state(false);

	function toggle() {
		open = !open;
	}

	function close() {
		open = false;
	}

	// Close the menu when the route changes.
	$effect(() => {
		$page.url.pathname;
		open = false;
	});

	type Link = { href: string; label: string; match?: string; external?: boolean };
	const links: Link[] = [
		{ href: 'https://live.nkido.cc', label: 'Live', external: true },
		{ href: '/docs', label: 'Docs', match: '/docs' },
		{ href: '/godot', label: 'Godot', match: '/godot' },
		{ href: '/esp32', label: 'ESP32', match: '/esp32' },
		{ href: '/blog', label: 'Blog', match: '/blog' },
		{ href: 'https://github.com/mlaass/nkido', label: 'GitHub', external: true }
	];

	function isActive(match: string | undefined, path: string) {
		if (!match) return false;
		if (match === '/') return path === '/';
		return path === match || path.startsWith(match + '/');
	}
</script>

<header class="header">
	<div class="header-inner">
		<a href="/" class="logo-link" onclick={close}>
			<Logo size={32} />
			{#if false}
			<span class="logo-text">NKIDO</span>
			{/if}
		</a>

		<nav class="nav-desktop">
			{#each links as link}
				<a
					href={link.href}
					class="nav-link"
					class:active={isActive(link.match, $page.url.pathname)}
					target={link.external ? '_blank' : undefined}
					rel={link.external ? 'noopener' : undefined}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<button
			class="nav-toggle"
			onclick={toggle}
			aria-expanded={open}
			aria-label={open ? 'Close menu' : 'Open menu'}
		>
			{#if open}
				<X size={22} />
			{:else}
				<Menu size={22} />
			{/if}
		</button>
	</div>

	{#if open}
		<nav class="nav-mobile">
			{#each links as link}
				<a
					href={link.href}
					class="nav-link-mobile"
					class:active={isActive(link.match, $page.url.pathname)}
					target={link.external ? '_blank' : undefined}
					rel={link.external ? 'noopener' : undefined}
					onclick={close}
				>
					{link.label}
				</a>
			{/each}
		</nav>
	{/if}
</header>

<style>
	.header {
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
		height: var(--header-height);
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

	.logo-text {
		font-weight: 600;
		font-size: 1.25rem;
	}

	.nav-desktop {
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

	.nav-toggle {
		display: none;
		padding: var(--spacing-xs);
		color: var(--text-primary);
		border-radius: 6px;
	}

	.nav-toggle:hover {
		background: var(--bg-tertiary);
	}

	.nav-mobile {
		display: none;
		flex-direction: column;
		padding: var(--spacing-sm) var(--content-padding) var(--spacing-md);
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-muted);
	}

	.nav-link-mobile {
		padding: var(--spacing-sm) 0;
		color: var(--text-secondary);
		font-size: 1rem;
		border-bottom: 1px solid var(--border-muted);
		text-decoration: none;
	}

	.nav-link-mobile:last-child {
		border-bottom: 0;
	}

	.nav-link-mobile.active {
		color: var(--accent-primary);
	}

	@media (max-width: 720px) {
		.nav-desktop {
			display: none;
		}

		.nav-toggle {
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		.nav-mobile {
			display: flex;
		}

		.logo-text {
			display: inline;
		}
	}
</style>
