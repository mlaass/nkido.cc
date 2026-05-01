<script lang="ts">
	import { Download, Image } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Press Kit | NKIDO</title>
	<meta name="description" content="Press kit for NKIDO. Logos, screenshots, and descriptions for writers." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Press Kit</h1>
		<p class="intro">
			Logos, screenshots, and descriptions for articles and reviews.
		</p>

		<section class="logos">
			<h2>Logos</h2>
			<p>SVG and PNG formats in light/dark variants:</p>
			<div class="logo-grid">
				<div class="logo-item">
					<img src="/logo.svg" alt="NKIDO logo" class="logo-preview" />
					<span>SVG (light)</span>
				</div>
			</div>
			<a href="/logo.svg" class="download-link" download>
				<Download size={16} />
				Download SVG
			</a>
		</section>

		<section class="description">
			<h2>Short Description</h2>
			<blockquote>
				NKIDO is a high-performance live-coded audio synthesis system combining a pattern DSL
				with a DAG-based DSP engine. Runs in browsers, on desktop, in Godot, and on ESP32.
			</blockquote>

			<h3>Long Description</h3>
			<p>
				NKIDO is an open source audio synthesis platform consisting of two main components:
			</p>
			<ul>
				<li><strong>Akkado</strong>: a domain-specific language for live-coding musical patterns, combining Strudel/Tidal-style mini-notation with functional DAG-based audio processing</li>
				<li><strong>Cedar</strong>: a graph-based audio synthesis engine with a stack-based bytecode VM, designed for real-time DSP with zero allocations</li>
			</ul>
			<p>
				Nkido runs everywhere: web (via WASM), native CLI, Godot addon, and ESP32. MIT licensed.
			</p>
		</section>

		<section class="facts">
			<h2>Quick Facts</h2>
			<ul>
				<li><strong>License:</strong> MIT</li>
				<li><strong>Language:</strong> C++ (engine), TypeScript/Svelte (web)</li>
				<li><strong> First release:</strong> 2024</li>
				<li><strong>Platforms:</strong> Web, Native, Godot 4.x, ESP32</li>
			</ul>
		</section>

		<section class="contact">
			<h2>Contact</h2>
			<p>
				For press inquiries: open an issue on GitHub or reach out via the sponsor links.
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

	.logo-grid {
		display: flex;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
	}

	.logo-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border-radius: 8px;
	}

	.logo-preview {
		width: 64px;
		height: 64px;
	}

	.download-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	blockquote {
		border-left: 4px solid var(--accent-primary);
		padding-left: var(--spacing-md);
		margin: var(--spacing-md) 0;
		font-style: italic;
	}

	section h3 {
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
	}

	section ul {
		color: var(--text-secondary);
		padding-left: var(--spacing-lg);
	}

	section li {
		padding: var(--spacing-xs) 0;
	}
</style>