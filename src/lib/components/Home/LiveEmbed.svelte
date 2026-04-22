<script lang="ts">
	import { Play, ExternalLink } from 'lucide-svelte';

	interface Props {
		patch?: string;
		title?: string;
	}

	let { patch = 'hello-sine', title = 'Hello Sine' }: Props = $props();

	const embedOrigin = 'https://live.nkido.cc';
	const embedUrl = $derived(`${embedOrigin}/embed?patch=${encodeURIComponent(patch)}`);
	const fallbackUrl = $derived(`${embedOrigin}/?patch=${encodeURIComponent(patch)}`);

	let activated = $state(false);
	let loaded = $state(false);
	let failed = $state(false);
	let loadTimer: ReturnType<typeof setTimeout> | null = null;

	function activate() {
		activated = true;
		// If the iframe hasn't signalled load within 8s (Safari COOP/COEP edge case),
		// fall back to the "open in new tab" link. Per PRD §12 Edge Case 1.
		loadTimer = setTimeout(() => {
			if (!loaded) failed = true;
		}, 8000);
	}

	function onIframeLoad() {
		loaded = true;
		if (loadTimer) clearTimeout(loadTimer);
	}
</script>

<section class="embed">
	<div class="embed-inner">
		<div class="embed-header">
			<h2>Try it here.</h2>
			<p class="embed-subtitle">
				{title} — click to load, then edit while it plays.
			</p>
		</div>

		<div class="embed-frame">
			{#if !activated}
				<button class="poster" onclick={activate} aria-label="Load interactive demo">
					<div class="poster-code" aria-hidden="true">
						<pre><code><span class="c-k">osc</span>(<span class="c-s">'sin'</span>, <span class="c-n">440</span>) * <span class="c-n">0.3</span>
  |&gt; <span class="c-f">out</span>()</code></pre>
					</div>
					<div class="poster-cta">
						<div class="poster-play">
							<Play size={32} fill="currentColor" />
						</div>
						<div class="poster-label">
							<strong>Click to play</strong>
							<span class="poster-sub">Loads the NKIDO IDE (~4s, ~2 MB WASM)</span>
						</div>
					</div>
				</button>
			{:else if failed}
				<div class="fallback">
					<p>
						The embedded IDE didn't load in this browser.
						This sometimes happens in Safari due to cross-origin isolation.
					</p>
					<a href={fallbackUrl} target="_blank" rel="noopener" class="fallback-link">
						Open in a new tab
						<ExternalLink size={16} />
					</a>
				</div>
			{:else}
				<iframe
					src={embedUrl}
					title="NKIDO live IDE — {title}"
					allow="autoplay; microphone; clipboard-write; fullscreen"
					loading="lazy"
					onload={onIframeLoad}
				></iframe>
			{/if}
		</div>

		<div class="embed-footer">
			<a href="https://live.nkido.cc" target="_blank" rel="noopener">
				Open the full IDE <ExternalLink size={14} />
			</a>
		</div>
	</div>
</section>

<style>
	.embed {
		padding: var(--spacing-2xl) var(--content-padding) var(--spacing-3xl);
		background: var(--bg-primary);
	}

	.embed-inner {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.embed-header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
	}

	.embed-header h2 {
		font-size: 1.75rem;
		margin-bottom: var(--spacing-sm);
	}

	.embed-subtitle {
		color: var(--text-secondary);
		margin: 0;
	}

	.embed-frame {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 10;
		max-height: 640px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: 12px;
		overflow: hidden;
	}

	.embed-frame iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	.poster {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xl);
		background: var(--bg-secondary);
		color: var(--text-primary);
		padding: var(--spacing-2xl);
		cursor: pointer;
		border: 0;
		transition: background var(--transition-fast);
	}

	.poster:hover {
		background: var(--bg-tertiary);
	}

	.poster-code {
		font-family: var(--font-mono);
		font-size: 1.125rem;
		padding: var(--spacing-lg) var(--spacing-xl);
		background: var(--bg-primary);
		border: 1px solid var(--border-muted);
		border-radius: 8px;
		text-align: left;
	}

	.poster-code pre {
		margin: 0;
	}

	.c-k { color: var(--syntax-function); }
	.c-s { color: var(--syntax-string); }
	.c-n { color: var(--syntax-number); }
	.c-f { color: var(--syntax-function); }

	.poster-cta {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.poster-play {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--accent-primary);
		color: var(--bg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.poster-label {
		display: flex;
		flex-direction: column;
		text-align: left;
	}

	.poster-label strong {
		font-size: 1.125rem;
	}

	.poster-sub {
		color: var(--text-secondary);
		font-size: 0.875rem;
	}

	.fallback {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		padding: var(--spacing-2xl);
		text-align: center;
	}

	.fallback p {
		max-width: 420px;
		color: var(--text-secondary);
		margin: 0;
	}

	.fallback-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--accent-primary);
		color: var(--bg-primary);
		border-radius: 8px;
		font-weight: 600;
	}

	.fallback-link:hover {
		text-decoration: none;
		background: #4f9ae8;
	}

	.embed-footer {
		text-align: center;
		margin-top: var(--spacing-md);
		font-size: 0.875rem;
	}

	.embed-footer a {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--text-secondary);
	}

	@media (max-width: 640px) {
		.embed-frame {
			aspect-ratio: 4 / 5;
		}

		.poster-code {
			font-size: 0.875rem;
			padding: var(--spacing-md);
		}

		.poster-cta {
			flex-direction: column;
			text-align: center;
		}

		.poster-label {
			text-align: center;
		}
	}
</style>
