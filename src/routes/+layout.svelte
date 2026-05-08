<script lang="ts">
	import '../app.css';
	import { browser } from '$app/environment';
	import Header from '$lib/components/Layout/Header.svelte';
	import Footer from '$lib/components/Layout/Footer.svelte';
	import { theme } from '$lib/stores/theme.svelte';

	let { children } = $props();

	$effect(() => {
		if (browser) document.documentElement.setAttribute('data-theme', theme.resolved);
	});
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div style="display: flex; flex-direction: column; min-height: 100vh;">
	<div data-pagefind-ignore><Header /></div>
	<div style="flex: 1; display: flex; flex-direction: column;">
		{@render children()}
	</div>
	<div data-pagefind-ignore><Footer /></div>
</div>