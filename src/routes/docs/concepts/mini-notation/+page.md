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
osc("saw", n"c4 e4 g4 b4")
  |> lp(%, 1200)
  |> out(%)
```

When the pattern advances, the oscillator's frequency updates on the beat. Because of hot-swap, the phase keeps going across pitch changes.

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
gate = trigger(4)              // one gate per beat
src  = osc("square", n"<c4 eb4> g4 [bb4 c5] a4")
       |> lp(%, 2000 + ar(gate, 0.05, 0.4) * 3000)
       |> % * 0.25

src |> reverb(%, 0.3) |> out(%)
```

The cutoff is the constant 2000 plus an attack-release envelope scaled by 3000, so each beat opens the filter up by ~3 kHz then closes again.

> Every slot in the pattern is itself a signal, so you can modulate per-slot parameters (velocity, filter, pan) by writing a parallel pattern and multiplying.

## Next

- [Signals and DAGs](/docs/concepts/signals)
- [Tutorial: Hello Sine](/docs/tutorials/hello-sine)
