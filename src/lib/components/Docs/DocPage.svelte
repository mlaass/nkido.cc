<script lang="ts">
	import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-svelte';
	import { getContext, onMount } from 'svelte';
	import manifest from '$lib/data/docs-manifest.json';
	import { DOCS_SHELL_KEY } from './docs-shell-context';

	const inShell = getContext(DOCS_SHELL_KEY) !== undefined;

	let bodyEl: HTMLDivElement | undefined = $state();

	const COPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
	const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`;

	onMount(() => {
		if (!bodyEl) return;
		const blocks = bodyEl.querySelectorAll<HTMLPreElement>('pre.shiki');
		const timers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();

		blocks.forEach((pre) => {
			const lineCount = pre.querySelectorAll('.line').length;
			if (lineCount <= 2) return;

			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'code-copy-btn';
			btn.setAttribute('aria-label', 'Copy code');
			btn.title = 'Copy code';
			btn.innerHTML = COPY_SVG;

			btn.addEventListener('click', async () => {
				const code = pre.querySelector('code');
				if (!code) return;
				try {
					await navigator.clipboard.writeText(code.innerText);
					btn.innerHTML = CHECK_SVG;
					btn.classList.add('copied');
					btn.setAttribute('aria-label', 'Copied');
					btn.title = 'Copied';
					const prev = timers.get(btn);
					if (prev) clearTimeout(prev);
					timers.set(
						btn,
						setTimeout(() => {
							btn.innerHTML = COPY_SVG;
							btn.classList.remove('copied');
							btn.setAttribute('aria-label', 'Copy code');
							btn.title = 'Copy code';
						}, 1500)
					);
				} catch {
					/* clipboard refused — leave UI untouched */
				}
			});

			pre.appendChild(btn);
		});
	});

	interface Props {
		title: string;
		description?: string;
		backHref?: string;
		backLabel?: string;
		referenceKeyword?: string;
		children: import('svelte').Snippet;
	}

	let {
		title,
		description = '',
		backHref = '/docs',
		backLabel = 'All docs',
		referenceKeyword,
		children
	}: Props = $props();

	type ManifestEntry = { title: string; slug: string; url: string; keywords: string[] };
	type Manifest = { entries: Record<string, ManifestEntry[]> };

	const referenceMatch = $derived.by(() => {
		if (!referenceKeyword) return null;
		const keyword = referenceKeyword.toLowerCase();
		const all = Object.values((manifest as Manifest).entries).flat();
		const exact = all.find(
			(e) => e.slug === keyword || e.keywords?.some((k) => k.toLowerCase() === keyword)
		);
		if (exact) return exact;
		const partial = all.find(
			(e) => e.keywords?.some((k) => k.toLowerCase().includes(keyword))
		);
		return partial ?? null;
	});
</script>

<svelte:head>
	<title>{title} | NKIDO Docs</title>
	{#if description}
		<meta name="description" content={description} />
		<meta property="og:description" content={description} />
	{/if}
	<meta property="og:title" content="{title} | NKIDO" />
	<meta property="og:type" content="article" />
</svelte:head>

<article class="doc">
	<div class="doc-inner">
		{#if !inShell}
			<a href={backHref} class="back-link">
				<ArrowLeft size={14} />
				{backLabel}
			</a>
		{/if}

		<h1>{title}</h1>

		<div class="doc-body" bind:this={bodyEl}>
			{@render children()}
		</div>

		{#if referenceMatch}
			<footer class="doc-footer">
				<a href={referenceMatch.url}>
					<BookOpen size={16} />
					Reference: <code>{referenceMatch.title}</code>
					<ArrowRight size={14} />
				</a>
			</footer>
		{/if}
	</div>
</article>

<style>
	.doc {
		padding: var(--spacing-3xl) var(--content-padding);
	}

	.doc-inner {
		max-width: 760px;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.back-link:hover {
		color: var(--text-primary);
		text-decoration: none;
	}

	h1 {
		margin-bottom: var(--spacing-2xl);
	}

	.doc-body :global(h2) {
		margin-top: var(--spacing-2xl);
		margin-bottom: var(--spacing-sm);
		font-size: 1.5rem;
	}

	.doc-body :global(h3) {
		margin-top: var(--spacing-xl);
		margin-bottom: var(--spacing-sm);
		font-size: 1.125rem;
	}

	.doc-body :global(p) {
		color: var(--text-primary);
		line-height: 1.7;
	}

	.doc-body :global(ul),
	.doc-body :global(ol) {
		color: var(--text-primary);
		line-height: 1.7;
		padding-left: var(--spacing-lg);
	}

	.doc-body :global(li) {
		margin-bottom: var(--spacing-xs);
	}

	.doc-body :global(code) {
		background: var(--bg-tertiary);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.875em;
	}

	.doc-body :global(pre) {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		padding: var(--spacing-md);
		border-radius: 8px;
		overflow-x: auto;
		margin: var(--spacing-md) 0;
	}

	.doc-body :global(pre code) {
		background: transparent;
		padding: 0;
		font-size: 0.875rem;
	}

	.doc-body :global(pre.shiki) {
		position: relative;
	}

	.doc-body :global(pre.shiki .code-copy-btn) {
		position: absolute;
		top: var(--spacing-xs);
		right: var(--spacing-xs);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 6px;
		color: var(--text-secondary);
		cursor: pointer;
		opacity: 0;
		transition: opacity 120ms ease, color 120ms ease, border-color 120ms ease;
	}

	.doc-body :global(pre.shiki:hover .code-copy-btn),
	.doc-body :global(pre.shiki .code-copy-btn:focus-visible) {
		opacity: 1;
	}

	.doc-body :global(pre.shiki .code-copy-btn:hover) {
		color: var(--text-primary);
		border-color: var(--border-default);
	}

	.doc-body :global(pre.shiki .code-copy-btn.copied) {
		color: var(--accent-primary, var(--text-primary));
	}

	.doc-body :global(table) {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		margin: var(--spacing-md) 0;
		font-size: 0.9375rem;
		border: 1px solid var(--border-muted);
		border-radius: 8px;
		overflow: hidden;
	}

	.doc-body :global(thead) {
		background: var(--bg-tertiary);
	}

	.doc-body :global(th),
	.doc-body :global(td) {
		padding: var(--spacing-sm) var(--spacing-md);
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--border-default);
		border-right: 1px solid var(--border-muted);
	}

	.doc-body :global(th:last-child),
	.doc-body :global(td:last-child) {
		border-right: none;
	}

	.doc-body :global(tbody tr:last-child td) {
		border-bottom: none;
	}

	.doc-body :global(th) {
		color: var(--text-primary);
		font-weight: 600;
		font-size: 0.875rem;
		letter-spacing: 0.01em;
	}

	.doc-body :global(td) {
		color: var(--text-primary);
	}

	.doc-body :global(tbody tr:nth-child(even)) {
		background: var(--bg-secondary);
	}

	.doc-body :global(td code),
	.doc-body :global(th code) {
		font-size: 0.85em;
	}

	.doc-body :global(blockquote) {
		border-left: 3px solid var(--accent-primary);
		padding-left: var(--spacing-md);
		margin: var(--spacing-md) 0;
		color: var(--text-secondary);
		font-style: italic;
	}

	.doc-body :global(.ascii) {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		padding: var(--spacing-md);
		border-radius: 8px;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.4;
		white-space: pre;
		overflow-x: auto;
		margin: var(--spacing-md) 0;
	}

	.doc-footer {
		margin-top: var(--spacing-2xl);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--border-muted);
	}

	.doc-footer a {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--bg-secondary);
		border: 1px solid var(--border-muted);
		border-radius: 8px;
		font-size: 0.9375rem;
	}

	.doc-footer a:hover {
		border-color: var(--border-default);
		text-decoration: none;
	}

	.doc-footer code {
		background: var(--bg-tertiary);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 0.875em;
	}
</style>
