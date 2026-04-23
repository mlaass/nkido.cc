---
layout: blog
title: Cedar on ESP32 — what it took to put nkido on a $10 board
description: Docker-wrapped IDF builds, an ES8388 brought up by hand, and a VM that lives in PSRAM because it doesn't fit anywhere else.
date: 2026-04-21
author: mlaass
category: post
excerpt: Docker-wrapped IDF builds, an ES8388 brought up by hand, and a VM that lives in PSRAM because it doesn't fit anywhere else.
draft: true
---

When I started the ESP32 port, the main question was: is there even room? Cedar on desktop is generous with itself — buffer pools, probe rings, multiple state variants, a stereo pipeline plus mono fallback. Audio decoders. Soundfonts. A `std::aligned_alloc` call that (it turns out) doesn't exist in xtensa libstdc++. The mainline build happily consumes a couple of megabytes for the runtime VM and doesn't think twice about it.

The ESP32-A1S Audio Kit has 128 KB of internal SRAM split into a handful of regions, a couple of megabytes of PSRAM if you're lucky, and a 3 MB app partition. "A couple of megabytes" sounds fine until you realize it's also where your bytecode, your persisted programs, and any sample you want to play live.

So: could it fit?

Yes, with some sanding. Here's what I learned putting it on hardware.

## Phase 1 — boot a sine wave

The first goal was tiny: boot the board, init the ES8388, get a 440 Hz sine out the headphone jack. No live-coding, no UART, no buttons. Just *sound*.

Three things fought me immediately.

**The ES8388 codec driver.** ESP-ADF — Espressif's audio framework — has a driver. It's ~200 KB of code that does sample-rate negotiation, MIC/line input routing, hardware volume, a dozen things the port doesn't need. I wrote the init inline in `main/es8388.c` instead. It's about 150 lines: register-level I2C, set up a 256·f<sub>s</sub> MCLK (12.288 MHz for 48 kHz audio), point the DAC at GPIO 26, enable PA_EN for the speaker amp. One-shot. The whole file is short enough to read in a sitting.

**`std::aligned_alloc` doesn't exist.** Cedar uses it for state-pool allocations. Xtensa's libstdc++ ships without it. The fix is the build flag `CEDAR_USE_POSIX_MEMALIGN=1`, which routes allocations through `posix_memalign` instead. Took me an afternoon to find — the error was a linker failure buried in a 10k-line IDF build log.

**Format specifiers blow up warnings.** `uint32_t` is `unsigned long` on xtensa, so cedar's debug printfs that use `%u` get warned at, loudly, and with `-Werror` loud becomes fatal. Added `-Wno-error=format` for the cedar component and moved on. Long-term we'll fix the format strings; short-term, silence works.

By the end of Phase 1, the main task stack was also bumped from 3584 to 8192 — cedar's initialization path had grown enough that the default overflowed, and the symptom was the most satisfying kind of bug report: *the board reboots on boot, with no error message*. If it had left any breadcrumbs I'd have found it in an hour instead of two.

## Phase 2 — live-push over UART

Flashing takes ~15 seconds. That's fine for firmware work, but hot-swapping a patch after re-flashing is a joke — the whole point of nkido is that edits land without killing audio. So Phase 2 was a tiny framed protocol on UART0.

Frame shape, for reference:

```
2 bytes  magic 0xCE 0xDA
4 bytes  payload length, little-endian
1 byte   frame type
N bytes  payload
4 bytes  CRC32 (IEEE 802.3, matches zlib.crc32)
```

Type codes: `0x01` SWAP (push a program), `0x02` SET_PARAM (change a runtime value), `0x03` PING, `0x04` PERF_QUERY (dump a profiler snapshot). Device responds with `0x80` ACK or `0x81 reason` NACK. The whole spec fits on a page.

The payload is either a raw cedar bytecode blob or a `.cbc` container — my own little format that prepends parameter metadata so the device knows that "slot 0 is a filter cutoff ranging 100–8000 with default 1200, maps to KEY1" without having to parse Akkado source.

Host-side CLI lives in `tools/cedar-push/`. `python3 -m cedar_push /dev/ttyUSB0 patch.cbc` and the new program is rendering by the next audio block, with the hot-swap crossfade covering any state differences. Latency from keypress-on-keyboard to sound-changing is under 50 ms on the hardware I've measured it on, and most of that is USB enumeration.

One subtle thing: UART0 is shared with `idf.py monitor`. So you can't push and monitor at the same time. I've thought about moving to UART1, or using USB-CDC on a revised board, but for now closing the monitor before pushing is fine enough that I haven't.

## Phase 3 — the six buttons become the interface

With live-push working, the question became: what does the *device* do? It has six buttons. KEY1–KEY6. You could wire them to a fixed schema — KEY1 = volume, KEY2 = filter, etc. — but that's boring, and patches differ.

Instead: when a `.cbc` arrives with parameter metadata, the device binds the first six `param()` / `button()` / `toggle()` declarations to the six buttons, in declaration order. The scanner polls GPIO every 5 ms with a three-read debounce (15 ms stable window) and routes presses through a uniform `handle_edge` function.

`param` presses step the value by `(max − min) / 20`, which is a pragmatic round number. `button` is momentary with slew 0 — so gates stay tight. `toggle` flips between 0.0 and 1.0, also with slew 0. Every press logs to UART so you can watch values update in the monitor.

The scanner also computes a signature hash of the bound slots after each program load, which is how the device knows a push changed the binding vs. just updated the bytecode. Rebinding happens atomically; the scanner task never touches the audio thread's state.

`assets/demo_keys.akk` is the demo I keep coming back to — a simple saw+lowpass with KEY1 = cutoff, KEY2 = trigger, KEY3 = mute. Plug in headphones, push `demo_keys.cbc`, and the board becomes a little three-key instrument.

## The memory story

Cedar's VM wants about 1.15 MB of working state. That's state pools (one per opcode family — oscillator phase, filter biquad registers, envelope levels, etc.), buffer pools for inter-instruction data, and per-opcode reverb tables. None of that fits in the ESP32's internal SRAM.

PSRAM solves it: 4–8 MB, autodetected, accessed through the cache. `main/cedar_host.cpp` heap-allocates the VM on first access, and from then on it's a pointer. Internal DRAM's BSS section is tiny — barely 4 KB — because the hot path stays in IRAM (~61 KB, about 48 % of the IRAM budget) and the rest lives out in PSRAM.

To fit even the compiled-out cedar in flash, several features are turned off in the ESP32 build:

- **`CEDAR_NO_AUDIO_DECODERS`** — no WAV/Ogg decoders. Sample loading will come back in Phase 4 via ESP-ADF.
- **`CEDAR_NO_SOUNDFONT`** — SF2 support is ~200 KB of code + big lookup tables. Off.
- **`CEDAR_NO_FFT`** — no spectral analysis on-device. `visualization` opcodes that need it are stubs.
- **`CEDAR_NO_FILE_IO`** — no local FS support compiled into cedar. SPIFFS is wired separately for program persistence.
- **`CEDAR_NO_MINBLEP`** — aliasing goes up, flash goes down. A trade, not a win.
- **`CEDAR_FLOAT_ONLY`** — drop the fixed-point opcode variants.
- **`CEDAR_NO_PROBE`** — the debug probe ring buffer drops `DSPState` from 4.1 KB to 800 B per node. Huge win on a per-instruction basis.

Flash after all of that, on the Phase 3 baseline: ~377 KB, about 10 % of the 3 MB factory partition. That's not 146 KB (the number I quoted early on, before the profiler and the key scanner landed), but it leaves headroom for Phase 4's decoders. The regression rule: any commit that adds more than 10 KB to the bin needs a one-line justification. I've had to write that justification three times so far. Twice I kept the change.

## What's still missing

The Phase 4 list, roughly in order:

- **ESP-ADF audio decoders** so sample-heavy patches work without the host.
- **UART baud bump to 460 800**. Currently 115 200. Big `.cbc` files (soundfont-adjacent) take noticeable seconds to push.
- **Stereo codec output verified end-to-end**. The mono path works; stereo is compiled in but I haven't measured it on the board.
- **Proper partition for user programs.** Right now SPIFFS holds one program at offset 0x300000; a proper pack format would let you keep a set.
- **A second I/O channel** (USB CDC? MIDI? OSC over Wi-Fi with a watchdog?) that isn't shared with the IDF monitor.

Each of those individually is a weekend. All of them together probably isn't.

## The part that surprised me

Hot-swap works. Not just compiles-and-runs — it actually preserves state through an edit. I was mildly skeptical that the semantic-ID machinery would survive the trip to a platform with a different stdlib and a much smaller memory budget. But it does, without modification. You push a new `.cbc`, the crossfade lands at the next block, your reverb tail keeps decaying through the edit. On a $10 board.

That's the shape of the thing, really. Everything that was painful in the port was platform plumbing (toolchain, codec driver, format specifiers). Everything that was *audible* — the live-coded edits, the button-driven parameters, the seamless patch swaps — was exactly what the desktop version does. Which is the good outcome: the architecture is portable, and what's left is just making the trim fit.

If you want to try it, [cedar-esp32 is on GitHub](https://github.com/mlaass/cedar-esp32). Read [the /esp32 page](/esp32) for the build-and-flash how-to, or jump straight to the UART protocol in the repo's `docs/`.
