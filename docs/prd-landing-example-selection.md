# PRD: Landing Page Example Selector

> **Status: NOT STARTED** — Replace the single-patch `LiveEmbed` on the landing page with a tabbed interface that lets visitors switch between 8–10 curated examples showcasing nkido's feature set, all within a single iframe via postMessage patch switching.

---

## 1. Executive Summary

The landing page currently embeds a single patch (`hello-sine`) via a click-to-activate iframe (`LiveEmbed`). This PRD proposes replacing it with a **horizontal tab interface** offering 8–10 curated examples that demonstrate the breadth of nkido's capabilities: oscillators, FM synthesis, wavetable scanning, polyphony/chords, microtonal composition, effects chains, drum sequencing, interactive parameters, visualizations, and SoundFont playback.

Key decisions made during planning:

- **Single iframe, tabs swap content.** Clicking a tab changes which patch is loaded inside the same iframe — no multiple iframes.
- **PostMessage with ack handshake.** The landing page sends `{ type: 'switch-patch', patch: '<slug>' }` to the iframe. The iframe responds with `{ type: 'patch-loaded' }` or `{ type: 'error' }`. This avoids reloading the WASM runtime on every tab switch.
- **Examples built as new patches** in the nkido repo under `web/static/patches/`, extending the existing patch system (same `index.json` convention).
- **Poster updates with tab selection.** Before activation, the click-to-activate poster shows the currently-selected example's name. After activation, tab switches are instant with no loading indicator.
- **URL param for shareability.** The selected tab is encoded as `?demo=<slug>` so visitors can share links to specific examples.
- **Most impressive demo as default.** Instead of `hello-sine`, the first tab will be the most visually/aurally impressive example to maximize first-time visitor impact.
- **Tabs wrap to multiple centered lines on mobile.** No horizontal scroll, no dropdown — the tab bar expands vertically on small screens.

---

## 2. Current State

| Surface | Today | After this PRD |
|---|---|---|
| Landing demo | Single `<LiveEmbed>` loading `hello-sine` via iframe | Tabbed `ExampleSelector` component with 8–10 examples, single iframe, postMessage switching |
| Poster | Shows `hello-sine` code snippet + "Click to play" | Shows the currently-selected tab's example name; code snippet stays in the IDE after activation |
| Iframe activation | One click loads the iframe for the hardcoded patch | One click loads the iframe for the selected tab's patch |
| Patch switching | Not possible — reload page or open new IDE tab | PostMessage to the already-loaded iframe; near-instant patch swap |
| Patch storage | 4 patches in `web/static/patches/` with `index.json` | 8–10 new example patches added to the same directory + index |
| URL state | No query param | `?demo=<slug>` on the landing page for shareable links |
| Mobile tab bar | N/A (single patch) | Tabs wrap to 2+ centered lines on small screens |

### 2.1 Existing `LiveEmbed` Behavior

`src/lib/components/Home/LiveEmbed.svelte` currently:
- Accepts `patch` and `title` props (defaults: `hello-sine` / `Hello Sine`)
- Shows a click-to-activate poster with syntax-highlighted code
- On click, loads an iframe pointing to `https://live.nkido.cc/embed?patch=<name>`
- Has an 8s timeout → fallback "Open in a new tab" link if the iframe fails to load
- No mechanism for switching patches after the iframe is loaded

This component will be **replaced** entirely by the new `ExampleSelector` component.

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. **Showcase 8–10 examples** that demonstrate nkido's core features through a tabbed interface on the landing page.
2. **Instant patch switching** via postMessage — no WASM reload when changing between examples after the iframe is activated.
3. **Shareable links** via `?demo=<slug>` URL param so visitors can link directly to a specific example.
4. **New patches authored** in the nkido repo under `web/static/patches/` with entries in `index.json`.
5. **Embed route updated** in the nkido repo to accept and process postMessage patch-switch commands with an ack protocol.
6. **Mobile-friendly tab bar** that wraps to multiple centered lines on small screens.

### 3.2 Non-Goals

1. **Wavetable / microtonal placeholder slots** — both features are confirmed implemented; all examples will be fully functional patches.
2. **Per-example code previews on the landing page** — code stays in the IDE; the poster only shows the example name.
3. **Multiple iframes** or preloading more than one patch simultaneously.
4. **Browser history (back/forward) across tab switches** — only the URL param is updated; no history.pushState per tab change.
5. **Changes to the main IDE UI** beyond the embed route's postMessage handler.
6. **Automatic rotation / autoplay** of examples.
7. **Analytics on which examples are most popular** (could be a future addition).

---

## 4. Target Experience

**Visitor lands on `nkido.cc/`:**

1. Sees the hero section, then the tabbed example selector below it.
2. The tab bar shows 8–10 short labels (e.g. "FM Synth", "Wavetable", "Polyphony"). The most impressive example is selected by default.
3. Below the tabs, a poster shows the selected example's name with a "Click to play" CTA.
4. Visitor clicks the poster → iframe loads (~4s WASM load) → audio plays.
5. Visitor clicks a different tab → postMessage sends patch-switch command → iframe swaps the patch instantly → new audio plays.
6. Visitor copies the URL (now contains `?demo=fm-synth`) and shares it. Recipient opens the link → the correct tab is pre-selected → poster shows that example → click to play.

---

## 5. Proposed Examples

The following 10 examples are proposed. Each requires a new `.akk` patch file in the nkido repo. The patches should be **sophisticated, not simplistic** — they should demonstrate real musical/technical capability, not just "hello world" snippets.

| # | Slug | Label | Feature Showcase | Description |
|---|------|-------|------------------|-------------|
| 1 | `fm-piano` | FM Synth | FM synthesis, envelopes, polyphony | Electric piano via FM: carrier + 2 modulators at musical ratios, ADSR envelope, chord progression through `poly()`. Should sound like a Rhodes/Wurlitzer approximation. |
| 2 | `wavetable-scan` | Wavetable | Wavetable scanning, modulation | Wavetable synth (`smooch`) with a slowly scanning position modulated by an LFO. Multiple wavetables crossfaded. Shows off the timbral range of wavetable synthesis. |
| 3 | `microtonal-raga` | Microtonal | Microtonal scales, non-12-TET tuning | A raga-like melody using a custom scale (e.g. 22-śruti or 19-TET). Shows `tune()` or equivalent microtonal tuning system with melodic patterns. |
| 4 | `poly-chords` | Polyphony | Chord progressions, poly voice allocator | Full chord progression (jazz voicings: 7ths, 9ths) through `poly()` with a rich instrument (saw + filter + delay). Shows voice stealing and legato behavior. |
| 5 | `drum-machine` | Drums | 808 samples, pattern nesting, mini-notation | Full drum kit pattern using the BPB 808 samples: kick, snare, hihat, clap, toms. Shows pattern nesting (`[]` groups), rests (`~`), probability, and Euclidean rhythms. |
| 6 | `effects-chain` | Effects | Saturation, delay, reverb, chorus, compression | A simple motif run through a full effects chain: tube saturation → ping-pong delay → freeverb → compressor. Shows how effects stack and interact. |
| 7 | `interactive-params` | Interactive | `param()` controls, real-time UI | A patch with 4–6 `param()` controls (cutoff, resonance, LFO rate, delay feedback) that create interactive knobs/sliders in the IDE. Demonstrates live parameter tweaking. |
| 8 | `visualizations` | Visualizations | Spectrum, oscilloscope, pianoroll | A musically interesting patch (arpeggiated chords) with 3 visualization outputs: spectrum analyzer, triggered oscilloscope, and pianoroll grid. Shows the visual feedback system. |
| 9 | `soundfont-play` | SoundFont | SoundFont playback, polyphony | A melody played through the `gm` SoundFont (piano or strings). Shows the SoundFont engine with proper note-on/note-off and polyphonic voice management. |
| 10 | `hello-sine` | Oscillators | Basic oscillators, pipe/hole syntax | The classic: a single sine wave at 440 Hz. Kept as the simplest entry point. Now positioned as the "last" tab — the foundation everything else builds on. |

**Default (first tab): `fm-piano`** — it's the most musically impressive and demonstrates multiple concepts at once (FM, envelopes, polyphony). `hello-sine` is repositioned to tab 10 as the "start from here" foundation.

### 5.1 Patch Authoring Constraints

Each patch must:
- Be self-contained (no external file dependencies beyond built-in samples/SoundFonts)
- Run within the live app's memory constraints
- Produce musically interesting output within the first 2 seconds
- Be ≤ 60 lines of Akkado code (concise enough to read in the IDE)
- Use `bpm` declarations where rhythm is relevant
- Include a brief comment header explaining what the patch demonstrates

### 5.2 Example Patch Index

Each patch gets an entry in `web/static/patches/index.json`:

```json
{
  "fm-piano": {
    "title": "FM Synth",
    "description": "Electric piano via FM synthesis with chord progression",
    "landing": true
  }
}
```

The `"landing": true` flag distinguishes landing-page examples from regular user patches (existing patches like `hello-sine` don't have this flag). The landing-page selector reads only patches with `"landing": true`.

---

## 6. Architecture

### 6.1 Component Structure (website repo)

```
src/lib/components/Home/
├── ExampleSelector.svelte     # NEW: wraps tab bar + poster + iframe
├── ExampleTabs.svelte         # NEW: horizontal tab bar, wraps on mobile
└── LiveEmbed.svelte           # REMOVED: superseded by ExampleSelector
```

### 6.2 ExampleSelector Component

```
┌──────────────────────────────────────────────────────────┐
│  [FM Synth] [Wavetable] [Microtonal] [Polyphony]         │
│  [Drums]    [Effects]   [Interactive] [Visualizations]   │
│  [SoundFont] [Oscillators]                                │
│  ← tabs wrap to multiple centered lines on mobile →       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                  │   │
│  │              FM Synth                            │   │
│  │                                                  │   │
│  │         [ ▶ Click to play ]                      │   │
│  │                                                  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  OR (after activation):                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  iframe: live.nkido.cc/embed?patch=fm-piano      │   │
│  │  (receives postMessage for tab switches)         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 6.3 PostMessage Protocol

**Direction: parent → iframe (patch switch):**
```typescript
{
  type: 'nkido:switch-patch',
  patch: 'fm-piano',       // slug matching patches/index.json
}
```

**Direction: iframe → parent (acknowledgment):**
```typescript
// Success:
{ type: 'nkido:patch-loaded', patch: 'fm-piano' }

// Failure (unknown patch, compile error, etc.):
{ type: 'nkido:patch-error', patch: 'unknown-slug', reason: 'Patch not found' }
```

**Origin validation:** The parent only sends messages to `https://live.nkido.cc` and only accepts messages from that origin. The iframe only accepts messages from `https://nkido.cc` (and `localhost:*` / `*.netlify.app` for dev).

### 6.4 Embed Route Changes (nkido repo)

The `/embed` route on `live.nkido.cc` needs a postMessage listener:

```
web/src/routes/embed/+page.svelte
  ├── Current behavior: loads patch from ?patch=<name> on boot
  └── NEW: add window.addEventListener('message', ...) that:
       1. Validates origin
       2. Parses message for nkido:switch-patch type
       3. Looks up the patch by slug from the patches manifest
       4. Replaces the editor content and re-compiles
       5. Sends back nkido:patch-loaded or nkido:patch-error
```

This is **additive** — the existing `?patch=<name>` URL-param behavior is unchanged. The postMessage handler is layered on top for runtime switching.

### 6.5 URL State

- On tab change (before activation): update URL with `?demo=<slug>` via `URLSearchParams` (no full navigation).
- On page load: read `?demo=<slug>` from the URL and pre-select that tab.
- If `?demo` references an unknown slug: fall back to the default tab (`fm-piano`).
- Default tab (no `?demo` param): `fm-piano`.

### 6.6 Tab Bar Responsive Behavior

- **Desktop (≥ 768px):** single centered row of tabs.
- **Tablet (< 768px):** tabs wrap to 2 centered rows.
- **Mobile (< 480px):** tabs wrap to 3+ centered rows, tab text size slightly reduced.

No horizontal scroll, no dropdown, no "More" button. Tabs are always fully visible.

---

## 7. Impact Assessment

| Component | Status | Notes |
|-----------|--------|-------|
| `src/routes/+page.svelte` | **Modified** | Swap `<LiveEmbed>` for `<ExampleSelector>`. |
| `src/lib/components/Home/LiveEmbed.svelte` | **Removed** | Superseded by `ExampleSelector.svelte`. |
| `src/lib/components/Home/ExampleSelector.svelte` | **New** | Parent component: tab state, poster/iframe toggle, postMessage, URL sync. |
| `src/lib/components/Home/ExampleTabs.svelte` | **New** | Tab bar component with responsive wrapping. |
| `web/static/patches/index.json` (nkido repo) | **Modified** | Add 10 entries with `"landing": true` flag. |
| `web/static/patches/{10-new-patches}.akk` (nkido repo) | **New** | 10 new patch files, authored per §5 constraints. |
| `web/src/routes/embed/+page.svelte` (nkido repo) | **Modified** | Add postMessage listener for `nkido:switch-patch`. |
| `web/src/lib/patches/manifest.ts` (nkido repo) | **Modified** | Export the patches index so the embed route can look up slugs. |

No changes to:
- The main IDE routing or UI
- The existing `?patch=<name>` embed behavior (still works)
- The patches index format (extended with `"landing"` flag, backward-compatible)
- Any other routes on `nkido.cc`

---

## 8. File-Level Changes

### 8.1 nkido.cc repo (this repo)

| File | Change |
|------|--------|
| `src/routes/+page.svelte` | Replace `<LiveEmbed patch="hello-sine" />` with `<ExampleSelector />`. |
| `src/lib/components/Home/LiveEmbed.svelte` | **Deleted.** Superseded. |
| `src/lib/components/Home/ExampleSelector.svelte` | **New.** Orchestrates tabs, poster, iframe, postMessage, URL state. Reads patch metadata from a local manifest (fetched at build time or hardcoded). |
| `src/lib/components/Home/ExampleTabs.svelte` | **New.** Renders the tab bar with responsive CSS wrapping. Accepts `examples: { slug, label }[]` and `active: string` props. Emits `select` event. |
| `src/lib/data/landing-examples.ts` | **New.** Hardcoded manifest of the 10 landing examples (slug, label, description). Mirrors the `index.json` entries from the nkido repo so the website doesn't need a build-time fetch. |

### 8.2 nkido repo (live app)

| File | Change |
|------|--------|
| `web/static/patches/index.json` | Add 10 entries with `"landing": true` flag. Existing entries unchanged. |
| `web/static/patches/fm-piano.akk` | **New.** FM electric piano patch. |
| `web/static/patches/wavetable-scan.akk` | **New.** Wavetable scanning patch. |
| `web/static/patches/microtonal-raga.akk` | **New.** Microtonal raga patch. |
| `web/static/patches/poly-chords.akk` | **New.** Jazz chord progression with poly. |
| `web/static/patches/drum-machine.akk` | **New.** 808 drum pattern. |
| `web/static/patches/effects-chain.akk` | **New.** Full effects chain demo. |
| `web/static/patches/interactive-params.akk` | **New.** Patch with `param()` controls. |
| `web/static/patches/visualizations.akk` | **New.** Patch with visualization outputs. |
| `web/static/patches/soundfont-play.akk` | **New.** SoundFont melody patch. |
| `web/src/routes/embed/+page.svelte` | Add `window.addEventListener('message', ...)` handler for `nkido:switch-patch`. Look up patch from manifest, replace editor content, re-compile, send ack. |
| `web/src/lib/patches/manifest.ts` | Ensure the patches index is exported as a runtime-importable module (may already exist; verify). |

---

## 9. Implementation Phases

### Phase 1 — Patch authoring (nkido repo)

**Goal:** All 10 example patches exist in `web/static/patches/` with `index.json` entries.

- Author each `.akk` file per the constraints in §5.1.
- Add entries to `web/static/patches/index.json` with `"landing": true`.
- Test each patch in the live IDE: loads without errors, produces sound within 2s, sounds musically interesting.

**Verification:** `bun run dev` in the nkido repo; open each patch via `?patch=<slug>` and confirm audio output + no console errors.

### Phase 2 — Embed postMessage handler (nkido repo)

**Goal:** The `/embed` route accepts `nkido:switch-patch` postMessage commands and responds with acks.

- Add message listener in `web/src/routes/embed/+page.svelte`.
- Implement patch lookup, editor content replacement, re-compilation.
- Send `nkido:patch-loaded` on success, `nkido:patch-error` on failure.
- Validate message origins.

**Verification:** Open a scratch HTML page with an iframe pointing to `live.nkido.cc/embed?patch=hello-sine`. Send postMessage from the parent. Confirm the patch switches and the ack is received. Test with an unknown slug to verify the error ack.

### Phase 3 — ExampleSelector component (website repo)

**Goal:** `ExampleSelector.svelte` and `ExampleTabs.svelte` render correctly on the landing page.

- Create `src/lib/data/landing-examples.ts` with the 10-example manifest.
- Build `ExampleTabs.svelte` with responsive CSS wrapping.
- Build `ExampleSelector.svelte`: tab state, poster with example name, click-to-activate iframe, postMessage on tab switch.
- Wire URL param (`?demo=<slug>`) for read (on load) and write (on tab change).
- Replace `<LiveEmbed>` with `<ExampleSelector>` in `+page.svelte`.
- Delete `LiveEmbed.svelte`.

**Verification:** `bun run dev` — landing page shows the tab bar with 10 tabs. Default tab is `fm-piano`. Clicking tabs updates the URL. On mobile, tabs wrap to multiple centered lines. Poster shows the selected example name. Click poster → iframe loads. Click another tab → postMessage switches the patch.

### Phase 4 — Cross-browser testing + polish

**Goal:** Feature works in Chrome, Firefox, Safari on desktop; mobile Chrome/Safari on iOS/Android.

- Test postMessage in Safari (strictest cross-origin policies).
- Verify the 8s fallback still works if the iframe fails to load initially.
- Test with `?demo=unknown-slug` → falls back to default tab.
- Test with `?demo=drum-machine` → correct tab pre-selected.
- Lighthouse perf on `/` stays ≥ 95 (no new heavy assets).

**Verification:** Manual testing matrix. No regression on existing landing page metrics.

---

## 10. Edge Cases

1. **Unknown `?demo=<slug>` on page load** — Fall back to the default tab (`fm-piano`). No error shown; URL is not corrected (keeps the unknown slug so the user sees what they typed).

2. **postMessage arrives before iframe is loaded** — The parent queues the message and sends it once the iframe fires its `load` event. Alternatively: the parent only enables tab switching after the iframe has signalled readiness (via a `nkido:embed-ready` message on boot, or after the first `nkido:patch-loaded` ack).

3. **postMessage origin mismatch** — Both parent and iframe validate the origin of incoming messages. Messages from unexpected origins are silently ignored. In dev, `localhost:*` and `*.netlify.app` are allowed.

4. **Patch switch fails (compile error in the new patch)** — The iframe sends `nkido:patch-error`. The parent reverts to the previously-active tab and shows a brief inline error message ("This example couldn't load"). The poster is NOT re-shown (the iframe is still active).

5. **postMessage not supported (very old browser)** — Graceful degradation: tabs still change the URL and update the poster. Clicking the poster reloads the iframe with the new `?patch=` URL. User sees a full WASM reload but the feature still works.

6. **Iframe 8s timeout during initial load** — Same behavior as current `LiveEmbed`: show the "Open in a new tab →" fallback. Tab bar remains functional; clicking a different tab updates the poster. Clicking the poster retries the iframe load with the new patch.

7. **Tab bar wraps to many lines on very narrow screens** — At extreme widths (e.g. 320px), 10 tabs might wrap to 4 rows. This is acceptable — the tabs are always fully visible and centered. If it becomes a usability issue, future work could introduce a "show fewer tabs" toggle or a carousel.

8. **Rapid tab switching spam** — User clicks through tabs faster than postMessage can process. The parent debounces tab switches: only sends the postMessage for the final selected tab after a short delay (e.g. 150ms), or sends every switch but the iframe processes them sequentially (last one wins).

9. **Embed route on `live.nkido.cc` hasn't been updated yet** — The website's `ExampleSelector` still works: the iframe loads the default patch via URL param, and tab switches fall back to reloading the iframe with the new `?patch=` URL. The postMessage handler is an optimization; the URL-param path is the baseline.

10. **Patches array in `index.json` drifts from landing-examples.ts** — The website's `landing-examples.ts` manifest is a hardcoded copy. If a patch slug changes in the nkido repo, the website must be updated in sync. This is a manual sync point. Future work could fetch the manifest at build time (similar to the docs mirror pipeline).

---

## 11. Testing / Verification Strategy

### 11.1 Automated (website repo)

- **`bun run check`** — type-check, must pass.
- **`bun run build`** — must succeed; no new route regressions.
- **Lighthouse CI** — perf ≥ 95 on `/` (no regression from tab addition).

### 11.2 Automated (nkido repo)

- **`bun run check`** + **`bun run build`** — must pass with new patches.
- **Patch validation script** (new or existing): verify each `.akk` file compiles without errors and `index.json` entries reference existing files.

### 11.3 Manual (cross-repo)

- **PostMessage round-trip test:**
  1. Open `nkido.cc` in browser.
  2. Click poster to activate iframe.
  3. Click each of the 10 tabs in sequence.
  4. Confirm: audio changes for each tab, no console errors, URL updates with `?demo=<slug>`.

- **Shareable link test:**
  1. Navigate to `nkido.cc/?demo=drum-machine`.
  2. Confirm: "Drums" tab is pre-selected, poster shows "Drums".
  3. Click poster → iframe loads the drum patch.

- **Unknown slug test:**
  1. Navigate to `nkido.cc/?demo=does-not-exist`.
  2. Confirm: default tab (`fm-piano`) is selected, no error shown.

- **Mobile tab wrapping test:**
  1. Resize browser to 375px width.
  2. Confirm: tabs wrap to 2+ centered lines, all 10 visible, no horizontal scroll.
  3. Resize to 768px. Confirm: tabs wrap to 2 lines.
  4. Resize to 1024px. Confirm: single row.

- **postMessage fallback test (embed not yet updated):**
  1. Temporarily remove the postMessage handler from the nkido embed route (or test against a staging deploy without the change).
  2. Confirm: tab switches reload the iframe with the new URL. Slower but functional.

- **Safari cross-origin test:**
  1. Open `nkido.cc` in Safari.
  2. Activate iframe, switch tabs.
  3. Confirm: postMessage works (Safari is strictest about COEP/COOP in iframes).

### 11.4 Patch quality review

Each of the 10 new patches should be reviewed for:
- Compiles without errors
- Produces sound within 2 seconds
- Musically interesting (not a trivial 3-line patch)
- ≤ 60 lines of code
- Comment header explains what it demonstrates

---

## 12. Open Questions

1. **Do the existing `hello-sine`, `chord-stab`, `rock-groove`, `stepper-demo` patches get `"landing": true` entries, or are they replaced entirely by the 10 new patches?** The proposal repositions `hello-sine` as tab 10 (Oscillators) with a new, purpose-written patch that's optimized for demonstration. The existing patches could remain as regular user patches without the `landing` flag.

2. **Should the landing-examples manifest in the website repo be fetched at build time from the nkido repo** (similar to the docs mirror pipeline in `prd-launch-hardening.md`), or is a hardcoded `landing-examples.ts` acceptable for launch? Hardcoded is simpler but requires a manual sync when patch metadata changes.

3. **Should the embed route send an `nkido:embed-ready` message on boot** so the parent knows when it's safe to send `switch-patch` commands? This would solve Edge Case 2 definitively but requires one additional message type.

4. **What exact microtonal tuning system should `microtonal-raga.akk` use?** The microtonal PRD is NOT STARTED but the user confirmed the feature is implemented. Need to verify the actual API (is it `tune()`, a custom scale definition, or something else?) before authoring the patch.

5. **Should the postMessage protocol be namespaced under `nkido:`** (as proposed: `nkido:switch-patch`) or use a different convention?** The `nkido:` prefix avoids collisions with other iframes that might be embedded on the page in the future.

---

## 13. Future Work (deferred from this PRD)

1. **Per-example code preview on the poster** — currently the poster only shows the example name. A future pass could show a syntax-highlighted code snippet below the tab bar.
2. **Browser history (back/forward) across tab switches** — currently only the URL param is updated. `history.pushState` per tab change would enable back/forward navigation.
3. **Build-time manifest fetch** — replace the hardcoded `landing-examples.ts` with a build-time fetch from the nkido repo's `patches/index.json`.
4. **Analytics on example popularity** — track which examples visitors select most often.
5. **Automatic rotation / autoplay** — cycle through examples on a timer for kiosk/booth mode.
6. **Additional examples beyond 10** — as nkido gains new features (granular synthesis, vocoder, etc.), new tabs can be added. The tab bar's responsive wrapping handles 12–15 tabs acceptably.
7. **Keyboard navigation** — arrow keys to switch tabs, Enter to activate the poster.

---

## 14. Related Work

- [`prd-project-website.md`](./prd-project-website.md) — v1 PRD; specified the original `LiveEmbed` with single-patch iframe (§4.2, §8).
- [`prd-launch-hardening.md`](./prd-launch-hardening.md) — launch hardening PRD; replaced the dead iframe with a static screenshot (`LandingDemo`). This PRD supersedes that replacement with a live, multi-example embed.
- `web/static/patches/` in the nkido repo — existing patch directory with 4 patches + `index.json`. This PRD extends the same system.
- `web/src/routes/embed/+page.svelte` in the nkido repo — existing embed route. This PRD adds postMessage handling to it.
