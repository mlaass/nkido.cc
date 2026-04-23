---
layout: doc
title: Hot-swap explained
description: How NKIDO replaces a running patch with a new one — without glitches.
backHref: /docs/concepts
backLabel: Concepts
referenceKeyword: hot-swap
category: concept
order: 2
keywords: [hot-swap, live-coding, semantic-id, state, crossfade]
---

Hot-swap is what turns NKIDO from a synth engine into a live-coding instrument. You change the code, press a key, and the new patch takes over — keeping oscillator phase, filter state, and delay lines intact.

## The problem

A naïve "stop the old patch, start the new patch" approach sounds terrible:

- Oscillator phase resets → audible click.
- Delay lines and reverb tails drop to zero → tail cuts off mid-reverb.
- Envelopes restart → note retriggers unexpectedly.

A live-coding system needs to _diff_ the new patch against the old one, keep the nodes that still exist, and smoothly fade in anything new.

## Semantic IDs

Every node in a NKIDO patch gets a stable **semantic ID** derived from its position in the source plus its operator + constant args. If you change a filter's cutoff but leave everything else alone, the node's ID stays the same — NKIDO recognizes it and keeps its internal state.

<div class="ascii">
  Old patch                New patch             Action
  ─────────                ─────────             ──────
  osc(sin, 440)       →    osc(sin, 440)         keep state
     |> * 0.3         →       |> * 0.3           keep state
     |> filter(lp,    →       |> filter(lp,      keep state
             1200)                  800)         update cutoff
     |> out()         →       |> out()           keep state
</div>

## What gets preserved

When a node's ID matches between old and new:

- Oscillator phase.
- Filter delay registers (biquad state).
- Delay-line buffers and read/write positions.
- Envelope stage and level.
- Stateful RNG seeds for noise generators.

New nodes start fresh. Removed nodes are phased out with a short crossfade.

## When IDs change

Some edits necessarily break the identity of a node — adding a new filter in the middle of the chain, changing an oscillator's waveform, or renaming a variable. In those cases NKIDO falls back to a short crossfade (~10ms) to avoid clicks.

> This is why live-coding feels musical in NKIDO: you can sculpt a running sound by nudging parameters, and the changes land on the beat instead of restarting the whole patch.

## Next

- [Mini-notation →](/docs/concepts/mini-notation)
- [Tutorial: Hello Sine →](/docs/tutorials/hello-sine)
