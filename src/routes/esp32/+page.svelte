<script lang="ts">
	import { Github, ExternalLink, Cpu } from 'lucide-svelte';
</script>

<svelte:head>
	<title>NKIDO on embedded hardware: ESP32 port</title>
	<meta
		name="description"
		content="Cedar runs on a $10 ESP32. Proof that nkido is in range for guitar pedals, Eurorack modules, and custom instruments."
	/>
	<meta property="og:title" content="NKIDO on embedded hardware" />
	<meta
		property="og:description"
		content="Cedar runs on a $10 ESP32. Proof that nkido is in range for guitar pedals, Eurorack modules, and custom instruments."
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nkido.cc/esp32" />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>NKIDO on embedded hardware</h1>
		<p class="intro">
			Cedar runs on a $10 ESP32. That puts nkido in range of guitar pedals, Eurorack modules,
			stompboxes, and custom instruments. Anywhere you want live-coded audio without a laptop
			in the loop.
		</p>

		<div class="status-banner">
			<Cpu size={16} />
			<span class="status-badge">Phase 3</span>
			<span>Reference build runs on AI-Thinker ESP32-A1S Audio Kit: boot, live-push, six-key control</span>
		</div>

		<section>
			<h2 id="proof-of-concept">Proof of concept, not a product</h2>
			<p>
				The ESP32 port is about showing that the cedar VM (hot-swap, live-coded patches, all
				the pieces that make nkido feel the way it does) fits on a chip that's cheap and
				widely available. Once that's true, the interesting question shifts from "does it
				work?" to "what do you build with it?"
			</p>

			<div class="sketch-grid">
				<article class="sketch">
					<h3>Guitar pedal</h3>
					<p>
						Pair the chip with a pedal-grade audio frontend, wire footswitches to GPIO and
						an expression pedal to the ADC, and you have a programmable effect box. The
						same live-push workflow applies: edit a patch, stomp, the sound changes.
					</p>
				</article>
				<article class="sketch">
					<h3>Eurorack module</h3>
					<p>
						Map CV inputs to patch parameters, gate inputs to envelope triggers, and fit
						the result into a few HP of front panel. Cedar's live-push means the module's
						voice can be redefined without a firmware flash.
					</p>
				</article>
				<article class="sketch">
					<h3>Standalone instrument</h3>
					<p>
						Battery, a small screen, a handful of physical controls. No host required. The
						last-pushed patch persists across reboots, so the device boots straight into
						whatever sound it was making.
					</p>
				</article>
			</div>

			<p class="caveat">
				None of those are built yet. The port gets us to the starting line: running cedar on
				a cheap chip, with the nkido workflow intact.
			</p>
		</section>

		<section>
			<h2 id="whats-running">What's running today</h2>
			<p>
				The reference build targets the <strong>AI-Thinker ESP32-A1S Audio Kit 2.2</strong>,
				a classic ESP32 paired with an ES8388 stereo codec, a headphone amp, and six onboard
				tactile switches. It boots, plays a 440 Hz sine out the jack, accepts patch pushes
				over USB serial, and binds the six buttons to the running patch's parameters. Other
				ESP32 + ES8388 boards will probably work with little or no modification; different
				codecs or chips need a new driver and sensible config changes.
			</p>
			<p>
				The full story of the port (what fought me, the decisions behind each phase, and what
				turned out easier than expected) is in the <a href="/blog/esp32-port-story">dev journal</a>.
			</p>
		</section>

		<section>
			<h2 id="try-it">Try it</h2>
			<p>
				If you have an A1S Audio Kit and a USB cable, the fastest path is the Docker build.
				No toolchain install required.
			</p>
			<div class="code-block">
				<pre><code>git clone --recursive https://github.com/mlaass/cedar-esp32.git
cd cedar-esp32
./scripts/docker-build.sh
./scripts/docker-flash.sh /dev/ttyUSB0</code></pre>
			</div>
			<p>
				Once it's running, push a new patch over serial:
			</p>
			<div class="code-block">
				<pre><code>python3 -m cedar_push --port /dev/ttyUSB0 my-patch.cbc</code></pre>
			</div>
			<p>
				For native ESP-IDF builds, pin maps, board-specific config, and the full reference,
				see the
				<a href="https://github.com/mlaass/cedar-esp32#readme" target="_blank" rel="noopener">repo README</a>
				and
				<a href="https://github.com/mlaass/cedar-esp32/blob/main/docs/build-docker.md" target="_blank" rel="noopener">build-docker.md</a>.
			</p>
		</section>

		<section>
			<h2 id="how-it-works">How it works</h2>

			<h3>Live patch push</h3>
			<p>
				The host compiles an Akkado patch to bytecode with parameter metadata, wraps it in a
				small <code>.cbc</code> container, and sends it over USB serial. Cedar's built-in
				crossfade handles the transition at the next audio block, so patches swap without
				dropping samples. End-to-end latency is under 50 ms. Wire format and frame types are
				in
				<a href="https://github.com/mlaass/cedar-esp32/blob/main/docs/uart-protocol.md" target="_blank" rel="noopener">docs/uart-protocol.md</a>.
			</p>

			<h3>Controls bind to the patch, not the board</h3>
			<p>
				Patches declare parameters. The device binds the first six declarations to the six
				onboard buttons in order, and each new patch re-maps them. This is the key insight
				for embedded deployment: a pedal or module's front panel can be wired to patch
				parameters the same way, and the patch stays portable between hardware targets.
			</p>

			<h3>VM in slow memory, hot path in fast memory</h3>
			<p>
				The cedar VM's working state (around 1.15 MB of buffer pools, state pools, and reverb
				buffers) lives in the ESP32's PSRAM, the chip's slower external memory. Internal SRAM
				is reserved for the audio-rate code path. That split is what makes the footprint budget
				work on a chip with only ~128 KB of fast memory.
			</p>

			<h3>Persistence</h3>
			<p>
				The most recent pushed patch is stored in on-chip flash and loaded at boot. Send
				<code>cedar-push --reset-program</code> to revert to the built-in demo.
			</p>
		</section>

		<section>
			<h2 id="footprint">Footprint</h2>
			<p>
				The Phase 3 firmware weighs in at about <strong>306 KB</strong>, roughly 10% of the
				app partition. To make that budget work, several cedar features are compiled out of
				the embedded build: audio decoders, SoundFont support, FFT, generic file I/O, MinBLEP
				oscillators, and the debug probe ring. Most come back in Phase 4 once on-device sample
				playback is wired up.
			</p>
			<p>
				Full size breakdown, per-opcode profiler output, and the regression rule are in
				<a href="https://github.com/mlaass/cedar-esp32/blob/main/docs/size-baseline.md" target="_blank" rel="noopener">docs/size-baseline.md</a>.
			</p>
		</section>

		<section class="links">
			<h2 id="links">More</h2>
			<a href="/blog/esp32-port-story" class="link-button">
				Dev journal: what it took to fit cedar on ESP32
			</a>
			<a
				href="https://github.com/mlaass/cedar-esp32"
				class="link-button"
				target="_blank"
				rel="noopener"
			>
				<Github size={18} />
				cedar-esp32 on GitHub
				<ExternalLink size={14} />
			</a>
			<a
				href="https://github.com/mlaass/cedar-esp32/blob/main/docs/uart-protocol.md"
				class="link-button"
				target="_blank"
				rel="noopener"
			>
				UART protocol spec
				<ExternalLink size={14} />
			</a>
			<a
				href="https://github.com/mlaass/cedar-esp32/blob/main/docs/a1s-pinout.md"
				class="link-button"
				target="_blank"
				rel="noopener"
			>
				A1S pin map &amp; hardware notes
				<ExternalLink size={14} />
			</a>
			<a
				href="https://github.com/mlaass/cedar-esp32/blob/main/docs/size-baseline.md"
				class="link-button"
				target="_blank"
				rel="noopener"
			>
				Memory &amp; footprint breakdown
				<ExternalLink size={14} />
			</a>
			<a
				href="https://github.com/mlaass/cedar-esp32/blob/main/docs/vectorization-feasibility.md"
				class="link-button"
				target="_blank"
				rel="noopener"
			>
				SIMD feasibility (ESP32 / S3 / C3 / P4)
				<ExternalLink size={14} />
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

	section h3 {
		margin-top: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
		font-size: 1rem;
	}

	section p {
		color: var(--text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.caveat {
		font-size: 0.875rem;
		color: var(--accent-warning, var(--text-secondary));
		border-left: 3px solid var(--accent-warning, var(--border-default));
		padding-left: var(--spacing-md);
		margin-top: var(--spacing-sm);
	}

	.code-block {
		background: var(--bg-tertiary);
		border-radius: 8px;
		padding: var(--spacing-md);
		overflow-x: auto;
		margin-bottom: var(--spacing-md);
	}

	.code-block pre {
		margin: 0;
	}

	.code-block code {
		font-size: 0.875rem;
	}

	.sketch-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: var(--spacing-md);
		margin: var(--spacing-md) 0;
	}

	.sketch {
		padding: var(--spacing-md);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 8px;
	}

	.sketch h3 {
		margin-top: 0;
		margin-bottom: var(--spacing-sm);
		font-size: 1rem;
		color: var(--text-primary);
	}

	.sketch p {
		margin: 0;
		font-size: 0.9375rem;
	}

	.links {
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--border-muted);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.link-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-default);
		border-radius: 8px;
		width: fit-content;
	}

	.link-button:hover {
		border-color: var(--accent-primary);
		text-decoration: none;
	}
</style>
