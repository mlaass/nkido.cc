---
layout: "doc"
title: "Cookbook"
description: "Short, runnable recipes — drums, bass, pads, leads, generative patterns."
category: "tutorials"
slug: "cookbook"
order: 6
keywords: ["cookbook", "recipes", "kick", "snare", "hihat", "bass", "sub", "acid", "pad", "lead", "pluck", "drone", "pattern", "euclidean", "drums"]
backHref: "/docs/tutorials"
backLabel: "Tutorials"
---

<div data-pagefind-weight="5">

A short, opinionated set of patches you can paste into the [live IDE](https://live.nkido.cc) and tweak. Each recipe is one self-contained graph plus a sentence on why it works. None of them are precious — copy, mutate, and steal whatever sounds useful.

## Four-on-the-floor kick

A 120 BPM kick on every beat using the sample pattern.

```akk
bpm = 120
pat("bd bd bd bd") |> out(%, %)
```

`pat("string")` plays sample slots from the built-in kit. Repeating `bd` four times across one cycle gives the canonical four-on-the-floor.

## Backbeat with hats

Kick on 1, snare on 3, closed hi-hat on every off-beat — the rock-and-roll backbeat.

```akk
bpm = 120
pat("bd hh sd hh") |> out(%, %)
```

The pattern divides one cycle into four slots evenly. Swap `hh` for `oh` to open the hat.

## Sub-bass

A pure sine wave an octave below middle C, gated with a short envelope.

```akk
osc("sin", 55) * ar(trigger(2), 0.005, 0.4) |> out(%, %)
```

A sine has no harmonics above the fundamental, so it sits cleanly under everything else in the mix. The short attack and 400 ms release give it a gated feel rather than a continuous hum.

## Acid bass

The Roland TB-303 sound: a saw through a resonant lowpass with a percussive filter envelope.

```akk
filter_env = ar(trigger(2), 0.01, 0.15)
amp_env = ar(trigger(2), 0.005, 0.3)

osc("saw", 55)
    |> moog(%, 200 + filter_env * 1500, 2)
    * amp_env
    |> saturate(%, 2)
    |> out(%, %)
```

The filter envelope sweeps the cutoff from 200 Hz up to 1700 Hz on each trigger. The `moog` filter's resonance (`2`) is what gives it the squelch. `saturate` adds the harmonic edge.

## Bright lead

A detuned saw + square through a fast filter envelope — a cutting monosynth lead.

```akk
(osc("saw", 440) + osc("sqr", 440) * 0.3)
    |> lp(%, 2000 + ar(trigger(4)) * 3000, 4)
    * ar(trigger(4), 0.01, 0.2)
    |> out(%, %)
```

Two oscillators at the same frequency layer cleanly. The square adds odd harmonics; the saw is the body. The filter envelope opens to 5 kHz on each trigger and snaps back, giving the sound its bite.

## Warm pad

A long, evolving saw pad through a low-pass filter and reverb.

```akk
osc("saw", 220) * adsr(trigger(0.5), 0.3, 0.6)
    |> lp(%, 1200)
    |> reverb(%, 0.4)
    |> out(%, %)
```

`adsr` with a slow attack (0.3 s) and a long sustain shape turns a sawtooth from buzzy into vocal. The lowpass tames the high harmonics; the reverb supplies space.

## Pluck bass

A short-decay envelope on a filtered saw — the percussive bass that fits under fast patterns.

```akk
osc("saw", 110)
    |> moog(%, 600, 2)
    * ar(trigger(4), 0.001, 0.08)
    |> out(%, %)
```

A near-zero attack and 80 ms release shape the sound into a transient. The moog filter at 600 Hz keeps it dark enough to sit under a lead.

## Melody from mini-notation

A four-note arpeggio routed through a saw oscillator and a fixed-cutoff lowpass.

```akk
n"c4 e4 g4 b4"
    |> saw(@.freq) * ar(@.gate, 0.01, 0.15)
    |> lp(@, 1200)
    |> out(@, @)
```

Lead with the pattern literal and pipe it into a waveform builtin: `@.freq` gives the per-event frequency, `@.gate` gives the per-event trigger. The envelope fires on every note (and stays silent on `~` rests) — no separate `trigger(n)` clock to drift out of sync with the pattern. Hot-swap keeps the oscillator's phase across pitch changes.

## Probabilistic hat pattern

A hat that drops out half the time on the off-beat — the simplest way to keep a loop from feeling mechanical.

```akk
bpm = 120
pat("bd hh? sd hh?") |> out(%, %)
```

The `?` suffix in mini-notation plays a slot with 50% probability per cycle. Run it for a minute and the variation becomes audible without sounding random.

## Drone

A sustained oscillator with a slow LFO modulating the cutoff — useful as a bed under everything else.

```akk
osc("saw", 55)
    |> moog(%, 400 + lfo("saw", 0.1) * 300, 1.5)
    |> reverb(%, 0.5)
    |> out(%, %)
```

A 0.1 Hz LFO completes one cycle every 10 seconds, slowly walking the filter cutoff up and down. With a generous reverb, the drone occupies the low-mid space without a clear attack point, leaving room for whatever sits on top.

## Next steps

- [Hello Sine](/docs/tutorials/hello-sine) — work through the basic patch.
- [Building Synth Voices](/docs/tutorials/synthesis) — the patterns these recipes are built on.
- [Reference: built-ins](/docs/reference/builtins) — every operator the cookbook uses.

</div>
