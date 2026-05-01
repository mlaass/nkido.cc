<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Play, ExternalLink } from 'lucide-svelte';
	import {
		LANDING_EXAMPLES,
		DEFAULT_SLUG,
		findExample
	} from '$lib/data/landing-examples';
	import ExampleTabs from './ExampleTabs.svelte';

	const EMBED_ORIGIN =
		import.meta.env.VITE_EMBED_ORIGIN ??
		(import.meta.env.DEV ? 'http://localhost:8888' : 'https://live.nkido.cc');
	const URL_PARAM = 'demo';
	const LOAD_TIMEOUT_MS = 8000;

	let activeSlug = $state(DEFAULT_SLUG);
	let activated = $state(false);
	let iframeLoaded = $state(false);
	let failed = $state(false);
	let loadTimer: ReturnType<typeof setTimeout> | null = null;
	let iframeEl = $state<HTMLIFrameElement | null>(null);

	const activeExample = $derived(findExample(activeSlug) ?? LANDING_EXAMPLES[0]);
	const embedUrl = $derived(
		`${EMBED_ORIGIN}/embed?patch=${encodeURIComponent(activeSlug)}&autoplay=1`
	);
	const fallbackUrl = $derived(`${EMBED_ORIGIN}/?patch=${encodeURIComponent(activeSlug)}`);

	function readSlugFromUrl(): string {
		if (typeof window === 'undefined') return DEFAULT_SLUG;
		const params = new URLSearchParams(window.location.search);
		const raw = params.get(URL_PARAM);
		if (!raw) return DEFAULT_SLUG;
		return findExample(raw) ? raw : DEFAULT_SLUG;
	}

	function writeSlugToUrl(slug: string) {
		if (typeof window === 'undefined') return;
		const url = new URL(window.location.href);
		url.searchParams.set(URL_PARAM, slug);
		window.history.replaceState({}, '', url);
	}

	function postSwitch(slug: string) {
		iframeEl?.contentWindow?.postMessage(
			{ type: 'nkido:switch-patch', patch: slug },
			EMBED_ORIGIN
		);
	}

	function selectTab(slug: string) {
		if (slug === activeSlug) return;
		activeSlug = slug;
		writeSlugToUrl(slug);
		if (activated) postSwitch(slug);
	}

	function activate() {
		activated = true;
		failed = false;
		loadTimer = setTimeout(() => {
			if (!iframeLoaded) failed = true;
		}, LOAD_TIMEOUT_MS);
	}

	function onIframeLoad() {
		iframeLoaded = true;
		if (loadTimer) {
			clearTimeout(loadTimer);
			loadTimer = null;
		}
	}

	function handleMessage(event: MessageEvent) {
		if (event.origin !== EMBED_ORIGIN) return;
		if (event.data?.type !== 'nkido:embed-ready') return;
		// If the user picked a different tab while the iframe was loading,
		// sync the embed now that it's listening.
		const startedWith = new URL(embedUrl).searchParams.get('patch');
		if (startedWith !== activeSlug) postSwitch(activeSlug);
	}

	onMount(() => {
		activeSlug = readSlugFromUrl();
		window.addEventListener('message', handleMessage);
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('message', handleMessage);
		}
		if (loadTimer) clearTimeout(loadTimer);
	});
</script>

<section class="embed">
	<div class="embed-inner">
		<div class="embed-header">
			<h2>Try it here.</h2>
			<p class="embed-subtitle">
				Pick a demo, click to play, then edit the code while it sounds.
			</p>
		</div>

		<ExampleTabs
			examples={LANDING_EXAMPLES}
			active={activeSlug}
			onSelect={selectTab}
		/>

		<div class="embed-frame" id="example-frame">
			{#if !activated}
				<button class="poster" onclick={activate} aria-label="Load {activeExample.label} demo">
					<div class="poster-meta">
						<span class="poster-eyebrow">{activeExample.label}</span>
						<span class="poster-desc">{activeExample.description}</span>
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
					bind:this={iframeEl}
					src={embedUrl}
					title="NKIDO live IDE: {activeExample.label}"
					allow="autoplay; microphone; clipboard-write; fullscreen"
					loading="lazy"
					onload={onIframeLoad}
				></iframe>
			{/if}
		</div>

		<div class="embed-footer">
			<a href={EMBED_ORIGIN} target="_blank" rel="noopener">
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
		text-align: center;
	}

	.poster:hover {
		background: var(--bg-tertiary);
	}

	.poster-meta {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-sm);
		max-width: 520px;
	}

	.poster-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 1.5px;
		color: var(--accent-primary);
	}

	.poster-desc {
		font-size: 1.125rem;
		color: var(--text-primary);
		line-height: 1.5;
	}

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

		.poster-desc {
			font-size: 1rem;
		}

		.poster-cta {
			flex-direction: column;
		}

		.poster-label {
			text-align: center;
		}
	}
</style>
