<script lang="ts">
	import { Github, Heart, MessageCircle, Bug, Sparkles } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Community — NKIDO</title>
	<meta name="description" content="Join the NKIDO community — contribute, ask questions, and connect." />
	<meta property="og:title" content="NKIDO Community" />
	<meta property="og:description" content="Contribute, ask questions, and support the project." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nkido.cc/community" />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Community</h1>
		<p class="intro">
			NKIDO is open source and built in the open. Here's how to get involved.
		</p>

		<section class="card">
			<div class="card-head">
				<MessageCircle size={20} />
				<h2>Where to talk</h2>
			</div>
			<ul>
				<li>
					<a href="https://github.com/mlaass/nkido/discussions" target="_blank" rel="noopener">
						GitHub Discussions
					</a>
					— questions, ideas, "show and tell" patches.
				</li>
				<li>
					<a href="https://github.com/mlaass/nkido/issues" target="_blank" rel="noopener">
						GitHub Issues
					</a>
					— bug reports and feature requests.
				</li>
			</ul>
		</section>

		<section class="card">
			<div class="card-head">
				<Bug size={20} />
				<h2>Reporting bugs</h2>
			</div>
			<p>Good bug reports include:</p>
			<ul>
				<li>What you expected to happen.</li>
				<li>What actually happened (audio glitch, crash, error message).</li>
				<li>The smallest patch that reproduces it.</li>
				<li>Browser + OS for the web IDE; commit hash for native/Godot/ESP32.</li>
			</ul>
		</section>

		<section class="card">
			<div class="card-head">
				<Sparkles size={20} />
				<h2>Contributing code</h2>
			</div>
			<p>The codebase is split across a few repos:</p>
			<ul>
				<li>
					<a href="https://github.com/mlaass/nkido" target="_blank" rel="noopener">mlaass/nkido</a>
					— the engine (Cedar), the language (Akkado), and the web IDE.
				</li>
				<li>
					<a href="https://github.com/mlaass/godot-nkido-addon" target="_blank" rel="noopener">
						mlaass/godot-nkido-addon
					</a> — Godot 4.x integration.
				</li>
				<li>
					<a href="https://github.com/mlaass/cedar-esp32" target="_blank" rel="noopener">
						mlaass/cedar-esp32
					</a> — ESP32 port.
				</li>
				<li>
					<a href="https://github.com/mlaass/nkido.cc" target="_blank" rel="noopener">
						mlaass/nkido.cc
					</a> — this website.
				</li>
			</ul>
			<p>
				For non-trivial changes, please open an issue first to discuss the approach.
				PRs that include tests for new behavior are merged faster.
			</p>
		</section>

		<section class="card sponsor-card">
			<div class="card-head">
				<Heart size={20} />
				<h2>Sponsor</h2>
			</div>
			<p>
				NKIDO is MIT licensed and developed in spare time. If it's useful to you, sponsoring
				directly funds more development.
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

		<section class="card">
			<div class="card-head">
				<Github size={20} />
				<h2>How we talk</h2>
			</div>
			<p>
				Be useful, be patient, assume good faith. If you want a longer version of that,
				<a href="https://datatracker.ietf.org/doc/html/rfc1855" target="_blank" rel="noopener">RFC 1855 (Netiquette Guidelines, 1995)</a>
				still holds up. Questions or concerns go to
				<a href="mailto:moritz.laass@gmail.com">moritz.laass@gmail.com</a>.
			</p>
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

	.card {
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
		margin-bottom: var(--spacing-md);
	}

	.card-head {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
		color: var(--accent-primary);
	}

	.card-head h2 {
		font-size: 1.125rem;
		margin: 0;
		color: var(--text-primary);
	}

	.card p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.card ul {
		color: var(--text-secondary);
		padding-left: var(--spacing-lg);
		margin: 0;
	}

	.card li {
		padding: var(--spacing-xs) 0;
		line-height: 1.6;
	}

	.sponsor-card .sponsor-links {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
		margin-top: var(--spacing-md);
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

	.sponsor-button:hover {
		text-decoration: none;
		filter: brightness(1.1);
	}
</style>
