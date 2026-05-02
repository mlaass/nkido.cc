<script lang="ts">
	import Hero from '$lib/components/Home/Hero.svelte';
	import ExampleSelector from '$lib/components/Home/ExampleSelector.svelte';
	import FeatureGrid from '$lib/components/Home/FeatureGrid.svelte';
	import RunsEverywhere from '$lib/components/Home/RunsEverywhere.svelte';
	import OverviewGrid from '$lib/components/Home/OverviewGrid.svelte';
</script>

<svelte:head>
	<title>NKIDO: high-performance live-coded audio synthesis</title>
	<meta name="description" content="A DAG-based DSP engine + pattern DSL that runs in the browser, on desktop, in Godot, and on ESP32." />
	<meta property="og:title" content="NKIDO: high-performance live-coded audio synthesis" />
	<meta property="og:description" content="A DAG-based DSP engine + pattern DSL that runs in the browser, on desktop, in Godot, and on ESP32." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nkido.cc/" />
	<meta property="og:image" content="https://nkido.cc/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Hero />
<ExampleSelector />
<FeatureGrid />
<RunsEverywhere />
<OverviewGrid />
