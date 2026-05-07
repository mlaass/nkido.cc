<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	type Leaf = { title: string; url: string; slug: string };
	type Subgroup = { slug: string; label: string; entries: Leaf[] };
	type ReferenceTree = Record<'builtins' | 'language' | 'mini-notation', Subgroup[]>;
	type Tree = {
		concepts: Leaf[];
		tutorials: Leaf[];
		reference: ReferenceTree;
	};

	type Section = 'concepts' | 'tutorials' | 'reference';

	interface Props {
		section: Section;
		tree: Tree;
		referenceTopOrder: Array<keyof ReferenceTree>;
		referenceTopLabels: Record<keyof ReferenceTree, string>;
	}

	let { section, tree, referenceTopOrder, referenceTopLabels }: Props = $props();

	const STORAGE_KEY = 'nkido:docs-sidebar:state';
	let collapseState = $state<Record<string, 'open' | 'closed'>>({});

	onMount(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) collapseState = JSON.parse(raw);
		} catch {
			// ignore (private browsing, quota, parse error) — best effort
		}
	});

	function persist(next: Record<string, 'open' | 'closed'>) {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		} catch {
			// best effort
		}
	}

	function toggle(key: string, currentlyOpen: boolean) {
		const next = { ...collapseState, [key]: currentlyOpen ? 'closed' : 'open' } as Record<
			string,
			'open' | 'closed'
		>;
		collapseState = next;
		persist(next);
	}

	function isActive(url: string): boolean {
		return page.url.pathname.replace(/\/$/, '') === url.replace(/\/$/, '');
	}

	// For Reference: figure out which top-group + sub-group contains the active leaf.
	const activeRef = $derived.by(() => {
		if (section !== 'reference') return null;
		const path = page.url.pathname.replace(/\/$/, '');
		for (const top of referenceTopOrder) {
			for (const sub of tree.reference[top] ?? []) {
				for (const leaf of sub.entries) {
					if (leaf.url.replace(/\/$/, '') === path) {
						return { top, sub: sub.slug };
					}
				}
			}
		}
		return null;
	});

	function topOpen(top: keyof ReferenceTree): boolean {
		if (activeRef && activeRef.top === top) return true;
		return collapseState[`top:${top}`] === 'open';
	}

	function subOpen(top: keyof ReferenceTree, sub: string): boolean {
		if (activeRef && activeRef.top === top && activeRef.sub === sub) return true;
		return collapseState[`${top}:${sub}`] === 'open';
	}
</script>

{#if section === 'concepts' || section === 'tutorials'}
	<ul class="leaves">
		{#each tree[section] as leaf (leaf.slug)}
			<li>
				<a
					href={leaf.url}
					class="leaf"
					class:active={isActive(leaf.url)}
					aria-current={isActive(leaf.url) ? 'page' : undefined}
				>
					{leaf.title}
				</a>
			</li>
		{/each}
	</ul>
{:else if section === 'reference'}
	<ul class="reference">
		{#each referenceTopOrder as top (top)}
			{@const subgroups = tree.reference[top] ?? []}
			{@const topIsOpen = topOpen(top)}
			<li class="top-group">
				<button
					type="button"
					class="top-toggle"
					aria-expanded={topIsOpen}
					onclick={() => toggle(`top:${top}`, topIsOpen)}
				>
					<span class="caret" aria-hidden="true">{topIsOpen ? '▼' : '▶'}</span>
					{referenceTopLabels[top]}
				</button>
				{#if topIsOpen}
					<ul class="subgroups">
						{#each subgroups as sub (sub.slug)}
							{@const sIsOpen = subOpen(top, sub.slug)}
							<li class="subgroup">
								<button
									type="button"
									class="sub-toggle"
									aria-expanded={sIsOpen}
									onclick={() => toggle(`${top}:${sub.slug}`, sIsOpen)}
								>
									<span class="caret" aria-hidden="true">{sIsOpen ? '▼' : '▶'}</span>
									{sub.label}
								</button>
								{#if sIsOpen}
									<ul class="leaves nested">
										{#each sub.entries as leaf (leaf.slug)}
											<li>
												<a
													href={leaf.url}
													class="leaf"
													class:active={isActive(leaf.url)}
													aria-current={isActive(leaf.url) ? 'page' : undefined}
												>
													{leaf.title}
												</a>
											</li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.leaves {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.leaves.nested {
		padding-left: var(--spacing-md);
		border-left: 1px solid var(--border-muted);
		margin-left: var(--spacing-sm);
	}

	.leaf {
		display: block;
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.875rem;
		color: var(--text-secondary);
		text-decoration: none;
		border-radius: 4px;
		border-left: 2px solid transparent;
	}

	.leaf:hover {
		color: var(--text-primary);
		background: var(--bg-tertiary);
		text-decoration: none;
	}

	.leaf.active {
		color: var(--text-primary);
		background: var(--bg-tertiary);
		border-left-color: var(--accent-primary);
	}

	.reference {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.top-group {
		display: flex;
		flex-direction: column;
	}

	.top-toggle,
	.sub-toggle {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: none;
		border: 0;
		text-align: left;
		cursor: pointer;
		color: var(--text-primary);
		font-family: inherit;
		font-size: 0.875rem;
		border-radius: 4px;
		width: 100%;
	}

	.top-toggle {
		font-weight: 600;
	}

	.sub-toggle {
		font-weight: 500;
		color: var(--text-secondary);
	}

	.top-toggle:hover,
	.sub-toggle:hover {
		background: var(--bg-tertiary);
		color: var(--text-primary);
	}

	.caret {
		display: inline-block;
		width: 0.75em;
		font-size: 0.625rem;
		color: var(--text-muted);
	}

	.subgroups {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding-left: var(--spacing-sm);
	}

	.subgroup {
		display: flex;
		flex-direction: column;
	}
</style>
