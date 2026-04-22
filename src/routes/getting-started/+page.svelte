<script lang="ts">
	import { ArrowRight, Github, Terminal } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Getting Started — NKIDO</title>
	<meta name="description" content="Get started with NKIDO — install the CLI, try the web IDE, or embed in your project." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>Getting Started</h1>
		<p class="intro">
			Choose your path to get started with NKIDO.
		</p>

		<div class="path-grid">
			<div class="path-card">
				<div class="path-icon">
					<Github size={32} />
				</div>
				<h2>Web IDE</h2>
				<p>Try NKIDO right in your browser — no install required.</p>
				<a href="https://live.nkido.cc" class="path-link" target="_blank" rel="noopener">
					Open in browser <ArrowRight size={16} />
				</a>
			</div>

			<div class="path-card">
				<div class="path-icon">
					<Terminal size={32} />
				</div>
				<h2>Native CLI</h2>
				<p>Build from source and run on the command line.</p>
				<div class="code-block">
					<pre><code>git clone https://github.com/mlaass/nkido
cd nkido
cmake -B build
cmake --build build
./build/tools/nkido-cli/nkido-cli</code></pre>
				</div>
			</div>
		</div>

		<section class="next-steps">
			<h2>What's next?</h2>
			<ul>
				<li><a href="/docs">Learn the concepts</a> — signals, DAGs, hot-swap</li>
				<li><a href="/features">Explore features</a> — full opcode reference</li>
				<li><a href="/godot">Use in Godot</a> — the NKIDO Godot addon</li>
				<li><a href="/esp32">Run on ESP32</a> — embedded audio hardware</li>
			</ul>
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

	.path-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-3xl);
	}

	.path-card {
		padding: var(--spacing-lg);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 12px;
	}

	.path-icon {
		color: var(--accent-primary);
		margin-bottom: var(--spacing-md);
	}

	.path-card h2 {
		margin-bottom: var(--spacing-sm);
	}

	.path-card p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.path-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
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

	.next-steps {
		padding-top: var(--spacing-xl);
		border-top: 1px solid var(--border-muted);
	}

	.next-steps h2 {
		margin-bottom: var(--spacing-md);
	}

	.next-steps ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.next-steps li {
		padding: var(--spacing-sm) 0;
	}

	.next-steps li::before {
		content: "→ ";
		color: var(--accent-primary);
	}

	@media (max-width: 640px) {
		.path-grid {
			grid-template-columns: 1fr;
		}
	}
</style>