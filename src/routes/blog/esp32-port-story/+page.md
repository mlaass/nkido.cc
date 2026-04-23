---
layout: blog
title: "Cedar on ESP32: what it took to put nkido on a $10 board"
description: Docker-wrapped IDF builds, an ES8388 brought up by hand, and a VM that lives in PSRAM because it doesn't fit anywhere else.
date: 2026-04-21
author: mlaass
category: post
excerpt: Docker-wrapped IDF builds, an ES8388 brought up by hand, and a VM that lives in PSRAM because it doesn't fit anywhere else.
draft: true
---

When I started the ESP32 port, the main question was: is there even room? Cedar on desktop is generous with itself. Buffer pools, probe rings, multiple state variants, a stereo pipeline plus a mono fallback. Audio decoders. Soundfonts. A `std::aligned_alloc` call that, it turns out, doesn't exist in xtensa libstdc++. The mainline build happily consumes a couple of megabytes for the runtime VM and doesn't think twice about it.

The ESP32-A1S Audio Kit has 128 KB of internal SRAM split into a handful of regions, a couple of megabytes of PSRAM if you're lucky, and a 3 MB app partition. "A couple of megabytes" sounds fine until you realize it's also where your bytecode, your persisted programs, and any sample you want to play live.

So: could it fit? Yes, with some sanding. Here's what that sanding looked like.

## Phase 1: boot a sine wave

The first goal was tiny. Boot the board, init the ES8388 codec, get a 440 Hz sine out the headphone jack. No live-coding, no UART, no buttons. Just sound.

Three things fought me immediately.

**The ES8388 codec driver.** ESP-ADF (Espressif's audio framework) ships one. It does sample-rate negotiation, MIC/line input routing, hardware volume, and a dozen other things I didn't need. I wrote the init inline in `main/es8388.c` instead. It's about 150 lines: register-level I2C, set up a 256·f<sub>s</sub> MCLK (12.288 MHz for 48 kHz audio), point the DAC at GPIO 26, enable PA_EN for the speaker amp. One-shot at boot. The whole file is short enough to read in a sitting.

**`std::aligned_alloc` doesn't exist.** Cedar uses it for state-pool allocations. Xtensa's libstdc++ ships without it. The fix is the build flag `CEDAR_USE_POSIX_MEMALIGN=1`, which routes allocations through `posix_memalign` instead. Took me an afternoon to find; the error was a linker failure buried in a 10k-line IDF build log.

**Format specifiers blow up warnings.** `uint32_t` is `unsigned long` on xtensa, so cedar's debug printfs that use `%u` get warned at, loudly, and with `-Werror` loud becomes fatal. I added `-Wno-error=format` for the cedar component and moved on. The proper fix is to gate the debug prints behind a flag upstream; silence works for now.

By the end of Phase 1, the main task stack was also bumped from 3584 to 8192. Cedar's init path had grown enough that the default overflowed, and the symptom was the most satisfying kind of bug report: the board reboots on boot, with no error message. If it had left any breadcrumbs I'd have found it in an hour instead of two.

## Phase 2: live-push over UART

Flashing takes ~15 seconds. That's fine for firmware work, but hot-swapping a patch after re-flashing is a joke. The whole point of nkido is that edits land without killing audio, so Phase 2 was a tiny framed protocol on UART0.

Frame shape, for reference:

```
2 bytes  magic 0xCE 0xDA
4 bytes  payload length, little-endian
1 byte   frame type
N bytes  payload
4 bytes  CRC32 (IEEE 802.3, matches zlib.crc32)
```

Type codes: `0x01` SWAP (push a program), `0x02` SET_PARAM (change a runtime value), `0x03` PING, `0x04` PERF_QUERY (dump a profiler snapshot). Device responds with `0x80` ACK or `0x81 reason` NACK.

The payload is either a raw cedar bytecode blob or a `.cbc` container, which is my own little format that prepends parameter metadata. That way the device knows "slot 0 is a filter cutoff ranging 100–8000 with default 1200, maps to KEY1" without having to parse Akkado source.

Host-side CLI lives in `tools/cedar-push/`. `python3 -m cedar_push --port /dev/ttyUSB0 patch.cbc` and the new program is rendering by the next audio block, with the hot-swap crossfade covering any state differences. Latency from keypress to sound-changing is under 50 ms on the hardware I've measured it on, and most of that is USB enumeration.

`PERF_QUERY` is the other thing worth calling out. It asks the device for a snapshot of the per-opcode profiler and the per-stage CPU meter (dsp / conv / i2s, measured via the CCOUNT register). `cedar-push --perf` on the host prints it. Handy when a patch starts dropping blocks and you want to know whether it's the DSP graph or the I2S sink that's starving.

One subtle thing about UART0: it's shared with `idf.py monitor`, so you can't push and monitor at the same time. I've thought about moving to UART1 or using USB-CDC on a revised board, but closing the monitor before pushing is fine enough that I haven't.

## Phase 3: the six buttons become the interface

With live-push working, the question became: what does the device itself do? It has six buttons, KEY1 through KEY6. You could wire them to a fixed schema (KEY1 = volume, KEY2 = filter, and so on) but that's boring, and patches differ.

Instead: when a `.cbc` arrives with parameter metadata, the device binds the first six `param()` / `button()` / `toggle()` declarations to the six buttons, in declaration order. The scanner polls GPIO every 5 ms with a three-read debounce (so a 15 ms stable window) and routes presses through a uniform `handle_edge` function.

`param` presses step the value by `(max − min) / 20` and wrap around. `button` is momentary with slew 0, so gates stay tight. `toggle` flips between 0.0 and 1.0, also with slew 0. Every press logs to UART so you can watch values update in the monitor.

The scanner also computes a signature hash of the bound slots after each program load. That's how the device knows a push changed the binding rather than just updating the bytecode. Rebinding happens atomically; the scanner task never touches the audio thread's state.

`assets/demo_keys.akk` is the one I keep coming back to. It's a five-note ocarina: KEY1..KEY5 drive sine-plus-AR-envelope voices tuned to an A minor pentatonic (A4, C5, D5, E5, G5), and KEY6 toggles a freeverb tail on top of the dry mix. There's a slow 5 Hz tremolo on the wet signal so the reverb tail shimmers instead of just sitting there. Plug in headphones, push `demo_keys.cbc`, and the board becomes a tiny chord-stacking thing with a reverb switch.

## The memory story

Cedar's VM wants about 1.15 MB of working state. That's state pools (one per opcode family: oscillator phase, filter biquad registers, envelope levels, and so on), buffer pools for inter-instruction data, and per-opcode reverb tables. None of that fits in the ESP32's internal SRAM.

PSRAM solves it: 4–8 MB, autodetected, accessed through the cache. `main/cedar_host.cpp` heap-allocates the VM on first access, and from then on it's a pointer. Internal DRAM's BSS section stays tiny (barely 4 KB) because the hot path lives in IRAM (~61 KB, about 48% of the IRAM budget) and the rest sits out in PSRAM.

To fit even the compiled-out cedar in flash, several features are turned off in the ESP32 build:

- **`CEDAR_NO_AUDIO_DECODERS`**: no WAV/Ogg decoders. Sample loading comes back in Phase 4 via ESP-ADF.
- **`CEDAR_NO_SOUNDFONT`**: SF2 support is ~200 KB of code plus big lookup tables. Off.
- **`CEDAR_NO_FFT`**: no spectral analysis on-device. `visualization` opcodes that need it are stubs.
- **`CEDAR_NO_FILE_IO`**: no local FS support compiled into cedar. SPIFFS is wired separately for program persistence.
- **`CEDAR_NO_MINBLEP`**: aliasing goes up, flash goes down. A trade, not a win.
- **`CEDAR_FLOAT_ONLY`**: drop the fixed-point opcode variants.
- **`CEDAR_NO_PROBE`**: the debug probe ring buffer drops `DSPState` from 4.1 KB to 800 B per node. Huge win on a per-instruction basis.

Flash after all of that, on the Phase 3 baseline: ~306 KB, about 10% of the 3008 KB factory partition. That's not 146 KB (the number I quoted early on, which turned out to be the host-only cedar archive, not the xtensa firmware), but it leaves plenty of headroom for Phase 4's decoders. The regression rule: any commit that adds more than 10 KB to the bin needs a one-line justification. I've had to write that justification three times so far. Twice I kept the change.

One related tune I'll mention: `MAX_BUFFERS` got bumped from 80 to 96 once the profiler landed. That keeps the VM comfortably in DRAM while giving an extra 13 slots of crossfade headroom for patches with deeper graphs. Worth it.

## What's still missing

The Phase 4 list:

- **ESP-ADF audio decoders** so sample-heavy patches work without the host.
- **Console UART at 460 800 baud.** Currently still 115 200. The `sdkconfig.defaults` line I wrote for it is silently ignored: `CONFIG_ESP_CONSOLE_UART_BAUDRATE` is a Kconfig *choice*, not a plain int, so the bump needs `CONFIG_ESP_CONSOLE_UART_BAUDRATE_CUSTOM=y` plus a matching `_VALUE`. Easy fix, just hasn't hit the top of the list. Big `.cbc` files take noticeable seconds to push at 115 200.
- **Stereo codec output verified end-to-end.** The mono path works, stereo is compiled in, I just haven't sat down with a scope and an actual pair of speakers.
- **Multiple persisted programs.** SPIFFS at offset 0x300000 currently keeps the last pushed program across reboots (that part landed a couple of days ago), but only one slot. A proper pack format would let you keep a small set and switch between them.
- **A second I/O channel** (USB CDC, MIDI, OSC over Wi-Fi with a watchdog) that isn't shared with the IDF monitor.
- **SIMD for S3 and P4 variants.** I wrote up a feasibility note in `docs/vectorization.md` covering the ESP32 / S3 / C3 / P4 delta. Not urgent, but the P4 especially looks fun.

Each of those individually is a weekend. All of them together probably isn't.

## Hot-swap is the part I expected to bite

It didn't. You push a new `.cbc`, the crossfade lands at the next block, your reverb tail keeps decaying through the edit. I was mildly skeptical that the semantic-ID machinery would survive the trip to a platform with a different stdlib and a much smaller memory budget, but it did, without modification. On a $10 board.

Everything that was painful in the port was platform plumbing: toolchain, codec driver, format specifiers, the Kconfig choice that isn't. Everything that was actually audible (live-coded edits, button-driven parameters, seamless patch swaps) was the desktop experience, running on a cheap board sitting on my desk. Which is the point: the architecture is portable, and what's left is just making the trim fit.

If you want to try it, [cedar-esp32 is on GitHub](https://github.com/mlaass/cedar-esp32). Read [the /esp32 page](/esp32) for the build-and-flash how-to, or jump straight to the UART protocol in the repo's `docs/`.
