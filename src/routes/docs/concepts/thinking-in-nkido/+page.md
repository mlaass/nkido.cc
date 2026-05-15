---
layout: doc
title: Thinking in NKIDO
description: A unified mental model — signals, DAGs, hot-swap, and patterns.
backHref: /docs/concepts
backLabel: Concepts
referenceKeyword: signal
category: "concepts"
order: 4
keywords: [mental model, signals, DAG, hot-swap, mini-notation, overview, thinking]
---

NKIDO is small in surface area but unfamiliar in shape. If you arrive expecting a DAW, a Max/MSP-style box-and-line editor, or a sample triggerer, the controls won't be where you reach for them. This page sketches the four ideas the system is built on — signals, DAGs, hot-swap, and patterns — so you can read the rest of the docs with a working mental model.

## The four pillars

A **signal** is any value that varies over time. Audio is a signal; an envelope is a signal; a constant `440` is a (very boring) signal. Every operator in NKIDO consumes signals and produces a signal. There is no separate "control rate" or "audio rate" distinction — the type system is uniform. See [Signals and DAGs](/docs/concepts/signals).

A **DAG** is the shape your patch takes once you wire signals together with `|>`. The graph is acyclic by construction: outputs flow downstream, never back. This is what makes a NKIDO patch readable — you can run your finger left-to-right through the source and predict what each stage does without having to model feedback in your head.

**Hot-swap** is what turns the engine into an instrument. When you press the run key, NKIDO diffs the new graph against the running one, keeps the nodes whose semantic identity is unchanged, and crossfades only what was actually edited. Filter state, delay lines, and oscillator phase survive the swap. See [Hot-swap explained](/docs/concepts/hot-swap).

**Patterns** are how you describe rhythm and pitch without writing scheduling boilerplate. Mini-notation — the string DSL borrowed from TidalCycles — gives you `n"60 64 67 72"` as a one-cycle melody and `s"bd ~ sd ~"` as a kick-snare backbeat. The `n"…"` / `s"…"` prefixes tell the compiler which kind of pattern you mean. Patterns are signals too, so they compose with the rest of the graph. See [Mini-notation](/docs/concepts/mini-notation).

## How they compose

Take a small patch:

```akk
osc("sin", n"60 64 67 72")
  |> moog(@, lfo("saw", 1) * 1500 + 200)
  |> reverb(@, 0.3)
  |> out(@)
```

Read it left to right. `osc("sin", n"60 64 67 72")` is an oscillator whose pitch is itself a **pattern** — four MIDI notes spread evenly over one cycle (the `n"…"` prefix is the note-pattern literal). The output is a **signal** at audio rate.

The pipe `|>` hands that signal into `moog(@, …)` — a 4-pole filter whose cutoff is the second argument. The cutoff is built from a saw **LFO** scaled to oscillate between 200 and 1700 Hz — just signal arithmetic; nothing in mini-notation or in the filter knows about anything else.

`reverb(@, 0.3) |> out(@)` finishes the chain. You're looking at a **DAG**: oscillator → filter → reverb → output. No cycles, no hidden state, no scheduler in the loop.

Now edit the cutoff offset from `200` to `400` and re-run. **Hot-swap** keeps the oscillator's phase, the moog's filter delays, and the reverb tail intact. Only the constant changes; you hear the cutoff floor lift without any click or restart.

## Why this combination

These four ideas pull against the usual live-coding trade-offs in a useful way.

Signals are a universal interface — if everything is a time-varying value, a sine wave can drive a filter cutoff just as easily as a knob can, and you don't need a separate "modulation matrix" concept. DAGs make the order of operations obvious: the source is the patch. Hot-swap removes the cost of iteration: you don't have to commit to a structure before you can hear it. And mini-notation lets you write rhythmic and melodic ideas without the ceremony of declaring tracks, clips, and events.

Most of the system's design decisions fall out of these four. There's no global transport because patterns carry their own timing. There's no "instrument vs effect" distinction because everything is a signal-in/signal-out node. There's no save-format-vs-runtime split because the source *is* the patch.

## What's not here

- **Not a DAW.** No timeline, no clips, no automation lanes. If you need to arrange a 4-minute song with mix automation, NKIDO is not the right tool.
- **Not Max/MSP / PureData.** No visual patch graph. The graph is the source code; you read it as text.
- **Not a sample triggerer.** Samples exist (see [`samplers`](/docs/reference/builtins/samplers)), but the design centre is synthesis. If your workflow is "drop one-shots on a grid," other tools fit better.

Setting these expectations up front saves you the friction of looking for features that aren't there by design.

## Next steps

- [Hello Sine](/docs/tutorials/hello-sine) — the smallest possible patch.
- [Live IDE](https://live.nkido.cc) — try it now in the browser.
