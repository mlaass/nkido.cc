<script lang="ts">
	import Hero from '$lib/components/Home/Hero.svelte';
	import LiveEmbed from '$lib/components/Home/LiveEmbed.svelte';
	import FeatureGrid from '$lib/components/Home/FeatureGrid.svelte';
	import RunsEverywhere from '$lib/components/Home/RunsEverywhere.svelte';
</script>

<svelte:head>
	<title>NKIDO — High-performance live-coded audio synthesis</title>
	<meta name="description" content="A DAG-based DSP engine + pattern DSL that runs in the browser, on desktop, in Godot, and on ESP32." />
	<meta property="og:title" content="NKIDO — High-performance live-coded audio synthesis" />
	<meta property="og:description" content="A DAG-based DSP engine + pattern DSL that runs in the browser, on desktop, in Godot, and on ESP32." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nkido.cc/" />
	<meta property="og:image" content="https://nkido.cc/og-image.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Hero />
<LiveEmbed patch="hello-sine" title="Hello Sine" />
<FeatureGrid />
<RunsEverywhere />
