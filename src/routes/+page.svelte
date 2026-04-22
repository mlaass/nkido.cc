<script lang="ts">
	import Hero from '$lib/components/Home/Hero.svelte';
	import FeatureGrid from '$lib/components/Home/FeatureGrid.svelte';
	import RunsEverywhere from '$lib/components/Home/RunsEverywhere.svelte';
</script>

<svelte:head>
	<title>NKIDO — High-performance live-coded audio synthesis</title>
	<meta name="description" content="A DAG-based DSP engine + pattern DSL that runs in the browser, on desktop, in Godot, and on ESP32." />
</svelte:head>

<Hero />
<FeatureGrid />
<RunsEverywhere />