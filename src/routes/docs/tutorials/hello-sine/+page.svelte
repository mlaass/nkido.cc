<script lang="ts">
	import DocPage from '$lib/components/Docs/DocPage.svelte';
	import { ExternalLink } from 'lucide-svelte';
</script>

<DocPage
	title="Tutorial: Hello Sine"
	description="Your first NKIDO patch — a plain sine wave, modulated, then filtered."
	backHref="/docs"
	backLabel="Docs"
	referenceKeyword="osc"
>
	<p>
		This is the shortest path from "nothing" to "sound coming out of your speakers." No
		install needed — everything happens in the web IDE.
	</p>

	<h2>1. Open the IDE</h2>
	<p>
		Head to <a href="https://live.nkido.cc?patch=hello-sine" target="_blank" rel="noopener">
			live.nkido.cc <ExternalLink size={12} style="display:inline" />
		</a>. The IDE opens with the <code>hello-sine</code> patch preloaded.
	</p>

	<h2>2. Make a sound</h2>
	<p>Press <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> to run the patch:</p>
	<pre><code>osc('sin', 440) * 0.3
  |&gt; out()</code></pre>
	<p>
		You should hear a steady 440 Hz tone — an A4. The <code>* 0.3</code> is a safety
		gain so you don't blow out your ears.
	</p>

	<h2>3. Modulate the pitch</h2>
	<p>
		Now wrap the frequency in an LFO:
	</p>
	<pre><code>osc('sin', 440 + osc('sin', 0.5) * 40) * 0.3
  |&gt; out()</code></pre>
	<p>
		The inner oscillator runs at 0.5 Hz and swings the pitch ±40 Hz around the carrier.
		Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> — the tone starts wobbling without
		re-starting. That's hot-swap: the outer oscillator's phase is preserved while the
		new modulator fades in.
	</p>

	<h2>4. Add a filter</h2>
	<p>
		Change the waveform to a sawtooth and send it through a low-pass filter with a slow
		sweep:
	</p>
	<pre><code>osc('saw', 110) * 0.3
  |&gt; filter('lp', 500 + osc('sin', 0.2) * 400)
  |&gt; out()</code></pre>

	<h2>5. Next steps</h2>
	<ul>
		<li>Read <a href="/docs/concepts/signals">Signals & DAGs</a> for the mental model.</li>
		<li>Read <a href="/docs/concepts/hot-swap">Hot-swap explained</a> for why edits don't click.</li>
		<li>Read <a href="/docs/concepts/mini-notation">Mini-notation</a> to sequence pitches.</li>
		<li>Press <kbd>F1</kbd> in the IDE to search the full opcode reference.</li>
	</ul>
</DocPage>
