<script lang="ts">
	import DocPage from '$lib/components/Docs/DocPage.svelte';
</script>

<DocPage
	title="Mini-notation"
	description="Strudel/Tidal-style pattern syntax for rapid musical exploration."
	backHref="/docs/concepts"
	backLabel="Concepts"
	referenceKeyword="mini-notation"
>
	<p>
		Mini-notation is a terse, string-based DSL for describing rhythmic patterns. It comes
		from the TidalCycles family and is embedded inside Akkado alongside the regular
		DSP-graph syntax.
	</p>

	<h2>The basics</h2>
	<p>
		A pattern string is a space-separated list of events that evenly fill one cycle (by
		default, one bar).
	</p>

	<pre><code>"c4 e4 g4 b4"       // four notes, one per beat
"c4 [e4 g4] b4"     // subdivide: e4+g4 share beat 2
"c4 ~ e4 ~"         // ~ is a rest
"c4*4"              // repeat c4 four times in the slot
"&lt;c4 e4 g4&gt;"       // one note per cycle, rotating</code></pre>

	<h2>Combining with signals</h2>
	<p>
		Patterns in NKIDO are regular signals — you pipe them into oscillators just like you'd
		pipe a control signal.
	</p>

	<pre><code>note("c4 e4 g4 b4")
  |&gt; osc('saw')
  |&gt; filter('lp', 1200)
  |&gt; out()</code></pre>

	<p>
		The <code>note()</code> builtin turns a pattern string into a frequency signal. When
		the pattern advances, the oscillator's frequency updates on the beat — and because of
		hot-swap, the phase keeps going across pitch changes.
	</p>

	<h2>Effects within the pattern</h2>
	<p>
		Mini-notation supports a handful of inline effects:
	</p>
	<ul>
		<li><code>x!3</code> — replicate <code>x</code> three times inline.</li>
		<li><code>x@2</code> — <code>x</code> takes twice as long as the others.</li>
		<li><code>x?</code> — play <code>x</code> with 50% probability.</li>
		<li><code>[a,b]</code> — play <code>a</code> and <code>b</code> in parallel.</li>
	</ul>

	<h2>Example: a two-bar riff</h2>
	<pre><code>note("&lt;c4 eb4&gt; g4 [bb4 c5] a4")
  |&gt; osc('square')
  |&gt; filter('lp', 2000 + envelope(0.2, 0.4) * 3000)
  |&gt; * 0.25
  |&gt; reverb(0.3)
  |&gt; out()</code></pre>

	<blockquote>
		Every slot in the pattern is itself a signal, so you can modulate per-slot parameters
		— velocity, filter, pan — by writing a parallel pattern and multiplying.
	</blockquote>

	<h2>Next</h2>
	<ul>
		<li><a href="/docs/concepts/signals">Signals & DAGs →</a></li>
		<li><a href="/docs/tutorials/hello-sine">Tutorial: Hello Sine →</a></li>
	</ul>
</DocPage>
