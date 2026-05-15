---
layout: "doc"
title: "Migrating from Tidal, Strudel, or SuperCollider"
description: "Pattern-language and synthesis analogues for users coming from other live-coding ecosystems."
category: "tutorials"
slug: "migrating"
order: 7
keywords: ["tidal", "strudel", "supercollider", "migration", "pattern", "live coding", "synthdef", "pbind", "cycles", "haskell"]
backHref: "/docs/tutorials"
backLabel: "Tutorials"
referenceKeyword: "mini-notation"
---

If you've live-coded music in Tidal, Strudel, or SuperCollider, you already know the idea: text on a screen, sound out the speakers, edit-recompile-listen as the loop. NKIDO is in the same family but makes different trade-offs. This page maps your existing intuitions onto NKIDO's vocabulary so you can skip the obvious early friction.

The three ecosystems each pull in a different direction. Tidal treats music as a pure-functional pattern algebra and outsources synthesis to SuperDirt. Strudel ports that algebra to JavaScript and ships its own browser-native sampler. SuperCollider is a synthesis server with a scheduler glued on top. NKIDO sits closer to SuperCollider in spirit — it does its own DSP — but it borrows the mini-notation pattern syntax from the Tidal family and the hot-swap-the-graph idea from neither.

## Quick comparison

| | Tidal | Strudel | SuperCollider | NKIDO |
|---|---|---|---|---|
| **Pattern syntax** | Mini-notation in Haskell DSL | Mini-notation in JS | `Pbind` / `Pseq` / event streams | Mini-notation embedded in Akkado |
| **Signal flow** | Implicit; SuperDirt does it | Implicit; web-audio chain | UGen graph, server-side | Explicit DAG via `\|>` |
| **Synthesis** | None — triggers SuperDirt | Built-in samples + simple synths | Full UGen library | Full built-in DSP, no externals |
| **Sample handling** | `s "bd"` | `.s("bd")` | `Buffer.read` + `PlayBuf` | `pat("bd")` (built-in kit) |
| **Live workflow** | GHCI re-evals | JS hot-reload | OSC messages or sclang | Hot-swap with state preservation |
| **FX routing** | `# room 0.5` | `.room(0.5)` | Bus + Ndef | `\|> reverb(%, 0.4)` |
| **State across edits** | None — restarts | None — restarts | Manual via `Ndef` | Built-in (semantic IDs) |

## Coming from Tidal

The mini-notation translates almost directly. `"bd sn cp"` is the same string in both languages.

```hs
-- Tidal
d1 $ s "bd ~ sn ~"
```

```akk
-- NKIDO
pat("bd ~ sn ~") |> out(%, %)
```

The shape that's different is what comes *after* the pattern. Tidal hands the pattern off to SuperDirt as named samples and effects via `#`. NKIDO routes the pattern signal through a DAG you can read in a single direction: `n"…" |> saw(@.freq) * ar(@.gate) |> lp(@, …) |> reverb(@, …) |> out(@)`. There is no implicit "everything goes to a SuperDirt orbit" step.

For pitch patterns, Tidal's `n "0 3 7"` becomes NKIDO's `n"c4 eb4 g4"` — the names are explicit instead of intervals over a scale, but the cycle-fills-evenly semantics are the same.

What doesn't translate: Tidal's pattern-combinator vocabulary (`every`, `jux`, `slow`, `fast`, `chunk`, `swingBy`) is a deep library that NKIDO does not match feature-for-feature. The mini-notation modifiers — `*`, `/`, `<>`, `[]`, `?`, `!`, `@` — do carry over. Higher-order pattern transformations (e.g. `every 3 (rev)`) are not currently in the language; you express the variation by changing the pattern string itself or by hot-swapping.

## Coming from Strudel

Strudel is the closest ecosystem syntactically — it lives in the browser and shares the mini-notation roots. The biggest difference is that Strudel triggers samples by default, while NKIDO is centred on synthesis.

```js
// Strudel
"bd sd".s().cpm(120/4).out()
```

```akk
// NKIDO
bpm = 120
pat("bd sd") |> out(%, %)
```

When you write `note("c4 e4 g4")` in Strudel, you usually pair it with `.s("piano")` to pick a sample bank. In NKIDO you lead with a typed pattern literal and pipe it into a waveform builtin: `n"c4 e4 g4" |> saw(@.freq)`. The synthesis is yours to build; there is no default sound.

Strudel's chained `.lpf(...)`, `.room(...)`, `.gain(...)` calls each produce a new pattern wrapper. NKIDO uses `|>` for the same idea, but the pipe operates on signals rather than patterns and every RHS call needs the hole `@` (or `%`). `@.freq` and `@.gate` read per-event fields off the pattern record on the way in:

```akk
n"c4 e4 g4"
    |> saw(@.freq) * ar(@.gate, 0.01, 0.3)
    |> lp(@, 1200) * 0.4
    |> reverb(@, 0.3)
    |> out(@, @)
```

What doesn't translate: Strudel's pattern algebra (`stack`, `cat`, `arp`, `slice`) and its rich library of community samples and presets. The mini-notation parsing is shared; everything around it is rebuilt.

## Coming from SuperCollider

The paradigm shift is the largest here. SuperCollider has a server / client split: `scsynth` runs UGen graphs, `sclang` (or your editor of choice) sends OSC. NKIDO collapses that into one process — you write a graph, the engine runs it, edits hot-swap.

A `SynthDef` in SuperCollider is a named template you instantiate with `Synth(\name, [\freq, 440])`. In NKIDO the patch *is* the running graph; there's no instantiate-from-template step. The closest analogue is binding a sub-graph to a variable:

```supercollider
// SuperCollider
SynthDef(\pluck, { |freq=440|
    var sig = Saw.ar(freq) * EnvGen.kr(Env.perc(0.001, 0.3));
    Out.ar(0, sig.dup * 0.3);
}).add;
```

```akk
-- NKIDO
pluck = osc("saw", 440) * ar(trigger(2), 0.001, 0.3) * 0.3
pluck |> out(%, %)
```

`Pbind` becomes mini-notation. Where you'd write `Pbind(\degree, Pseq([0, 2, 4, 7]))`, you write `n"c4 d4 e4 g4"`.

Buses and `Ndef`s — SuperCollider's mechanism for keeping signals alive while you re-define them — are partially obviated by hot-swap. When you edit a NKIDO patch and re-run, the engine diffs node identity and keeps state for unchanged nodes, so you don't have to set up a bus topology to get continuity.

What doesn't translate: SuperCollider's server programmability is its own world. Custom UGens, plugin distributions, the entire Quark ecosystem, the deep scheduling primitives (`TempoClock`, `PatternProxy`), and `sclang` as a language are out of scope here. NKIDO is intentionally smaller in surface area.

## What's missing if you migrate

Each ecosystem has features NKIDO does not currently match.

- **From Tidal:** the higher-order pattern combinators (`every`, `jux`, `chunk`, `swingBy`), the SuperDirt sample library at scale, and the GHCI workflow if you happen to like Haskell as your shell.
- **From Strudel:** the community-share workflow on `strudel.cc`, the rich preset library, and the pattern algebra beyond what mini-notation alone gives you.
- **From SuperCollider:** custom UGens, the third-party plugin ecosystem, GUI primitives, `sclang` itself, and the bus / `Ndef` flexibility for free-form signal routing across many sources.

If your work depends on any of those, NKIDO will feel narrow. The trade NKIDO makes is built-in DSP plus hot-swap of a single readable graph, in exchange for a smaller library and no server / client split. Whether that trade pays off depends on what you're trying to make.

## Next steps

- [Mini-notation](/docs/concepts/mini-notation) — the pattern syntax in detail.
- [Hot-swap explained](/docs/concepts/hot-swap) — what makes the live workflow different.
- [Cookbook](/docs/tutorials/cookbook) — short patches to paste into the IDE.
