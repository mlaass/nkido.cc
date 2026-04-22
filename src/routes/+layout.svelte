<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Layout/Header.svelte';
	import Footer from '$lib/components/Layout/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

<div style="display: flex; flex-direction: column; min-height: 100vh;">
	<Header />
	<div style="flex: 1; display: flex; flex-direction: column;">
		{@render children()}
	</div>
	<Footer />
</div>