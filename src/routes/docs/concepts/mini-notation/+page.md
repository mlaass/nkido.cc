---
layout: doc
title: Mini-notation
description: Strudel/Tidal-style pattern syntax for rapid musical exploration.
backHref: /docs/concepts
backLabel: Concepts
referenceKeyword: mini-notation
category: "concepts"
order: 3
keywords: [mini-notation, pattern, tidal, strudel, note, sequence]
---

Mini-notation is a terse, string-based DSL for describing rhythmic patterns. It comes from the TidalCycles family and is embedded inside Akkado alongside the regular DSP-graph syntax.

## The basics

A pattern is a typed string literal whose content is a space-separated list of events that evenly fill one cycle (by default, one bar). The prefix tells the compiler what kind of pattern you mean — `n` for notes, `s` for samples, `c` for chords, `v` for raw values.

```akk
n"c4 e4 g4 b4"       // four notes, one per beat
n"c4 [e4 g4] b4"     // subdivide: e4+g4 share beat 2
n"c4 ~ e4 ~"         // ~ is a rest
n"c4*4"              // repeat c4 four times in the slot
n"<c4 e4 g4>"        // one note per cycle, rotating
```

## Combining with signals

Pattern literals coerce to a frequency signal at any signal slot, so you pass them straight into an oscillator's pitch argument.

```akk
n"c4 e4 g4 b4"
  |> saw(@.freq)
  |> lp(@, 1200)
  |> out(@)
```

Lead with the pattern literal, then pipe it into a waveform builtin (`saw`, `sqr`, `tri`, …). `@` is the placeholder — same role as `%` — and `@.freq` reads the per-event frequency from the pattern record. When the pattern advances, the oscillator's frequency updates on the beat. Because of hot-swap, the phase keeps going across pitch changes.

For envelope-triggered notes, reach for `@.gate` so the envelope fires on each pattern event (and stays silent on `~` rests) rather than running an independent clock that can drift:

```akk
n"c4 e4 ~ g4"
  |> saw(@.freq) * ar(@.gate, 0.01, 0.2)
  |> out(@)
```

## Inline modifiers

Mini-notation supports a handful of inline modifiers on each event:

- `x!3` — repeat `x` three times in the same slot.
- `x@3` — weight: `x` takes 3× the slot length of unweighted events.
- `x?` — play `x` with 50% probability (`x?0.3` for 30%).
- `[a b]` — sub-sequence: `a` then `b` inside the slot.
- `<a b c>` — alternate: one element per cycle, cycling through.
- `a,b` — stack: play `a` and `b` simultaneously in the same slot.

## Example: a riff with a filter sweep

```akk
n"<c4 eb4> g4 [bb4 c5] a4"
  |> sqr(@.freq) * ar(@.gate, 0.01, 0.25)
  |> lp(@, 400 + ar(@.gate, 0.01, 0.25) * 3000)
  |> @ * 0.25
  |> reverb(@, 0.3)
  |> out(@)
```

`@.gate` triggers the envelope on every pattern event — including the `<c4 eb4>` alternation and the `[bb4 c5]` sub-sequence — so the amp and filter envelopes follow the actual note rate, not a fixed clock.

> Every slot in the pattern is itself a signal, so you can modulate per-slot parameters (velocity, filter, pan) by writing a parallel pattern and multiplying.

## Next

- [Signals and DAGs](/docs/concepts/signals)
- [Tutorial: Hello Sine](/docs/tutorials/hello-sine)
