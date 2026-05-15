---
layout: doc
title: Stability & expectations
description: What "pre-1.0" means for NKIDO — what may change, what's reliable, and where to find the current truth.
backHref: /docs
backLabel: Docs
keywords: [stability, pre-1.0, breaking-changes, versioning, expectations]
---

NKIDO is **pre-1.0**. The language, runtime, and tooling are still settling. This page sets expectations so you can decide how to use it today.

## What may change

Anything in the surface area can change before 1.0:

- **Syntax** — operators (e.g. `|>`, `@`, method-sugar), mini-notation tokens, frontmatter, file conventions.
- **Builtins** — names, parameter order, defaults, signal-rate behavior.
- **Runtime semantics** — how hot-swap reconciles state, what counts as a "same" node, scheduling details.
- **APIs** — embedding hosts (browser, Godot, ESP32, native), file formats, OSC/MIDI bindings.

We try to keep churn meaningful, but no part of the API is frozen yet.

## What you can rely on right now

- **`live.nkido.cc` is the source of truth.** It runs the current build. If a doc snippet and the live editor disagree, **the live editor wins**.
- **The core idea is stable.** Signals composed into a DAG, hot-swapped at runtime, with mini-notation for patterns — that's the project, and it isn't going away.
- **MIT license.** That's not changing.

## Where the docs can drift

Documentation is maintained alongside the code, but it lags reality between releases:

- A syntax tweak or renamed builtin may ship to `live.nkido.cc` before the docs catch up.
- Example snippets in tutorials and concept pages are validated against a recent build, not always the very latest one.
- Mirrored reference docs (under `/docs/reference/`) are auto-imported from the runtime; concept and tutorial pages are written by hand and update more slowly.

**If something in the docs doesn't work, try it in `live.nkido.cc` first.** That's the current behavior.

## How to follow changes

- [Releases on GitHub](https://github.com/mlaass/nkido/releases) — version notes when a build is cut.
- [GitHub repo](https://github.com/mlaass/nkido) — issues, discussions, and the commit log.
- The `/releases` and `/contributing` pages on this site mirror upstream content on each build.

## What 1.0 will mean

When NKIDO hits 1.0, "stable" will mean:

- **Semver applies** — breaking syntax or builtin changes only on major versions.
- **Mini-notation tokens are frozen** — the dialect won't shift under existing patches.
- **Embedding API is committed** — host applications can pin a version and trust the contract.
- **Docs and runtime track each other** — examples in the docs are pinned to a release and verified.

Until then: experiment, build, share — but **pin your version** and assume the next release may need migration notes.
