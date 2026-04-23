---
layout: doc
title: Signals & DAGs
description: How audio flows through NKIDO's directed acyclic graph.
backHref: /docs/concepts
backLabel: Concepts
referenceKeyword: signal
category: concept
order: 1
keywords: [signal, DAG, dsp, graph, pipe]
---

A **signal** in NKIDO is any value that changes over time — typically audio, but also control values like envelopes or LFOs. Every patch is just a graph of signals flowing through operators.

## Everything is a graph

When you write a patch, you're describing a **DAG** (directed acyclic graph) of DSP nodes. Each node takes signals as input and produces a signal as output. The pipe operator `|>` connects them.

```akk
osc('sin', 440) * 0.3
  |> filter('lp', 1200)
  |> reverb(0.4)
  |> out()
```

<div class="ascii">
 osc(sin, 440)
       │
       ▼
    * 0.3
       │
       ▼
 filter(lp, 1200)
       │
       ▼
 reverb(0.4)
       │
       ▼
     out()
</div>

NKIDO compiles this graph to bytecode that runs in a stack-based VM, one audio block at a time. No per-sample allocations, no runtime garbage collection.

## Signal rates

Signals run at one of two rates:

- **Audio-rate** — one value per sample (48 kHz typical). Oscillators, filters, delays, mixers all produce audio-rate signals.
- **Control-rate** — one value per audio block (~128 samples). Cheaper; used for parameter modulation like LFOs and envelopes.

You rarely need to think about rates directly — operators coerce as needed — but control-rate modulation is how you get CPU-efficient sweeps and LFOs.

## Why a DAG?

A DAG has no cycles, which means every signal can be computed in topological order with a single pass through the graph. That's what makes NKIDO fast enough to run on a microcontroller and still predictable enough to hot-swap safely.

> Feedback loops (delays, reverb tails) are modeled as _explicit_ delay-line nodes, not as cycles in the graph. This keeps the DAG acyclic while still letting you build feedback-heavy patches.

## Next

- [Hot-swap explained →](/docs/concepts/hot-swap)
- [Tutorial: Hello Sine →](/docs/tutorials/hello-sine)
