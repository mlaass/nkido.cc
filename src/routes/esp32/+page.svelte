<script lang="ts">
	import { Github, ArrowRight, Cpu } from 'lucide-svelte';
</script>

<svelte:head>
	<title>ESP32 Port — NKIDO</title>
	<meta name="description" content="Run NKIDO on ESP32-A1S Audio Kit for embedded audio projects." />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>NKIDO for ESP32</h1>
		<p class="intro">
			Cedar running on ESP32-A1S Audio Kit — high-performance audio synthesis for embedded hardware.
		</p>

		<div class="status-banner">
			<span class="status-badge">v0.1</span>
			<span>Status: MVP — core synthesis working, examples in progress</span>
		</div>

		<section class="hardware">
			<h2>Hardware</h2>
			<p>Requires ESP32-A1S Audio Kit 2.2 or compatible:</p>
			<ul>
				<li>ESP32-DevKitC or ESP32-WROVER</li>
				<li>ES8388 audio codec</li>
				<li>2x 3W class-D amplifiers</li>
				<li>Microphone input</li>
			</ul>
			<p class="caveat">
				Note: ~146 KB stripped binary, reduced memory limits apply.
			</p>
		</section>

		<section class="install">
			<h2>Build & Flash</h2>
			<p>Using ESP-IDF with ESP-ADF:</p>
			<div class="code-block">
				<pre><code># Clone the port
git clone https://github.com/mlaass/cedar-esp32.git
cd cedar-esp32

# Build
idf.py build

# Flash
idf.py -p /dev/ttyUSB0 flash monitor</code></pre>
			</div>
		</section>

		<section class="usage">
			<h2>Bytecode Loader</h2>
			<p>Load compiled bytecode over UART:</p>
			<div class="code-block">
				<pre><code># Compile with akkado-cli
./akkado-cli compile input.akk -o bytecode.bin

# Send to ESP32
python loader.py /dev/ttyUSB0 bytecode.bin</code></pre>
			</div>
		</section>

		<section class="controls">
			<h2>Hardware Controls</h2>
			<p>KEY1–KEY6 map to control triggers:</p>
			<div class="controls-grid">
				<div class="control-item">
					<kbd>KEY1</kbd> <span>Play/Pause</span>
				</div>
				<div class="control-item">
					<kbd>KEY2</kbd> <span>Next pattern</span>
				</div>
				<div class="control-item">
					<kbd>KEY3</kbd> <span>Random pattern</span>
				</div>
				<div class="control-item">
					<kbd>KEY4</kbd> <span>Volume -</span>
				</div>
				<div class="control-item">
					<kbd>KEY5</kbd> <span>Volume +</span>
				</div>
				<div class="control-item">
					<kbd>KEY6</kbd> <span>Reset</span>
				</div>
			</div>
		</section>

		<section class="examples">
			<h2>Example Patches</h2>
			<p>Small patches that fit ESP32 memory constraints:</p>
			<ul>
				<li>Simple sine drone</li>
				<li>Filter sweep</li>
				<li>8-step sequence</li>
			</ul>
		</section>

		<section class="links">
			<h2>More</h2>
			<a href="https://github.com/mlaass/cedar-esp32" class="link-button" target="_blank" rel="noopener">
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

	section ul {
		color: var(--text-secondary);
		padding-left: var(--spacing-lg);
	}

	section li {
		padding: var(--spacing-xs) 0;
	}

	.caveat {
		font-size: 0.875rem;
		color: var(--accent-warning);
		margin-top: var(--spacing-sm);
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

	.controls-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--spacing-md);
	}

	.control-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		background: var(--bg-secondary);
		border-radius: 8px;
	}

	.control-item kbd {
		background: var(--bg-tertiary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: 4px;
		font-family: var(--font-mono);
		font-size: 0.875rem;
	}

	.control-item span {
		font-size: 0.875rem;
		color: var(--text-secondary);
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

	@media (max-width: 640px) {
		.controls-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>