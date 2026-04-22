<script lang="ts">
	import { Github, ArrowRight, BookOpen } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Godot Addon — NKIDO</title>
	<meta name="description" content="Embed NKIDO in your Godot 4.x games for dynamic music and sound design." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>NKIDO for Godot</h1>
		<p class="intro">
			Embed high-performance audio synthesis directly in your Godot 4.x games.
		</p>

		<div class="status-banner">
			<span class="status-badge">v0.1</span>
			<span>Status: MVP — core features working, documentation in progress</span>
		</div>

		<section class="install">
			<h2>Install</h2>
			<p>Add the addon via Godot's Asset Library or clone directly:</p>
			<div class="code-block">
				<pre><code># Via Asset Library
AssetLib → Search "nkido" → Install

# Or via git (in your project directory)
cd addons
git clone https://github.com/mlaass/godot-nkido-addon.git nkido</code></pre>
			</div>
		</section>

		<section class="quickstart">
			<h2>Quickstart</h2>
			<p>Add the NkidoPlayer node and play patterns from GDScript:</p>
			<div class="code-block">
				<pre><code>extends Node

@onready var nkido = $NkidoPlayer

func _ready():
    nkido.play("osc('saw', 220) * 0.3 |> out()")

func _on_play_button_pressed():
    # Change pattern while playing
    nkido.play("osc('sin', 440) * 0.3 |> out()")</code></pre>
			</div>
		</section>

		<section class="limits">
			<h2>Current Status</h2>
			<ul>
				<li>✓ Basic oscillators (sin, saw, tri, sqr)</li>
				<li>✓ Filters (lp, hp, bp)</li>
				<li>✓ Pattern playback via GDScript</li>
				<li>× Realtime code editing (planned)</li>
				<li>× Full Akkado parser (planned)</li>
			</ul>
		</section>

		<section class="links">
			<h2>More</h2>
			<a href="https://github.com/mlaass/godot-nkido-addon" class="link-button" target="_blank" rel="noopener">
				<Github size={18} />
				View on GitHub
				<ArrowRight size={16} />
			</a>
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
		margin-bottom: var(--spacing-lg);
	}

	.status-banner {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 8px;
		margin-bottom: var(--spacing-2xl);
		font-size: 0.9375rem;
	}

	.status-badge {
		background: var(--accent-primary);
		color: var(--bg-primary);
		padding: 2px 8px;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
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

	.code-block {
		background: var(--bg-tertiary);
		border-radius: 8px;
		padding: var(--spacing-md);
		overflow-x: auto;
	}

	.code-block pre {
		margin: 0;
	}

	.code-block code {
		font-size: 0.875rem;
	}

	.limits ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.limits li {
		padding: var(--spacing-xs) 0;
	}

	.limits li::before {
		content: "• ";
		color: var(--text-muted);
	}

	.links {
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--border-muted);
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