<script lang="ts">
	import { Github, ExternalLink, Cpu } from 'lucide-svelte';
</script>

<svelte:head>
	<title>ESP32 Port — NKIDO</title>
	<meta name="description" content="Run NKIDO on ESP32-A1S Audio Kit for embedded audio projects." />
	<meta property="og:title" content="NKIDO for ESP32" />
	<meta property="og:description" content="Run NKIDO on ESP32-A1S Audio Kit for embedded audio projects." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nkido.cc/esp32" />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>NKIDO for ESP32</h1>
		<p class="intro">
			Cedar running bare-metal on the AI-Thinker ESP32-A1S Audio Kit. Live-push patches over
			UART, drive six buttons as params, and hot-swap without dropping a sample.
		</p>

		<div class="status-banner">
			<Cpu size={16} />
			<span class="status-badge">Phase 3</span>
			<span>Boot + UART bytecode loader + KEY1–6 scanner all running on hardware</span>
		</div>

		<section>
			<h2 id="hardware">Hardware</h2>
			<p>
				The port targets the <strong>AI-Thinker ESP32-A1S Audio Kit 2.2</strong> — a classic
				ESP32 (LX6, not S3/C3) paired with an ES8388 stereo codec, onboard amplifier, and six
				tact switches. Other ESP32+ES8388 boards will likely work but aren't tested.
			</p>

			<h3>Pin map (board revision 2.2)</h3>
			<table class="api-table">
				<thead><tr><th>Signal</th><th>GPIO</th><th>Notes</th></tr></thead>
				<tbody>
					<tr><td>I2C SDA (ES8388 config)</td><td>33</td><td>Codec I2C address <code>0x10</code></td></tr>
					<tr><td>I2C SCL</td><td>32</td><td></td></tr>
					<tr><td>I2S MCLK</td><td>0</td><td>256·f<sub>s</sub> = 12.288 MHz @ 48 kHz</td></tr>
					<tr><td>I2S BCLK</td><td>27</td><td></td></tr>
					<tr><td>I2S WS / LRCK</td><td>25</td><td></td></tr>
					<tr><td>I2S DOUT (ESP → codec)</td><td>26</td><td>ADC (GPIO 35) unused in Phase 1</td></tr>
					<tr><td>PA_EN (speaker amp)</td><td>21</td><td>Drive high for speakers; headphones fine with low</td></tr>
					<tr><td>LED D4</td><td>22</td><td>Active-low</td></tr>
					<tr><td>KEY1</td><td>36</td><td>Input-only; board has external pull-up</td></tr>
					<tr><td>KEY2</td><td>13</td><td>Internal pull-up</td></tr>
					<tr><td>KEY3</td><td>19</td><td>Internal pull-up</td></tr>
					<tr><td>KEY4</td><td>23</td><td>Internal pull-up</td></tr>
					<tr><td>KEY5</td><td>18</td><td>Internal pull-up</td></tr>
					<tr><td>KEY6</td><td>5</td><td>Internal pull-up</td></tr>
				</tbody>
			</table>
			<p class="caveat">
				The onboard record button is wired to GPIO 36 as KEY1 — that pin is input-only with
				no internal pull-up, which is why the board carries an external one. Don't try to
				drive GPIO 36 as an output.
			</p>
		</section>

		<section>
			<h2 id="build">Build &amp; flash</h2>
			<p>
				The repo ships a Docker-based build that pins ESP-IDF to <code>release-v5.3</code> so
				you don't have to install a toolchain locally. Native builds work too if you already
				have IDF set up.
			</p>

			<h3>Docker (recommended)</h3>
			<div class="code-block">
				<pre><code>git clone --recursive https://github.com/mlaass/cedar-esp32.git
cd cedar-esp32

# Build akkado-cli on the host, compile assets/demo.akk to .cbc, then run idf.py build
./scripts/docker-build.sh

# Flash + open the monitor (USB path is typically /dev/ttyUSB0 on Linux)
./scripts/docker-flash.sh /dev/ttyUSB0</code></pre>
			</div>

			<h3>Native ESP-IDF</h3>
			<div class="code-block">
				<pre><code>. $IDF_PATH/export.sh
idf.py set-target esp32
idf.py build
idf.py -p /dev/ttyUSB0 flash monitor</code></pre>
			</div>
			<p>
				First build takes a few minutes; subsequent incremental builds are ~10 s. A successful
				boot prints the demo patch's state dump and immediately produces a 440 Hz sine on
				the codec output (verified on hardware).
			</p>

			<h3>Important <code>sdkconfig.defaults</code></h3>
			<table class="api-table">
				<thead><tr><th>Key</th><th>Value</th><th>Why</th></tr></thead>
				<tbody>
					<tr><td><code>CONFIG_ESP_DEFAULT_CPU_FREQ_MHZ</code></td><td>240</td><td>Not 160 — realtime DSP budget</td></tr>
					<tr><td><code>CONFIG_SPIRAM</code></td><td>y</td><td>VM heap lives in PSRAM; ~1.15 MB</td></tr>
					<tr><td><code>CONFIG_COMPILER_OPTIMIZATION_PERF</code></td><td>y</td><td>-O2, not -Os</td></tr>
					<tr><td><code>CONFIG_COMPILER_CXX_EXCEPTIONS</code></td><td>y</td><td>Cedar uses them; revisit if footprint becomes a problem</td></tr>
					<tr><td><code>CONFIG_FREERTOS_HZ</code></td><td>1000</td><td>1 ms tick for key scanning</td></tr>
					<tr><td><code>CONFIG_BT_ENABLED</code> / <code>CONFIG_ESP_WIFI_ENABLED</code></td><td>n</td><td>Save flash; not used yet</td></tr>
				</tbody>
			</table>
		</section>

		<section>
			<h2 id="uart-loader">Live-push over UART</h2>
			<p>
				Once the board is booted, push new patches to it without re-flashing. The host CLI
				lives at <code>tools/cedar-push/</code> and talks a tiny framed protocol over UART0
				(the same line <code>idf.py monitor</code> uses — stop the monitor first).
			</p>
			<div class="code-block">
				<pre><code># Compile an Akkado patch to .cbc (bytecode + param metadata)
./third_party/nkido/build-host/tools/akkado-cli/akkado-cli \
    my-patch.akk -o my-patch.cedar
python3 tools/pack_cedar.py my-patch.cedar -o my-patch.cbc

# Push it — the device hot-swaps at the next block boundary
python3 -m cedar_push /dev/ttyUSB0 my-patch.cbc</code></pre>
			</div>

			<h3>Protocol at a glance</h3>
			<p>
				Frames are: 2-byte magic <code>0xCE 0xDA</code>, 4-byte LE length, 1-byte type,
				payload, 4-byte LE CRC32 (IEEE 802.3, compatible with Python's <code>zlib.crc32</code>).
				Baud is 115200 today; a bump to 460800 is tracked in the port's PRD.
			</p>
			<table class="api-table">
				<thead><tr><th>Type</th><th>Direction</th><th>Payload</th></tr></thead>
				<tbody>
					<tr><td><code>0x01 SWAP</code></td><td>host → device</td><td>.cbc container (or raw .cedar)</td></tr>
					<tr><td><code>0x02 SET_PARAM</code></td><td>host → device</td><td>slot u8 + value f32 LE</td></tr>
					<tr><td><code>0x03 PING</code></td><td>host → device</td><td>—</td></tr>
					<tr><td><code>0x04 PERF_QUERY</code></td><td>host → device</td><td>top_n u8</td></tr>
					<tr><td><code>0x80 ACK</code></td><td>device → host</td><td>—</td></tr>
					<tr><td><code>0x81 NACK</code></td><td>device → host</td><td>reason u8 (CRC_FAIL, PROGRAM_TOO_LARGE, …)</td></tr>
				</tbody>
			</table>
		</section>

		<section>
			<h2 id="buttons">Buttons as patch params</h2>
			<p>
				Any patch that declares <code>param()</code>, <code>button()</code>, or
				<code>toggle()</code> automatically binds to KEY1…KEY6 in declaration order (up to
				six). No glue code needed on the device side.
			</p>
			<ul>
				<li><strong>param</strong>: each press steps the value by <code>(max − min) / 20</code>; wraps at the top.</li>
				<li><strong>button</strong>: momentary — pressed = 1.0, released = 0.0; gate-tight (slew 0).</li>
				<li><strong>toggle</strong>: each press flips between 0.0 and 1.0; also slew 0.</li>
			</ul>
			<p>Example <code>assets/demo_keys.akk</code>:</p>
			<div class="code-block">
				<pre><code>cutoff = param("cutoff", 800, 100, 8000)  # KEY1 steps ±390 Hz
trigger = button("trigger")               # KEY2 momentary gate
mute = toggle("mute", false)              # KEY3 flip-flops

osc("saw", 220) * 0.3
  |> lp(%, cutoff, 0.4)
  |> mul(%, 1.0 - mute)
  |> adsr(trigger, 0.01, 0.2, 0.4, 0.5)
  |> out(%, %)</code></pre>
			</div>
			<p>
				Scan interval is 5 ms with a 15 ms debounce (3 stable reads). When a new program is
				loaded, the device rebinds the keys based on the fresh param table — so every .cbc
				push re-maps the board's interface automatically.
			</p>
		</section>

		<section>
			<h2 id="sizes">Footprint</h2>
			<p>
				Current firmware (Phase 3) weighs in at ~377 KB on flash, taking about 10 % of the
				factory partition. The cedar VM itself — ~1.15 MB of state pools, buffers, and
				per-opcode storage — is heap-allocated in PSRAM; only a pointer sits in DRAM.
			</p>
			<p>
				To fit in embedded budgets, several cedar features are compiled out in the ESP32
				build: audio decoders, SoundFont support, FFT, generic file I/O, MinBLEP, and the
				debug probe ring buffer. Fixed-point opcodes are also disabled in favor of float-only
				builds. See <a href="https://github.com/mlaass/cedar-esp32/blob/main/docs/size-baseline.md" target="_blank" rel="noopener">docs/size-baseline.md</a>
				for the full memory breakdown.
			</p>
		</section>

		<section>
			<h2 id="troubleshooting">Troubleshooting</h2>

			<h3>Boot prints "demo bytecode rejected — audio task will output silence"</h3>
			<p>
				The baked-in demo failed <code>cedar::VM::load_program</code>. Usually means the demo
				was compiled against a newer Cedar than the one linked in. Re-run
				<code>./scripts/docker-build.sh</code> to regenerate <code>main/generated/demo_bytecode.h</code>.
			</p>

			<h3>Boot loops / brown-out resets</h3>
			<p>
				Especially likely when powering from a weak USB-C source, or with the on-board amp
				enabled and speakers plugged in. Try a 2 A supply, or drive PA_EN low to disable the
				amp while debugging.
			</p>

			<h3>No I2C ack from the codec</h3>
			<p>
				Check the ES8388 I2C pair (GPIO 32/33) with a logic analyzer — some clone boards use
				a different I2C address or swap SDA/SCL. The ES8388 init lives inline in
				<code>main/es8388.c</code> (about 150 lines) rather than pulling in ESP-ADF; easy to
				adjust for a fork.
			</p>

			<h3>UART push gets NACK: CRC_FAIL</h3>
			<p>
				Your monitor probably still has the serial port open. Close it first
				(<code>Ctrl+]</code> in <code>idf.py monitor</code>, or <code>pkill</code> minicom)
				before pushing.
			</p>

			<h3>Audio clicks / dropouts</h3>
			<p>
				CPU usage above ~80 % on core 1 triggers glitches. The device supports a per-opcode
				profiler — send a <code>PERF_QUERY</code> frame (or <code>cedar_push --perf</code>)
				and it dumps a hot-path histogram over UART.
			</p>

			<h3>Persisted patch won't clear</h3>
			<p>
				The device stores the last-pushed program in SPIFFS and loads it on next boot. To
				force a fresh start with the baked-in demo:
				<code>python3 -m cedar_push /dev/ttyUSB0 --reset-program</code>.
			</p>
		</section>

		<section class="links">
			<h2 id="links">More</h2>
			<a href="https://github.com/mlaass/cedar-esp32" class="link-button" target="_blank" rel="noopener">
				<Github size={18} />
				cedar-esp32 on GitHub
				<ExternalLink size={14} />
			</a>
			<a href="https://github.com/mlaass/cedar-esp32/blob/main/docs/uart-protocol.md" class="link-button" target="_blank" rel="noopener">
				Full UART protocol spec
				<ExternalLink size={14} />
			</a>
			<a href="https://github.com/mlaass/cedar-esp32/blob/main/docs/a1s-pinout.md" class="link-button" target="_blank" rel="noopener">
				A1S pinout reference
				<ExternalLink size={14} />
			</a>
			<a href="/blog/esp32-port-story" class="link-button">
				Dev-journal: what it took to fit cedar on ESP32
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

	section ul {
		color: var(--text-secondary);
		padding-left: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
	}

	section li {
		padding: var(--spacing-xs) 0;
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

	.api-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.875rem;
		margin-bottom: var(--spacing-md);
	}

	.api-table th,
	.api-table td {
		text-align: left;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-bottom: 1px solid var(--border-muted);
		vertical-align: top;
	}

	.api-table th {
		color: var(--text-primary);
		font-weight: 600;
	}

	.api-table td {
		color: var(--text-secondary);
	}

	.api-table code {
		background: var(--bg-tertiary);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 0.875em;
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
