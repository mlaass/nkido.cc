<script lang="ts">
	import sidebar from '$lib/data/docs-sidebar.json';
	import SearchBox from './SearchBox.svelte';
	import SidebarTree from './SidebarTree.svelte';

	type Section = 'concepts' | 'tutorials' | 'reference';
	let { section }: { section: Section } = $props();

	const sectionMeta = {
		concepts: { label: 'Concepts', href: '/docs/concepts' },
		tutorials: { label: 'Tutorials', href: '/docs/tutorials' },
		reference: { label: 'Reference', href: '/docs/reference' }
	} as const;

	const data = sidebar as typeof sidebar;
</script>

<nav class="sidebar" aria-label="Documentation navigation">
	<div class="sidebar-search">
		<SearchBox />
	</div>
	<a class="section-title" href={sectionMeta[section].href}>
		{sectionMeta[section].label}
	</a>
	<SidebarTree
		{section}
		tree={data.tree as any}
		referenceTopOrder={data.referenceTopOrder as any}
		referenceTopLabels={data.referenceTopLabels as any}
	/>
</nav>

<style>
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding: var(--spacing-md) 0;
	}

	.sidebar-search :global(.trigger) {
		width: 100%;
		justify-content: flex-start;
	}

	.section-title {
		font-weight: 600;
		color: var(--text-primary);
		text-decoration: none;
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 0.9375rem;
	}

	.section-title:hover {
		color: var(--accent-primary);
		text-decoration: none;
	}
</style>
