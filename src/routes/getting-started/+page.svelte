<script lang="ts">
	import { ArrowRight, Github, Terminal } from 'lucide-svelte';
	import DocsTOC from '$lib/components/Docs/DocsTOC.svelte';
	import type { Heading } from '$lib/components/Docs/headings';

	const tocHeadings: Heading[] = [
		{ slug: 'web-ide-first-run', text: 'Web IDE first run', depth: 2 },
		{ slug: 'cli-install', text: 'CLI install', depth: 2 },
		{ slug: 'first-patch', text: 'First patch', depth: 2 },
		{ slug: 'next-steps', text: 'Next steps', depth: 2 }
	];
</script>

<svelte:head>
	<title>Getting Started | NKIDO</title>
	<meta name="description" content="Get started with NKIDO. Install the CLI, try the web IDE, or embed in your project." />
	<meta property="og:title" content="Getting started with NKIDO" />
	<meta property="og:description" content="Install the CLI, try the web IDE, or embed NKIDO in your project." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nkido.cc/getting-started" />
</svelte:head>

<div class="gs-shell">
	<main class="gs-main" data-pagefind-body data-toc-root>
		<h1>Getting Started</h1>
		<p class="intro">
			Choose your path to get started with NKIDO.
		</p>

		<div class="path-grid">
			<div class="path-card">
				<div class="path-icon">
					<Github size={32} />
				</div>
				<h3>Web IDE</h3>
				<p>Try NKIDO in your browser. No install required.</p>
				<a href="https://live.nkido.cc" class="path-link" target="_blank" rel="noopener">
					Open in browser <ArrowRight size={16} />
				</a>
			</div>

			<div class="path-card">
				<div class="path-icon">
					<Terminal size={32} />
				</div>
				<h3>Native CLI</h3>
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

		<h2 id="web-ide-first-run">Web IDE first run</h2>
		<p>
			The fastest way to make a sound is the
			<a href="https://live.nkido.cc" target="_blank" rel="noopener">live IDE</a>. It runs entirely in
			your browser — no install, no account.
		</p>
		<ul>
			<li><strong>Browser:</strong> a current version of Chrome, Firefox, or Safari.</li>
			<li>
				<strong>Audio permission:</strong> the page will not produce sound until you interact with
				it. Click the editor or press the run key once after the page loads — that's the gesture the
				browser needs to unlock the audio context.
			</li>
			<li>
				<strong>Output:</strong> use headphones or a speaker. The default example is loud enough to
				be heard but won't damage anything.
			</li>
		</ul>
		<p>
			If you don't hear anything: check that your tab is unmuted, your output device is selected, and
			that the IDE's status bar isn't reporting an error.
		</p>

		<h2 id="cli-install">CLI install</h2>
		<p>
			The CLI is built from source today. Pre-built packages and Homebrew are not yet shipping; the
			steps below are the supported path.
		</p>

		<h3>macOS and Linux</h3>
		<p>You'll need <code>git</code>, <code>cmake</code>, and a recent C++ compiler.</p>
		<div class="code-block">
<pre><code>git clone https://github.com/mlaass/nkido
cd nkido
cmake -B build
cmake --build build</code></pre>
		</div>
		<p>
			Expected output: a successful build ends with the <code>nkido-cli</code> executable at
			<code>./build/tools/nkido-cli/nkido-cli</code>. Run it with no arguments to confirm it loads.
		</p>

		<h3>Windows</h3>
		<p>
			The recommended path on Windows is <strong>WSL</strong> (Windows Subsystem for Linux). Inside
			WSL, follow the macOS / Linux steps above. A native MSVC build is possible but not yet a
			supported path — expect rough edges if you try it.
		</p>

		<h3>Troubleshooting</h3>
		<ul>
			<li>
				<strong>cmake: command not found</strong> — install it from your package manager
				(<code>brew install cmake</code> on macOS, <code>apt install cmake</code> on
				Debian/Ubuntu).
			</li>
			<li>
				<strong>Compile errors about C++20</strong> — make sure your compiler is recent. GCC 11+,
				Clang 13+, or Apple Clang from Xcode 14+ are known to work.
			</li>
		</ul>

		<h2 id="first-patch">First patch</h2>
		<p>Save the following as <code>hello.akk</code>:</p>
		<div class="code-block">
<pre><code>osc("sin", 440) |> out(%, %)</code></pre>
		</div>
		<p>That's the smallest complete patch — a 440 Hz sine wave routed to both stereo channels.</p>
		<p>Run it from the build directory:</p>
		<div class="code-block">
<pre><code>./build/tools/nkido-cli/nkido-cli hello.akk</code></pre>
		</div>
		<p>
			You should hear a steady tone. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop. From here, edit
			<code>hello.akk</code> in your editor and re-run — or pop the patch into the
			<a href="https://live.nkido.cc" target="_blank" rel="noopener">live IDE</a> for the hot-swap
			workflow.
		</p>

		<h2 id="next-steps">Next steps</h2>
		<ul>
			<li>
				<a href="/docs/tutorials/hello-sine">Hello Sine</a> — work the first tutorial line by line.
			</li>
			<li>
				<a href="/docs/concepts/signals">Signals and DAGs</a> — the mental model behind every patch.
			</li>
			<li>
				<a href="/docs/tutorials/cookbook">Cookbook</a> — short, runnable recipes for drums, bass,
				pads, and leads.
			</li>
			<li>
				<a href="https://live.nkido.cc" target="_blank" rel="noopener">Live IDE</a> — try patches in
				your browser.
			</li>
			<li>
				<a href="https://github.com/mlaass/nkido" target="_blank" rel="noopener">GitHub repo</a> —
				source, issues, releases.
			</li>
		</ul>
	</main>

	<aside class="gs-toc">
		<DocsTOC headings={tocHeadings} position="sidebar" />
	</aside>
</div>

<style>
	.gs-shell {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--spacing-2xl);
		padding: var(--spacing-3xl) var(--content-padding);
		max-width: 1200px;
		margin: 0 auto;
	}

	.gs-main {
		max-width: 800px;
		margin: 0 auto;
		min-width: 0;
	}

	.gs-toc {
		display: none;
	}

	@media (min-width: 1024px) {
		.gs-shell {
			grid-template-columns: minmax(0, 1fr) 220px;
			max-width: 1280px;
			gap: var(--spacing-2xl);
		}

		.gs-main {
			margin: 0;
			max-width: 800px;
		}

		.gs-toc {
			display: block;
			position: sticky;
			top: var(--spacing-xl);
			align-self: start;
			max-height: calc(100vh - var(--spacing-2xl));
			overflow-y: auto;
		}
	}

	h1 {
		margin-bottom: var(--spacing-md);
	}

	h2 {
		margin-top: var(--spacing-2xl);
		margin-bottom: var(--spacing-md);
		scroll-margin-top: var(--spacing-2xl);
	}

	h3 {
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
	}

	.intro {
		font-size: 1.25rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-2xl);
	}

	.path-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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

	.path-card h3 {
		margin-top: 0;
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
		margin: var(--spacing-md) 0;
	}

	.code-block pre {
		margin: 0;
	}

	.code-block code {
		font-size: 0.875rem;
	}

	.gs-main ul {
		padding-left: var(--spacing-lg);
	}

	.gs-main li {
		padding: var(--spacing-2xs) 0;
	}

	kbd {
		display: inline-block;
		padding: 0 6px;
		border: 1px solid var(--border-muted);
		border-radius: 4px;
		background: var(--bg-tertiary);
		font-size: 0.8125rem;
		font-family: var(--font-mono, monospace);
	}

	@media (max-width: 640px) {
		.path-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
