---
layout: blog
title: Introducing NKIDO
description: A live-coded audio engine that runs in the browser, on desktop, in Godot, and on ESP32. Now open source under MIT.
date: 2026-04-22
author: mlaass
category: post
excerpt: A live-coded audio engine that runs in the browser, on desktop, in Godot, and on ESP32. Now open source under MIT.
---

NKIDO is a new open-source audio synthesis platform: a pattern-language front-end named **Akkado**, a graph-based DSP engine named **Cedar**, and a web IDE that lets you live-code both. It runs in the browser, on desktop, inside Godot games, and on the ESP32-A1S Audio Kit.

## Why another audio system?

There are great live-coding environments (Strudel, TidalCycles, SuperCollider) and great DSP graphs (Pure Data, Csound). NKIDO's bet is that these two worlds belong together in one runtime, and that the runtime should be small enough to embed _anywhere_, not just on a laptop.

## What's in v1

- **95+ DSP opcodes**: oscillators, filters, delays, reverbs, granular, Karplus-Strong, vocoder, bitcrusher. The usual arsenal.
- **Hot-swap with preserved state**: edit while it plays, no clicks. See [how it works](/docs/concepts/hot-swap).
- **Web IDE at [live.nkido.cc](https://live.nkido.cc)**: full browser-native development with WASM + AudioWorklet.
- **Godot 4.x addon**: embed NKIDO in games. [Install instructions](/godot).
- **ESP32 port**: ~146 KB stripped binary, real-time audio on a $30 board. [Build and flash guide](/esp32).

## Try it now

The fastest way to get a feel for NKIDO is the 5-minute [Hello Sine tutorial](/docs/tutorials/hello-sine). No install, just a browser.

## What's next

v1 is a starting point. The roadmap includes a proper docs site, a published plugin format for Cedar, MIDI + OSC bridges, and a real-time collaboration mode for the web IDE. Issues and PRs welcome on [GitHub](https://github.com/mlaass/nkido).

MIT licensed. If it's useful to you, consider [sponsoring](https://github.com/sponsors/mlaass).
