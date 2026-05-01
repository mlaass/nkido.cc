<script lang="ts">
	import { Search, X } from 'lucide-svelte';
	import { onMount, tick } from 'svelte';

	type PagefindResultRaw = {
		id: string;
		data: () => Promise<{
			url: string;
			meta: { title?: string; description?: string };
			excerpt: string;
		}>;
	};

	type PagefindSearchResult = {
		url: string;
		title: string;
		description: string;
		excerpt: string;
	};

	let open = $state(false);
	let query = $state('');
	let results = $state<PagefindSearchResult[]>([]);
	let loading = $state(false);
	let pagefind: { search: (q: string) => Promise<{ results: PagefindResultRaw[] }> } | null = null;
	let input: HTMLInputElement | null = $state(null);

	async function loadPagefind() {
		if (pagefind) return pagefind;
		try {
			// Dynamic import. File is emitted by the postbuild step, so we build
			// the URL at runtime to keep TS + Vite from trying to resolve it.
			const url = '/pagefind/' + 'pagefind.js';
			const mod = (await import(/* @vite-ignore */ url)) as {
				init?: () => Promise<void>;
				search: (q: string) => Promise<{ results: PagefindResultRaw[] }>;
			};
			await mod.init?.();
			pagefind = mod;
			return mod;
		} catch (err) {
			console.warn('Pagefind not available (likely running dev server)', err);
			return null;
		}
	}

	async function runSearch() {
		if (!query.trim()) {
			results = [];
			return;
		}
		loading = true;
		const pf = await loadPagefind();
		if (!pf) {
			loading = false;
			return;
		}
		const raw = await pf.search(query);
		const top = raw.results.slice(0, 8);
		results = await Promise.all(
			top.map(async (r: PagefindResultRaw) => {
				const data = await r.data();
				return {
					url: data.url,
					title: data.meta.title ?? data.url,
					description: data.meta.description ?? '',
					excerpt: data.excerpt
				};
			})
		);
		loading = false;
	}

	async function openModal() {
		open = true;
		await tick();
		input?.focus();
	}

	function closeModal() {
		open = false;
		query = '';
		results = [];
	}

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			const inField = target && /^(INPUT|TEXTAREA)$/.test(target.tagName);
			if (e.key === '/' && !inField && !open) {
				e.preventDefault();
				openModal();
			} else if (e.key === 'Escape' && open) {
				e.preventDefault();
				closeModal();
			}
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	let searchTimer: ReturnType<typeof setTimeout> | null = null;
	function onInput() {
		if (searchTimer) clearTimeout(searchTimer);
		searchTimer = setTimeout(runSearch, 120);
	}
</script>

<button class="trigger" onclick={openModal} aria-label="Search docs">
	<Search size={16} />
	<span>Search</span>
	<kbd>/</kbd>
</button>

{#if open}
	<div
		class="backdrop"
		onclick={closeModal}
		role="presentation"
		data-pagefind-ignore
	>
		<div
			class="modal"
			role="dialog"
			aria-label="Search docs"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => e.key === 'Escape' && closeModal()}
			tabindex="-1"
		>
			<div class="bar">
				<Search size={18} />
				<input
					bind:this={input}
					bind:value={query}
					oninput={onInput}
					type="search"
					placeholder="Search concepts, tutorials, reference…"
					autocomplete="off"
					spellcheck="false"
				/>
				<button class="close" onclick={closeModal} aria-label="Close">
					<X size={16} />
				</button>
			</div>

			<div class="results">
				{#if loading}
					<p class="hint">Searching…</p>
				{:else if !query.trim()}
					<p class="hint">Type to search. Press <kbd>Esc</kbd> to close.</p>
				{:else if results.length === 0}
					<p class="hint">No results for "{query}".</p>
				{:else}
					<ul>
						{#each results as r}
							<li>
								<a href={r.url} onclick={closeModal}>
									<div class="r-title">{r.title}</div>
									{#if r.description}<div class="r-desc">{r.description}</div>{/if}
									<div class="r-excerpt">{@html r.excerpt}</div>
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.trigger {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--bg-tertiary);
		border: 1px solid var(--border-muted);
		border-radius: 6px;
		color: var(--text-secondary);
		font-size: 0.875rem;
		cursor: pointer;
		transition: border-color var(--transition-fast);
	}

	.trigger:hover {
		border-color: var(--border-default);
		color: var(--text-primary);
	}

	.trigger kbd {
		background: var(--bg-primary);
		padding: 1px 6px;
		border-radius: 3px;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(4px);
		z-index: 100;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 10vh var(--content-padding) 2rem;
	}

	.modal {
		width: 100%;
		max-width: 640px;
		background: var(--bg-secondary);
		border: 1px solid var(--border-default);
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.bar {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--border-muted);
		color: var(--text-secondary);
	}

	.bar input {
		flex: 1;
		background: transparent;
		border: 0;
		font: inherit;
		color: var(--text-primary);
		outline: none;
		padding: var(--spacing-xs) 0;
	}

	.close {
		background: transparent;
		border: 0;
		cursor: pointer;
		color: var(--text-muted);
		padding: 4px;
	}

	.close:hover {
		color: var(--text-primary);
	}

	.results {
		max-height: 50vh;
		overflow-y: auto;
	}

	.hint {
		padding: var(--spacing-lg) var(--spacing-md);
		color: var(--text-muted);
		font-size: 0.875rem;
		margin: 0;
	}

	.hint kbd {
		background: var(--bg-tertiary);
		padding: 1px 5px;
		border-radius: 3px;
		font-size: 0.75rem;
	}

	.results ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.results a {
		display: block;
		padding: var(--spacing-sm) var(--spacing-md);
		border-bottom: 1px solid var(--border-muted);
		text-decoration: none;
		color: var(--text-primary);
	}

	.results a:hover {
		background: var(--bg-tertiary);
		text-decoration: none;
	}

	.r-title {
		font-weight: 600;
		margin-bottom: 2px;
	}

	.r-desc {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		margin-bottom: 4px;
	}

	.r-excerpt {
		font-size: 0.8125rem;
		color: var(--text-muted);
		line-height: 1.4;
	}

	.r-excerpt :global(mark) {
		background: transparent;
		color: var(--accent-primary);
		font-weight: 600;
	}
</style>
