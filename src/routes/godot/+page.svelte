<script lang="ts">
	import { Github, ExternalLink } from 'lucide-svelte';
</script>

<svelte:head>
	<title>Godot Addon | NKIDO</title>
	<meta name="description" content="Embed NKIDO in your Godot 4.x games for dynamic music and sound design." />
	<meta property="og:title" content="NKIDO for Godot" />
	<meta property="og:description" content="Embed NKIDO in your Godot 4.x games for dynamic music and sound design." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nkido.cc/godot" />
</svelte:head>

<section class="page">
	<div class="page-inner">
		<h1>NKIDO for Godot</h1>
		<p class="intro">
			Live-coded audio synthesis as a Godot 4.x AudioStream resource. Ships as a GDExtension:
			compile your Akkado source at runtime, drive it with parameters, and visualize the output
			straight from GDScript.
		</p>

		<div class="status-banner">
			<span class="status-badge">v0.1</span>
			<span>Status: MVP. Hot-swap, params, samples, and waveform viz work end-to-end</span>
		</div>

		<section>
			<h2 id="install">Install</h2>
			<p>
				The addon is a GDExtension with prebuilt binaries for Linux, Windows, and macOS
				(debug + release). Godot <strong>4.1 or later</strong> required; developed against 4.5.
			</p>
			<h3>From a release zip</h3>
			<div class="code-block">
				<pre><code># Download the latest release
curl -LO https://github.com/mlaass/godot-nkido-addon/releases/latest/download/nkido.zip
unzip nkido.zip -d your-project/addons/</code></pre>
			</div>
			<h3>From source</h3>
			<p>
				Use this if you want to build for an unsupported platform or track the bleeding edge.
				Requires CMake 3.22+ and a C++20 toolchain. The build expects
				<code>godot-cpp</code> and <code>nkido</code> as sibling directories next to the addon.
			</p>
			<div class="code-block">
				<pre><code>git clone https://github.com/mlaass/godot-nkido-addon.git
git clone -b godot-4.5-stable https://github.com/godotengine/godot-cpp.git
git clone https://github.com/mlaass/nkido.git
cd godot-nkido-addon
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build -j$(nproc)</code></pre>
			</div>
			<p>
				Paths can be overridden with <code>-DGODOT_CPP_PATH=...</code> and
				<code>-DNKIDO_PATH=...</code>.
			</p>
			<p>
				After install, open Project → Reload the project. The NKIDO editor plugin adds a
				bottom panel for compiling and previewing patches.
			</p>
		</section>

		<section>
			<h2 id="quickstart">Quickstart</h2>
			<p>Attach an <code>AudioStreamPlayer</code> with its <code>stream</code> set to a new
			<code>NkidoAudioStream</code>. From GDScript, assign a <code>NkidoAkkadoSource</code> and
			call <code>compile()</code>:</p>
			<div class="code-block">
				<pre><code>extends Node

@onready var player: AudioStreamPlayer = $Player

func _ready() -> void:
    var stream: NkidoAudioStream = player.stream
    var akkado := NkidoAkkadoSource.new()
    akkado.source_code = """
        cutoff = param("cutoff", 1200, 100, 8000)
        osc("saw", 220) * 0.3
          |> lp(%, cutoff, 0.4)
          |> out(%, %)
    """
    stream.akkado_source = akkado
    stream.compilation_finished.connect(_on_compiled)
    stream.compile()

func _on_compiled(success: bool, errors: Array) -> void:
    if not success:
        for e in errors:
            push_error("Line %d: %s" % [e.line, e.message])
        return
    player.play()</code></pre>
			</div>
			<p>
				Load from a <code>.akk</code> file by dragging a <code>NkidoAkkadoSource</code> resource
				into the inspector; <code>.akk</code> files are loaded as first-class Godot resources.
			</p>
		</section>

		<section>
			<h2 id="api">API reference</h2>
			<p>All methods and signals below are on <code>NkidoAudioStream</code>, which extends
			<code>AudioStream</code>.</p>

			<h3>Properties</h3>
			<table class="api-table">
				<thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
				<tbody>
					<tr><td><code>akkado_source</code></td><td>NkidoAkkadoSource</td><td>null</td><td>Resource holding the Akkado source code (inline <code>source_code</code> string or loaded from a <code>.akk</code> file).</td></tr>
					<tr><td><code>sample_pack</code></td><td>Resource</td><td>null</td><td>Optional bundle of samples referenced by the patch.</td></tr>
					<tr><td><code>bpm</code></td><td>float</td><td>120.0</td><td>Tempo used by pattern builtins.</td></tr>
					<tr><td><code>crossfade_blocks</code></td><td>int</td><td>3</td><td>Hot-swap crossfade length, in audio blocks (1 to 10).</td></tr>
				</tbody>
			</table>

			<h3>Compilation &amp; hot-swap</h3>
			<table class="api-table">
				<thead><tr><th>Method</th><th>Returns</th><th>Description</th></tr></thead>
				<tbody>
					<tr><td><code>compile()</code></td><td>bool</td><td>Compile the assigned <code>akkado_source</code>. Hot-swaps the running program if already playing.</td></tr>
					<tr><td><code>is_compiled()</code></td><td>bool</td><td>Whether a valid program is loaded.</td></tr>
					<tr><td><code>get_diagnostics()</code></td><td>Array</td><td>List of <code>&lbrace;line, column, message&rbrace;</code> dicts from the last compile.</td></tr>
				</tbody>
			</table>

			<h3>Parameters (runtime)</h3>
			<table class="api-table">
				<thead><tr><th>Method</th><th>Description</th></tr></thead>
				<tbody>
					<tr><td><code>set_param(name: String, value: float, slew_ms := 20.0)</code></td><td>Smoothly set a <code>param()</code> declared in the patch.</td></tr>
					<tr><td><code>get_param(name: String) -&gt; float</code></td><td>Read the current value.</td></tr>
					<tr><td><code>trigger_button(name: String)</code></td><td>Pulse a <code>button()</code> (auto-releases after two audio blocks).</td></tr>
					<tr><td><code>get_param_decls() -&gt; Array</code></td><td>All params the current program exposes: <code>&lbrace;name, type, default, min, max, options&rbrace;</code>.</td></tr>
				</tbody>
			</table>

			<h3>Samples &amp; soundfonts</h3>
			<table class="api-table">
				<thead><tr><th>Method</th><th>Description</th></tr></thead>
				<tbody>
					<tr><td><code>load_sample(name, path) -&gt; bool</code></td><td>Register a WAV, OGG, FLAC, or MP3 file by logical name, reachable from pattern strings like <code>pat("name")</code>.</td></tr>
					<tr><td><code>load_soundfont(name, path) -&gt; bool</code></td><td>Register an SF2 soundfont.</td></tr>
					<tr><td><code>clear_samples() / clear_soundfonts()</code></td><td>Drop all currently loaded assets.</td></tr>
					<tr><td><code>get_loaded_samples() / get_loaded_soundfonts()</code></td><td>Inspect what's currently bound.</td></tr>
					<tr><td><code>get_required_samples() -&gt; Array</code></td><td>Sample names the last compile referenced (but may not be loaded yet).</td></tr>
				</tbody>
			</table>

			<h3>Visualization</h3>
			<p>
				<code>get_waveform_data()</code> returns a <code>PackedFloat32Array</code> of 1024
				interleaved L/R frames from the last rendered block, enough to drive a scope widget
				without reaching into the audio thread.
			</p>

			<h3>Signals</h3>
			<table class="api-table">
				<thead><tr><th>Signal</th><th>Payload</th></tr></thead>
				<tbody>
					<tr><td><code>compilation_finished</code></td><td><code>(success: bool, errors: Array)</code></td></tr>
					<tr><td><code>params_changed</code></td><td><code>(params: Array)</code>. Emitted when <code>get_param_decls()</code> would change (hot-swap across different param sets).</td></tr>
				</tbody>
			</table>
		</section>

		<section>
			<h2 id="interactive-example">Driving it from UI</h2>
			<p>A minimal patch with a cutoff slider and a trigger button:</p>
			<div class="code-block">
				<pre><code>extends Node

@onready var player: AudioStreamPlayer = $Player
@onready var cutoff: HSlider = $UI/Cutoff
@onready var hit_btn: Button = $UI/Hit
var stream: NkidoAudioStream

func _ready() -> void:
    stream = player.stream
    stream.compilation_finished.connect(_on_compiled)
    cutoff.value_changed.connect(func(v: float) -> void:
        stream.set_param("cutoff", v))
    hit_btn.pressed.connect(func() -> void:
        stream.trigger_button("hit"))
    stream.compile()

func _on_compiled(success: bool, _errors: Array) -> void:
    if success: player.play()</code></pre>
			</div>
		</section>

		<section>
			<h2 id="troubleshooting">Troubleshooting</h2>

			<h3>"No class named NkidoAudioStream"</h3>
			<p>The GDExtension didn't load. Check that the binary for your platform exists under
			<code>addons/nkido/bin/</code>. The naming convention is
			<code>libnkido.&lt;platform&gt;.template_&lt;mode&gt;.&lt;arch&gt;.&lt;ext&gt;</code>. A debug Linux build is
			<code>libnkido.linux.template_debug.x86_64.so</code>. Godot prints the missing path to
			the console; double-check it against <code>nkido.gdextension</code>'s library table.</p>

			<h3>Compile reports the same error twice</h3>
			<p>The editor plugin's bottom panel and your runtime code may both be compiling. Disable
			the plugin in Project Settings → Plugins while you debug runtime calls.</p>

			<h3>Audio clicks every time I edit</h3>
			<p>Raise <code>crossfade_blocks</code>. Default is 3 blocks (~8 ms at 48 kHz / 128-sample
			blocks). Values up to 10 are fine; above that the swap lag becomes audible. If clicks
			persist after raising it, the node's semantic ID is changing on every edit. See
			<a href="/docs/concepts/hot-swap">Hot-swap explained</a> for what keeps state.</p>

			<h3>Sample rate mismatch</h3>
			<p>NKIDO renders at the audio engine's mix rate, which Godot defaults to 44.1 kHz. If a
			patch sounds pitched, set <code>Project Settings → Audio → Driver → Mix Rate</code> to
			48000 and reload.</p>

			<h3>Building from source fails finding godot-cpp</h3>
			<p>The build expects <code>godot-cpp</code> and <code>nkido</code> as sibling directories
			next to <code>godot-nkido-addon</code>. Clone both, or override the paths with
			<code>-DGODOT_CPP_PATH=...</code> and <code>-DNKIDO_PATH=...</code> when running
			<code>cmake</code>.</p>
		</section>

		<section class="links">
			<h2 id="links">More</h2>
			<a href="https://github.com/mlaass/godot-nkido-addon" class="link-button" target="_blank" rel="noopener">
				<Github size={18} />
				godot-nkido-addon on GitHub
				<ExternalLink size={14} />
			</a>
			<a href="https://github.com/mlaass/godot-nkido-addon/tree/main/example" class="link-button" target="_blank" rel="noopener">
				Example scenes (Main.tscn, Interactive.tscn)
				<ExternalLink size={14} />
			</a>
			<a href="/docs/concepts/hot-swap" class="link-button">
				How hot-swap preserves state
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
