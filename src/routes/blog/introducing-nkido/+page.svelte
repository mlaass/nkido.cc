<script lang="ts">
	import DocPage from '$lib/components/Docs/DocPage.svelte';
	import { posts } from '$lib/data/posts';

	const post = posts.find((p) => p.slug === 'introducing-nkido')!;
	const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
</script>

<DocPage
	title={post.title}
	description={post.excerpt}
	backHref="/blog"
	backLabel="All posts"
>
	<p class="byline">
		<time datetime={post.date}>{formattedDate}</time> · by {post.author}
	</p>

	<p>
		NKIDO is a new open-source audio synthesis platform: a pattern-language front-end
		named <strong>Akkado</strong>, a graph-based DSP engine named <strong>Cedar</strong>,
		and a web IDE that lets you live-code both. It runs in the browser, on desktop,
		inside Godot games, and on the ESP32-A1S Audio Kit.
	</p>

	<h2>Why another audio system?</h2>
	<p>
		There are great live-coding environments (Strudel, TidalCycles, SuperCollider) and
		great DSP graphs (Pure Data, Csound). NKIDO's bet is that these two worlds belong
		together in one runtime — and that the runtime should be small enough to embed
		<em>anywhere</em>, not just on a laptop.
	</p>

	<h2>What's in v1</h2>
	<ul>
		<li>
			<strong>95+ DSP opcodes</strong>: oscillators, filters, delays, reverbs, granular,
			Karplus-Strong, vocoder, bitcrusher — the usual arsenal.
		</li>
		<li>
			<strong>Hot-swap with preserved state</strong>: edit while it plays, no clicks. See
			<a href="/docs/concepts/hot-swap">how it works</a>.
		</li>
		<li>
			<strong>Web IDE at <a href="https://live.nkido.cc">live.nkido.cc</a></strong>: full
			browser-native development with WASM + AudioWorklet.
		</li>
		<li>
			<strong>Godot 4.x addon</strong>: embed NKIDO in games.
			<a href="/godot">Install instructions</a>.
		</li>
		<li>
			<strong>ESP32 port</strong>: ~146 KB stripped binary, real-time audio on
			a $30 board. <a href="/esp32">Build & flash guide</a>.
		</li>
	</ul>

	<h2>Try it now</h2>
	<p>
		The fastest way to get a feel for NKIDO is the 5-minute
		<a href="/docs/tutorials/hello-sine">Hello Sine tutorial</a>. No install, just
		a browser.
	</p>

	<h2>What's next</h2>
	<p>
		v1 is a starting point. The roadmap includes a proper docs site, a published
		plugin format for Cedar, MIDI + OSC bridges, and a real-time collaboration mode
		for the web IDE. Issues and PRs welcome on
		<a href="https://github.com/mlaass/nkido">GitHub</a>.
	</p>

	<p>
		MIT licensed. If it's useful to you, consider
		<a href="https://github.com/sponsors/mlaass">sponsoring</a>.
	</p>
</DocPage>

<style>
	.byline {
		color: var(--text-secondary);
		font-size: 0.875rem;
		margin-bottom: var(--spacing-xl);
	}
</style>
