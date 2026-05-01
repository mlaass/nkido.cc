---
layout: doc
title: Mini-notation
description: Strudel/Tidal-style pattern syntax for rapid musical exploration.
backHref: /docs/concepts
backLabel: Concepts
referenceKeyword: mini-notation
category: concept
order: 3
keywords: [mini-notation, pattern, tidal, strudel, note, sequence]
---

Mini-notation is a terse, string-based DSL for describing rhythmic patterns. It comes from the TidalCycles family and is embedded inside Akkado alongside the regular DSP-graph syntax.

## The basics

A pattern string is a space-separated list of events that evenly fill one cycle (by default, one bar).

```akk
"c4 e4 g4 b4"       // four notes, one per beat
"c4 [e4 g4] b4"     // subdivide: e4+g4 share beat 2
"c4 ~ e4 ~"         // ~ is a rest
"c4*4"              // repeat c4 four times in the slot
"<c4 e4 g4>"        // one note per cycle, rotating
```

## Combining with signals

Patterns in NKIDO are regular signals. You pipe them into oscillators just like you'd pipe a control signal.

```akk
note("c4 e4 g4 b4")
  |> osc('saw')
  |> filter('lp', 1200)
  |> out()
```

The `note()` builtin turns a pattern string into a frequency signal. When the pattern advances, the oscillator's frequency updates on the beat. Because of hot-swap, the phase keeps going across pitch changes.

## Effects within the pattern

Mini-notation supports a handful of inline effects:

- `x!3`: replicate `x` three times inline.
- `x@2`: `x` takes twice as long as the others.
- `x?`: play `x` with 50% probability.
- `[a,b]`: play `a` and `b` in parallel.

## Example: a two-bar riff

```akk
note("<c4 eb4> g4 [bb4 c5] a4")
  |> osc('square')
  |> filter('lp', 2000 + envelope(0.2, 0.4) * 3000)
  |> * 0.25
  |> reverb(0.3)
  |> out()
```

> Every slot in the pattern is itself a signal, so you can modulate per-slot parameters (velocity, filter, pan) by writing a parallel pattern and multiplying.

## Next

- [Signals and DAGs](/docs/concepts/signals)
- [Tutorial: Hello Sine](/docs/tutorials/hello-sine)
