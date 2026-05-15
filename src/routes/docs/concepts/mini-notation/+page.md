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

- `x*3` — speed: play `x` three times inside the slot (event duration shrinks to fit).
- `x/3` — slow: stretch `x` to take 3× its slot length.
- `x@3` — weight: `x` takes 3× the slot length of unweighted siblings.
- `x!3` — replicate: expand to three copies of `x` as separate slots in the parent sequence (`!` alone defaults to 2).
- `x?` — play `x` with 50% probability (`x?0.3` for 30%).
- `[a b]` — sub-sequence: `a` then `b` inside the slot.
- `<a b c>` — alternate: one element per cycle, cycling through.
- `[a, b]` — stack: `a` and `b` play simultaneously (comma only works inside `[…]` or `<…>`).

## Per-event params

Each pattern event is a record. You've already seen `@.freq` and `@.gate`; the same `@` also exposes `vel`, `note`, `dur`, `phase`, `sample_id`, and a handful of others — the full table lives in [Records → Pattern events](/docs/reference/language/records#pattern-events-are-records).

Two of those fields have inline-suffix shortcuts you can write directly inside the pattern string:

- `c4:0.8` — set velocity on a pitch or chord atom (`@.vel` becomes 0.8 for that event; range 0–1).
- `bd:2` — pick a sample variant (`@.sample_id` distinguishes `bd` from `bd:2`). Integer index after the colon, sample atoms only.

```akk
n"c4 e4:0.4 g4 b4:0.9"
  |> saw(@.freq) * ar(@.gate, 0.01, 0.2) * @.vel
  |> out(@)
```

When you want richer per-event modulation than velocity, multiply in a parallel pattern at the same length — every slot in a pattern is itself a signal:

```akk
n"c4 e4 g4 b4"
  |> saw(@.freq) * ar(@.gate, 0.01, 0.2)
  |> lp(@, v"400 1200 800 2400")
  |> out(@)
```

For per-event params that don't have an inline suffix (filter cutoff, send level, custom controls), use record-suffix syntax (`n"c4{cutoff:0.3}"`) or the `bend()` / `aftertouch()` / `dur()` transforms — both covered in [Pattern Modulation](/docs/tutorials/pattern-modulation).

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

## Next

- [Signals and DAGs](/docs/concepts/signals)
- [Tutorial: Hello Sine](/docs/tutorials/hello-sine)
