---
layout: blog
title: "Cedar on ESP32: what it took to put nkido on a $10 board"
description: "The ESP32 port, phase by phase: what fit, what didn't, and what it means for getting nkido into guitar pedals and modular racks."
date: 2026-04-21
author: mlaass
category: post
excerpt: "The ESP32 port, phase by phase: what fit, what didn't, and what it means for getting nkido into guitar pedals and modular racks."
draft: true
---

When I started the ESP32 port, the main question was simple: does nkido even fit? Cedar on desktop is generous with itself. It uses as much memory as it wants, pulls in audio decoders and soundfont support and a pile of analysis code, and never has to think about the sub-megabyte budgets of a small chip. The ESP32 is designed to check wifi packets, not run realtime DSP graphs. It has a small amount of fast memory, a slower pile of external memory, and a few megabytes of flash to hold the firmware.

So, could it fit? Yes, with some sanding. Here's what that sanding looked like.

## Phase 1: boot a sine wave

The first goal was the smallest useful thing. Boot the board, get the codec running, play a 440 Hz sine out the headphone jack. No live-coding, no buttons, no protocols. Just sound coming out.

Three things fought me.

The first was the codec driver. Espressif ships an audio framework with a driver for the ES8388 codec chip included, but it does a dozen things the port doesn't need (sample-rate negotiation, microphone routing, hardware volume ramps) and it pulls in a lot of code to do them. I wrote my own init inline instead, around 150 lines of register-level I2C setup. Smaller, simpler, and easy to understand at a glance when something goes wrong.

The second was a missing function in the C++ standard library. Cedar uses an aligned-allocation call that the version of libstdc++ shipping for the ESP32 doesn't provide. Cedar already has an escape hatch for that case, a build flag that routes through a POSIX function instead. I just had to find it. The finding took an afternoon of staring at a ten-thousand-line linker error.

The third was compiler warnings getting promoted to errors. A handful of cedar's debug printfs use integer format specifiers that don't quite match the ESP32's type widths, and the build's strict warning flag turned them into build failures. I relaxed that one warning for the cedar component and moved on. The proper fix is to gate those prints behind a debug flag upstream.

At the very end of Phase 1, one more thing: I had to bump the main task's stack size. Cedar's initialization path had grown since the framework defaults were set, and the symptom was the board silently rebooting during boot, no error message, no core dump, nothing. Two hours to figure out, one line to fix.

## Phase 2: live-push patches over the serial line

Reflashing the whole firmware takes about fifteen seconds. That's fine for firmware work, but it ruins the entire experience of nkido. The point of the language is that patches change while audio keeps playing. Phase 2 was about getting that back.

The answer was a small protocol over the board's USB serial connection. The design is boring on purpose: a magic header, a length, a type byte, a payload, a checksum. The host sends a compiled patch, the device acknowledges it, and cedar's existing hot-swap crossfade handles the transition at the next audio block. End-to-end latency from "push" to "sound is different" is under 50 milliseconds, and most of that is USB enumeration.

The payload format is a small container I called `.cbc`. It bundles patch bytecode with metadata about the patch's parameters: which knobs exist, their ranges, their defaults. That metadata matters because the device needs to wire parameters to physical controls without understanding the source language. More on that in Phase 3.

The whole spec and the command-line client live in [the repo docs](https://github.com/mlaass/cedar-esp32/blob/main/docs/uart-protocol.md). There's one awkwardness worth mentioning: the protocol shares the serial line with the debug monitor, so you can't watch logs and push at the same time. A future revision will split them onto separate channels.

## Phase 3: six buttons become the interface

With live-push working I could iterate patches fast. But the next question was harder. What does the device actually do, standalone, without a host computer attached? The A1S board has six tactile buttons on it. I wanted those to feel like part of the patch, not hardcoded to a fixed schema.

So the binding is automatic: whichever parameters the patch declares first, those bind to the first free buttons in order. A patch whose first declaration is a filter cutoff gets that cutoff on KEY1. A patch that instead declares an oscillator trigger gets a one-shot gate on KEY1. Push a different patch, the buttons re-bind to its parameters. The patch is the source of truth; the hardware just follows.

Press behavior depends on how the parameter was declared. A ranged parameter steps through its range on each press. A momentary button acts as a gate while held. A toggle flips between two states. Every press logs over the serial line so you can watch the value change from a host terminal.

The demo patch I keep coming back to is a five-note ocarina: five keys drive sine voices tuned to an A minor pentatonic, and the sixth layers a slightly wobbling reverb tail on top. Hold a key, get a note. Hold three, get a chord. Flip the sixth, get atmosphere. It's cheesy, and it's the thing I reach for to show people what a $10 board running cedar actually feels like.

## The memory story

This is the part that most determines whether the port is viable at all.

Cedar's VM wants about 1.15 megabytes of working state at runtime: oscillator phases, filter coefficients, envelope levels, reverb buffers, the whole zoo. That does not fit in the ESP32's fast internal memory, which tops out around 128 KB. It does fit in the chip's slower external PSRAM, so that's where the VM lives. Only a single pointer to it sits in fast memory. The audio code path still runs from fast memory, so the penalty for keeping the state chest in PSRAM is fine in practice.

Fitting the VM's own *code* in flash is the other half. I turned off a pile of features I don't currently need on the embedded side: sample decoders, soundfont support, spectral analysis, generic file I/O, a couple of variants of oscillator anti-aliasing, and the debug probe ring. Each costs flash space; none are load-bearing for the demos I want to run today. Most will come back in Phase 4 once decoders are wired up properly.

After all that, the firmware binary is about 306 KB, or roughly 10% of the app partition. That leaves comfortable headroom for the Phase 4 work. For reference, there's an earlier 146 KB number floating around in older notes; that was a host-side compiled archive, not the actual firmware. Real budgets are easier to reason about when they're measured end-to-end.

One regression rule I try to live by: any commit that grows the binary by more than 10 KB needs a one-line justification in the message. I've had to write that justification three times so far. Twice I kept the change anyway, once I reverted. The device also ships with a small on-board profiler that reports per-opcode CPU usage back to the host, which is what makes informed tuning possible in the first place.

## What's still missing

Things I'd like to get to in Phase 4, roughly in priority order:

- **Audio decoders**, so sample-based patches work without a host in the loop.
- **Faster serial link.** Pushing big patches at the current baud rate takes noticeable seconds.
- **More than one persisted patch.** The board remembers the most recent pushed patch across reboots, but only that one. A small on-device library would be nicer.
- **A second I/O channel** for control that isn't shared with the debug monitor. USB-CDC, MIDI, or OSC over wifi are all plausible.
- **SIMD on the newer ESP chips.** I wrote up [a feasibility note](https://github.com/mlaass/cedar-esp32/blob/main/docs/vectorization-feasibility.md) on this. The P4 variant especially looks fun.

Each of these individually is a weekend. All of them together probably isn't.

## The part that worked

Hot-swap. I expected this to be the thing that bit me. The machinery that lets cedar preserve state across patch edits (reverb tails continuing through an edit, envelopes staying consistent, oscillators not clicking) is the most intricate part of the VM, and I figured at least one assumption in there would die on a different platform. It didn't. You push a new patch, the crossfade lands at the next audio block, your reverb tail keeps decaying through the edit. On a $10 board.

That's the part I'll take away from the port, I think. Everything painful was platform plumbing: toolchain, codec driver, compiler warnings, stack sizes. Everything audible (live-coded edits, button-driven parameters, seamless patch swaps) worked out of the box, the same as the desktop. The architecture ported; only the edges needed trimming.

If you want to try it, [cedar-esp32 is on GitHub](https://github.com/mlaass/cedar-esp32). The [/esp32 page](/esp32) has the build-and-flash instructions and a longer note on where this is heading.
