<script lang="ts">
	import DocPage from '$lib/components/Docs/DocPage.svelte';
</script>

<DocPage
	title="Signals & DAGs"
	description="How audio flows through NKIDO's directed acyclic graph."
	backHref="/docs/concepts"
	backLabel="Concepts"
	referenceKeyword="signal"
>
	<p>
		A <strong>signal</strong> in NKIDO is any value that changes over time — typically audio,
		but also control values like envelopes or LFOs. Every patch is just a graph of signals
		flowing through operators.
	</p>

	<h2>Everything is a graph</h2>
	<p>
		When you write a patch, you're describing a <strong>DAG</strong> (directed acyclic graph) of
		DSP nodes. Each node takes signals as input and produces a signal as output. The pipe
		operator <code>|&gt;</code> connects them.
	</p>

	<pre><code>osc('sin', 440) * 0.3
  |&gt; filter('lp', 1200)
  |&gt; reverb(0.4)
  |&gt; out()</code></pre>

	<div class="ascii">
 osc(sin, 440)
       │
       ▼
    * 0.3
       │
       ▼
 filter(lp, 1200)
       │
       ▼
 reverb(0.4)
       │
       ▼
     out()
	</div>

	<p>
		NKIDO compiles this graph to bytecode that runs in a stack-based VM, one audio block
		at a time. No per-sample allocations, no runtime garbage collection.
	</p>

	<h2>Signal rates</h2>
	<p>
		Signals run at one of two rates:
	</p>
	<ul>
		<li>
			<strong>Audio-rate</strong> — one value per sample (48 kHz typical). Oscillators, filters,
			delays, mixers all produce audio-rate signals.
		</li>
		<li>
			<strong>Control-rate</strong> — one value per audio block (~128 samples). Cheaper;
			used for parameter modulation like LFOs and envelopes.
		</li>
	</ul>
	<p>
		You rarely need to think about rates directly — operators coerce as needed — but
		control-rate modulation is how you get CPU-efficient sweeps and LFOs.
	</p>

	<h2>Why a DAG?</h2>
	<p>
		A DAG has no cycles, which means every signal can be computed in topological order
		with a single pass through the graph. That's what makes NKIDO fast enough to run on
		a microcontroller and still predictable enough to hot-swap safely.
	</p>

	<blockquote>
		Feedback loops (delays, reverb tails) are modeled as <em>explicit</em> delay-line
		nodes, not as cycles in the graph. This keeps the DAG acyclic while still letting
		you build feedback-heavy patches.
	</blockquote>

	<h2>Next</h2>
	<ul>
		<li><a href="/docs/concepts/hot-swap">Hot-swap explained →</a></li>
		<li><a href="/docs/tutorials/hello-sine">Tutorial: Hello Sine →</a></li>
	</ul>
</DocPage>
