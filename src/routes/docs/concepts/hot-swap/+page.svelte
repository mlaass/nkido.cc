<script lang="ts">
	import DocPage from '$lib/components/Docs/DocPage.svelte';
</script>

<DocPage
	title="Hot-swap explained"
	description="How NKIDO replaces a running patch with a new one — without glitches."
	backHref="/docs/concepts"
	backLabel="Concepts"
	referenceKeyword="hot-swap"
>
	<p>
		Hot-swap is what turns NKIDO from a synth engine into a live-coding instrument. You
		change the code, press a key, and the new patch takes over — keeping oscillator phase,
		filter state, and delay lines intact.
	</p>

	<h2>The problem</h2>
	<p>
		A naïve "stop the old patch, start the new patch" approach sounds terrible:
	</p>
	<ul>
		<li>Oscillator phase resets → audible click.</li>
		<li>Delay lines and reverb tails drop to zero → tail cuts off mid-reverb.</li>
		<li>Envelopes restart → note retriggers unexpectedly.</li>
	</ul>
	<p>
		A live-coding system needs to <em>diff</em> the new patch against the old one, keep
		the nodes that still exist, and smoothly fade in anything new.
	</p>

	<h2>Semantic IDs</h2>
	<p>
		Every node in a NKIDO patch gets a stable <strong>semantic ID</strong> derived from
		its position in the source plus its operator + constant args. If you change a filter's
		cutoff but leave everything else alone, the node's ID stays the same — NKIDO recognizes
		it and keeps its internal state.
	</p>

	<div class="ascii">
  Old patch                New patch             Action
  ─────────                ─────────             ──────
  osc(sin, 440)       →    osc(sin, 440)         keep state
     |> * 0.3         →       |> * 0.3           keep state
     |> filter(lp,    →       |> filter(lp,      keep state
             1200)                  800)         update cutoff
     |> out()         →       |> out()           keep state
	</div>

	<h2>What gets preserved</h2>
	<p>When a node's ID matches between old and new:</p>
	<ul>
		<li>Oscillator phase.</li>
		<li>Filter delay registers (biquad state).</li>
		<li>Delay-line buffers and read/write positions.</li>
		<li>Envelope stage and level.</li>
		<li>Stateful RNG seeds for noise generators.</li>
	</ul>
	<p>
		New nodes start fresh. Removed nodes are phased out with a short crossfade.
	</p>

	<h2>When IDs change</h2>
	<p>
		Some edits necessarily break the identity of a node — adding a new filter in the
		middle of the chain, changing an oscillator's waveform, or renaming a variable. In
		those cases NKIDO falls back to a short crossfade (~10ms) to avoid clicks.
	</p>

	<blockquote>
		This is why live-coding feels musical in NKIDO: you can sculpt a running sound by
		nudging parameters, and the changes land on the beat instead of restarting the whole
		patch.
	</blockquote>

	<h2>Next</h2>
	<ul>
		<li><a href="/docs/concepts/mini-notation">Mini-notation →</a></li>
		<li><a href="/docs/tutorials/hello-sine">Tutorial: Hello Sine →</a></li>
	</ul>
</DocPage>
