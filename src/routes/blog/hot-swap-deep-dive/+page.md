---
layout: blog
title: Hot-swap deep-dive — how semantic IDs keep a sine running across edits
description: A tour of the code that lets you rewrite a running nkido patch without clicking, popping, or dropping a sample.
date: 2026-04-23
author: mlaass
category: post
excerpt: The code that lets you rewrite a running nkido patch without clicking, popping, or dropping a sample.
draft: true
---

If you've live-coded audio before, you've heard this sound: you hit re-run, and every oscillator snaps back to phase zero. It's a click, or a weird pop, or — if the patch is chord-sized — a brief chord of phase-aligned sawtooths that sounds like a tiny digital bleep. Not great.

Nkido doesn't do that. You can edit the cutoff of a filter, change an oscillator's frequency, or bolt a reverb onto the end of a chain, and the audio keeps flowing through the patch as if you'd always written it that way. Filter state, delay buffers, envelope levels, RNG seeds — all preserved.

This post walks through how.

## The problem in one picture

Imagine you're running:

```akk
osc("sin", 440) * 0.3 |> out(%, %)
```

...and you rewrite it to:

```akk
osc("sin", 440) * 0.3 |> lp(%, 1200, 0.4) |> out(%, %)
```

A naive "stop the old program, start the new one" approach would:

1. Stop the VM, which resets the oscillator phase.
2. Compile and load the new program from scratch.
3. Start the VM — sine wave starts from phase zero again. **Click.**

If you add a filter, the click is doubled — once for the restart, once for the filter state starting at zero. Reverbs and delays make it worse: their tails drop to silence mid-sound.

The problem isn't that it's hard to compile fast. Compiling is cheap. The problem is that the VM has state — oscillator phase, filter delay lines, envelope positions — and that state is meaningful. You want the new program to *inherit* the state of the parts that didn't change, and spin up fresh state only for the new bits.

## Semantic IDs: the node knows who it is

Nkido's compiler assigns every DSP instruction a **semantic ID** — a 32-bit hash derived from the instruction's position in the AST, its operator, and its constant arguments. The key function is `compute_state_id()` in the codegen:

```cpp
// akkado/src/codegen.cpp:1574
std::uint32_t CodeGenerator::compute_state_id() const {
    std::string path;
    for (size_t i = 0; i < path_stack_.size(); ++i) {
        if (i > 0) path += '/';
        path += path_stack_[i];
    }
    return cedar::fnv1a_hash_runtime(path.data(), path.size());
}
```

The compiler maintains a `path_stack_` that it pushes and pops as it walks the AST. When it emits an instruction, the current stack joined with `/` separators becomes the input to FNV-1a. Same opcode, same place in the source, same constant args → same ID. Change a constant (e.g. filter cutoff) → same ID, because the cutoff is a *runtime* signal, not part of the path. Change the *structure* (add a filter before the reverb) → different ID, because the reverb is now at a different path.

That's the whole trick. State lives in a state pool keyed by semantic ID, not by instruction index. Compile a new program and its instructions still hash to the same IDs wherever the structure matches — so the state pool serves the right buffer, in the right place, without any diffing.

## The swap itself: triple buffering, atomic handoff

The compiler and the audio thread can never block on each other, so a swap doesn't mean "stop the VM and reload." It means "prepare a new `ProgramSlot`, mark it `Ready`, and let the audio thread pick it up at the next block boundary."

```cpp
// cedar/include/cedar/vm/swap_controller.hpp:99
bool execute_swap() noexcept {
    if (!swap_pending_.load(std::memory_order_acquire)) return false;

    ProgramSlot* ready_slot = nullptr;
    for (auto& slot : slots_) {
        if (slot.state.load(std::memory_order_acquire) == ProgramSlot::State::Ready) {
            ready_slot = &slot;
            break;
        }
    }
    // Current becomes Fading, Ready gets promoted to Active.
    curr_slot->state.store(ProgramSlot::State::Fading, std::memory_order_release);
    ready_slot->state.store(ProgramSlot::State::Active, std::memory_order_release);
    return true;
}
```

Three slots, three atomic states: `Active` (rendering now), `Ready` (compiled and waiting), `Fading` (old program, still being rendered for the crossfade). The compiler always has a free slot to write into; the audio thread always has something to play. Neither touches the other's slot, so there's no lock.

## Rebinding state across the boundary

When the audio thread picks up the new program, it calls `rebind_states`:

```cpp
// cedar/src/vm/vm.cpp:215
void VM::rebind_states(const ProgramSlot* old_slot,
                       const ProgramSlot* new_slot) {
    if (new_slot) {
        auto new_ids = new_slot->get_state_ids();
        for (auto id : new_ids) {
            if (state_pool_.exists(id)) {
                state_pool_.touch(id);  // "still in use"
            }
        }
    }
    // Orphaned states (in old, not in new) get GC'd after the crossfade.
}
```

Every instruction in the new program looks up its semantic ID in the state pool. If a state with that ID already exists — from the old program — it's marked as still-in-use. When the new program runs, those instructions read from and write to the same state as before. The oscillator's phase accumulator keeps accumulating. The filter's biquad registers keep their IIR tail. The delay buffer keeps its samples.

Anything in the old program that *doesn't* match an ID in the new program becomes an orphan. It isn't deleted immediately — more on that in a moment.

## What gets preserved, exactly

The state-pool entries are tagged `DSPState` variants — one per stateful opcode family:

- **`OscillatorState`** — phase accumulator for sine, saw, triangle, square, phasor.
- **`FilterState`** — biquad registers for LP/HP/BP/notch; ladder state for the Moog.
- **`DelayState`** — the ring buffer plus write pointer.
- **`EnvelopeState`** — attack/decay/sustain/release stage + current level.
- And anything else stateful — RNG seeds for noise, Karplus-Strong string buffers, reverb tap memory, granular grain schedules.

If a node's semantic ID survives the edit, all of that survives too. If the ID changes — say you swap a sine for a saw, which is a different opcode — a fresh state is spun up for the new node, and the old state moves to the orphan list.

## Crossfading the orphans

When a node disappears from the graph, you can't just cut its output on the block boundary — that's a click by another name. The runtime keeps orphaned states alive for a few more blocks and mixes their output against the new program using an equal-power crossfade:

```cpp
// cedar/include/cedar/vm/crossfade_state.hpp:95
void mix_equal_power(float* out_left, float* out_right, float position) noexcept {
    const float angle = position * HALF_PI;
    const float old_gain = std::cos(angle);
    const float new_gain = std::sin(angle);
    for (std::size_t i = 0; i < BLOCK_SIZE; ++i) {
        out_left[i]  = old_left[i]  * old_gain + new_left[i]  * new_gain;
        out_right[i] = old_right[i] * old_gain + new_right[i] * new_gain;
    }
}
```

Default is three blocks (about 8 ms at 48 kHz / 128-sample blocks). Short enough that it feels instant to the ear; long enough that the fade is inaudible. The Godot addon exposes this as `crossfade_blocks` (1–10); the ESP32 port defaults to the same value.

Once the fade completes, the orphaned state gets GC'd out of the pool and its buffer is returned to the allocator.

## When the trick doesn't work

A few edits are fundamentally discontinuous, and no amount of state preservation can hide them:

- **Changing an opcode** — swapping `osc("sin", ...)` for `osc("saw", ...)` changes the opcode emitted, so the semantic ID changes and the state resets. The equal-power crossfade saves you from a click, but the harmonic content of the sound changes instantly.
- **Restructuring the chain** — inserting a filter between two existing nodes moves every downstream instruction to a new path, so every downstream state resets. Usually fine; sometimes audible if a reverb tail is sustaining a whole chord.
- **Renaming a variable** used in a pattern's path — because the path segment is in the hash, the nodes under that variable get fresh IDs.

The crossfade covers all of these so they don't click. But you *will* hear the new harmonic structure immediately.

## Why this matters for live coding

Hot-swap is the difference between live-coding as an edit-compile-run cycle and live-coding as an instrument. With semantic IDs, sculpting a running sound — nudging a cutoff, tweaking a reverb mix, adding a subtle distortion to a chain — doesn't interrupt anything. The sound keeps going, and your edit lands on the next block boundary.

It's cheap to describe and very much not cheap to get right. Most of the complexity is in deciding *what counts as the same node* across edits, which is why the semantic path ended up being explicit: the compiler is the authority on identity, not the runtime.

The implementation landed in [commit `df62404`](https://github.com/mlaass/nkido) — triple buffering, crossfade, and state-pool rebinding all in one go. It's been running in anger since early Phase 3 of the ESP32 port, which is a nice forcing function: if hot-swap breaks on a 146 KB budget with six buttons, it breaks the instrument.

See also: [Hot-swap explained](/docs/concepts/hot-swap) for the user-facing version.
