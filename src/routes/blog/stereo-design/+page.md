---
layout: blog
title: "Stereo as a type: how Akkado tracks channel counts at compile time"
description: Stereo support that's both type-safe and invisible. You write mono code; it auto-lifts to stereo where it has to.
date: 2026-04-22
author: mlaass
category: post
excerpt: Stereo support that's both type-safe and invisible. You write mono code; it auto-lifts to stereo where it has to.
draft: true
---

The first pass at stereo in nkido was bad. You had two patches running, one per channel, mixed at the output. Width controls lived in parallel code. If you wanted a slightly wider reverb, you wrote the delay lines twice, hoped they stayed in sync, and cursed when they didn't.

The second pass was worse. Stereo became a runtime flag on each instruction, dispatched per block. Every opcode grew a "stereo mode" branch. The VM's dispatch loop slowed down measurably, and nobody could tell, without running the program, whether a given buffer was mono or stereo at any given point.

The third pass, which ships today, treats channel count as a compile-time type. You don't write `stereo_filter(lp, ...)`. You write `lp(...)`, and the compiler figures out whether it's operating on one channel or two. If you try to combine signals with incompatible channel counts, you get a compile error with a number, not a crash or a silent wrong answer.

Here's how it works.

## Channel count lives on `TypedValue`

Every expression the Akkado compiler produces has a type:

```cpp
// akkado/include/akkado/typed_value.hpp:26
enum class ChannelCount : std::uint8_t {
    Mono   = 0,
    Stereo = 1,
};

struct TypedValue {
    std::uint16_t buffer;
    std::uint16_t right_buffer = 0xFFFF;   // only valid for Stereo
    ChannelCount channels = ChannelCount::Mono;
    // ...
};
```

A mono signal is a single `buffer` index. A stereo signal is two buffer indices (the `buffer` field for the left channel, `right_buffer` for the right) allocated adjacent to each other. The `channels` field isn't checked at runtime. It's a type, and the compiler tracks it through every expression.

Defaults are pragmatic: oscillators, filters, envelopes, and most DSP produce `Mono`. Going stereo is explicit (`stereo(x)`, `stereo(l, r)`, or any builtin whose output is inherently stereo, like `freeverb`).

## Builtins declare their channel contract

Each builtin carries a small metadata block the compiler consults during codegen:

```cpp
// akkado/include/akkado/builtins.hpp:86
struct BuiltinInfo {
    std::array<ChannelCount, MAX_BUILTIN_PARAMS> input_channels = {};
    ChannelCount output_channels = ChannelCount::Mono;
    bool auto_lift = false;  // Stereo in → Stereo out, per-channel
};
```

There are three shapes of builtin:

1. **Strictly mono**: `osc`, `saw`, `sin`. Output is always mono; passing a stereo argument is a type error.
2. **Auto-lifting mono**: `lp`, `hp`, `delay`, `reverb` (the internal kind). Inputs can be mono *or* stereo. If stereo, the compiler runs the opcode twice (once per channel) with independent state.
3. **Inherently stereo**: `freeverb`, `width`, `pan`, `ms_encode`/`decode`, `pingpong`. Input contract is explicit; output is always stereo.

The auto-lift flag is the one that makes stereo feel invisible. You write `bus |> lp(%, 1200, 0.4)`, and if `bus` happens to be stereo, the filter runs per-channel with its own biquad state on each. No code duplication, no accidental state sharing.

## `stereo()`, `mono()`, `left()`, `right()`

Four functions convert between channel counts. Each has a minimal, fixed opcode cost:

```cpp
// akkado/src/codegen_stereo.cpp:152 :: stereo(mono)
emit(make_unary(Opcode::COPY, left_buf, mono_buf));
emit(make_unary(Opcode::COPY, right_buf, mono_buf));
```

`stereo(x)` duplicates a mono signal into two adjacent buffers, two `COPY` instructions.

```cpp
// akkado/src/codegen_stereo.cpp:88 :: mono(stereo)
emit(make_binary(Opcode::MONO_DOWNMIX, out_buf, left_buf, right_buf));
```

`mono(s)` is a `(L + R) * 0.5` downmix, one dedicated opcode.

`left()` and `right()` are *free*. They extract one of the two buffer indices from a `TypedValue` and return a new `TypedValue` with `channels = Mono`. No instruction emitted. Zero runtime cost.

Trying to call any of these on a signal that's already the target type is a compile error with a numeric code: E181 (`mono(already_mono)`), E182 (`stereo(already_stereo)`), E183/E184 (`left`/`right(mono)`). The errors are narrow on purpose. They almost always mean something upstream didn't produce what you thought.

## The auto-lift trick: STEREO_INPUT flag

The fun part is how auto-lift is dispatched. The compiler emits *one* instruction with a flag set:

```cpp
// akkado/src/codegen.cpp:1155 (abbreviated)
if (is_stereo_expansion) {
    std::uint16_t out_left  = buffers_.allocate();
    std::uint16_t out_right = buffers_.allocate();

    cedar::Instruction inst{};
    inst.opcode     = builtin->opcode;         // e.g. FILTER_LP
    inst.out_buffer = out_left;
    inst.inputs[0]  = expansion_buffers[0];    // left input
    inst.flags      = InstructionFlag::STEREO_INPUT;

    push_path("L");
    inst.state_id = compute_state_id();        // /L suffix
    pop_path();
    emit(inst);

    register_stereo(node, out_left, out_right);
}
```

Then at dispatch time, the VM sees the flag and runs the opcode twice: once as-is, once with buffer offsets shifted.

```cpp
// cedar/src/vm/vm.cpp:462
if (inst.flags & InstructionFlag::STEREO_INPUT) [[unlikely]] {
    Instruction left = inst;
    left.flags &= ~InstructionFlag::STEREO_INPUT;
    execute(left);

    Instruction right = left;
    right.out_buffer += 1;
    if (inst.inputs[0] != BUFFER_UNUSED) right.inputs[0] += 1;
    right.state_id = inst.state_id ^ STEREO_STATE_XOR_R;  // golden ratio
    execute(right);
    return;
}
```

Two key details:

- **Adjacent buffers**: because the compiler allocates `out_left` and `out_right` adjacent, "shift by 1" gets the right channel. Same for inputs. This keeps the dispatch path short, with no extra lookups.
- **State IDs XOR'd for the R pass**: the state pool keyed each channel independently. Left channel's state ID is the normal path hash; right channel's is `state_id ^ 0x9E3779B9` (the golden-ratio fractional-bit constant, used just because it scatters bits well). The two channels end up with separate biquad state and separate delay buffers, which is what you'd expect from a stereo filter, without the compiler having to emit two instructions.

The cost is one branch per instruction (the `if` above), hit only when stereo, and predicted-not-taken on the mono path.

## Backward compatibility with mono hot-swap

The `/L` suffix on the state-path-hash deserves a sentence, because it's load-bearing. A patch that was mono yesterday and stereo today shouldn't reset its filter state on edit. The compiler uses `/L` specifically so that the mono path (`fnv1a(path)`) is equivalent to the old scheme. A mono filter's state_id is unchanged from before auto-lift existed. A stereo filter has a left-channel state_id that matches the mono version, and a right-channel state_id that's the mono version XOR'd with the golden-ratio constant. Hot-swap between mono and stereo versions of the same patch keeps the L-channel state continuous. Not important often, but when you're live-editing a stereo reverb you want it to stay alive.

## Mixed-channel arithmetic

`+`, `-`, `*`, `/` on a mono and a stereo operand broadcast the mono side:

```akk
dry = osc("saw", 220)                          # Mono
wet = dry |> stereo() |> freeverb(%, 0.9, 0.5) # Stereo
dry * 0.3 + wet * 0.7 |> out(%, %)             # Stereo out
```

`dry * 0.3` stays mono. `wet * 0.7` stays stereo. `mono + stereo` promotes to stereo by dual-reading the mono buffer into both channels, which is one extra instruction per operand.

Mono on mono stays mono. Stereo on stereo is L op L, R op R. There's no implicit mono-to-stereo promotion *anywhere else*. `out(stereo_signal)` splits, and `out(mono_signal)` duplicates, but that's it. If the compiler can't make sense of a channel mismatch, it complains instead of guessing.

## What stereo doesn't do

A few surprises worth flagging:

- **Scalar parameters (cutoff, resonance, delay time, feedback) are shared across L and R.** Auto-lift duplicates the opcode but not the parameter stream. If you want per-channel modulation, split the stream and write the two chains explicitly.
- **Pattern events are always mono.** `pat`, `seq`, `timeline` produce mono frequency/trigger signals. A stereo synth driven by a mono pattern is the default case; if you want a stereo pattern (different notes per channel) you have to build it from two mono patterns.
- **Cross-channel effects** like `width`, `ms_encode`/`decode`, `pingpong` aren't auto-lifted. They're *inherently* stereo operations; their signatures make the mono case illegal.

## Why this pays off

Writing stereo Akkado feels identical to writing mono Akkado, until you explicitly go stereo. From there the rest of the chain follows without modification. The compiler is the one source of truth about which buffers are stereo, which simplifies the VM (one generic opcode dispatch, not N stereo-aware variants) and gives honest error messages when the types don't line up.

The PRD for stereo support is at [`docs/prd-stereo-support.md`](https://github.com/mlaass/nkido) if you want the requirements-side of the story; the audit log shows the gotchas that fell out of implementing it.

See also: [Mono and Stereo Signals reference](/docs/reference/builtins/stereo) for the builtins this post dances around.
