# PRD: Landing Page Overview Grid v2 — Frontmatter-Driven

> **Status: NOT STARTED** — Supersedes v1 (`prd-landing-overview-grid.md`, status: Complete). Refactors the shipped grid in place: same component path, rewritten internals. Builds on v1 Phase 1's upstream doc work (visualizations split into 5 pages, 7 other new pages) as a baseline; no further upstream file splits.
>
> **What changes vs v1:** ~80–110 sub-feature cards instead of 36 doc-level cards; named sub-groups inside each top-level group (e.g. Effects → Frequency / Time-based / Nonlinear / Dynamics); per-card code-snippet preview replaces broken keyword chips; structure declared by enriched upstream frontmatter (single source of truth) rather than hardcoded `GROUP_MAPPING` + heuristic keyword↔heading matching.
>
> **Why:** v1's `GROUP_MAPPING` lumps unrelated docs into broad rows (Effects has 7 docs covering filtering, time-based effects, distortion, and dynamics in one undifferentiated list), and v1's chip resolution is brittle — Distortion has 19 keywords but only 9 markdown headings, so ~10 chips drop silently per card. The chips that survive feel arbitrary because the keyword↔heading match is a coincidence, not a design.

---

## 1. Executive Summary

The shipped OverviewGrid renders 36 cards across 6 top-level groups. Each card is a mirrored doc page; each card carries up to 5 tag chips that try to deep-link into the doc by matching `keywords[]` from frontmatter against extracted markdown headings via `github-slugger`. In practice the chip resolution is unreliable and the grouping is too coarse for visitors to use as navigation.

This PRD rebuilds the grid around three changes:

1. **One card per sub-feature**, not per doc. Distortion becomes 9 cards (saturate, softclip, bitcrush, fold, tube, smooth, tape, xfmr, excite). Filters becomes 5 (lp, hp, bp, moog, sallen-key). Total card count grows to ~80–110 in steady state.
2. **Named sub-groups inside the existing 6 top-level groups.** Effects → Frequency / Time-based / Nonlinear / Dynamics. Tools → Math / State & I/O / Audio plumbing. Sub-group label is declared per-doc in upstream frontmatter; multiple docs can share a sub-group.
3. **Code-snippet previews replace tag chips.** Each card carries an optional one-line nkido sample (e.g. `saw 110 -> moog .8 .3`). Snippets are authored in upstream frontmatter alongside each sub-feature; if absent, the card simply renders without one. No keyword↔heading matching anywhere.

Discovery is driven by a sticky row of filter pills (`All · Instruments · Effects · …`) and collapsible sub-group headings; on mobile, sub-groups collapse closed by default. Cards link to anchors inside their parent doc (`/docs/reference/builtins/distortion#saturate`); no further upstream file splits beyond what v1 shipped.

**Key decisions made during planning:**

- **Source of truth: enriched upstream frontmatter.** New fields per `.md`: `group`, `subgroup`, `icon`, `tagline`, and `subfeatures[]` with `{name, anchor, tagline, snippet?, icon?}`. No website-side override file. The existing `gray-matter` parsing in `fetch-mirrored-docs.ts` is extended (not introduced) to persist these fields to the manifest.
- **Refactor in place.** The same files (`scripts/build-overview.ts`, `src/lib/components/Home/OverviewGrid.svelte`, `src/lib/components/Home/OverviewCard.svelte`, `src/lib/data/overview.json`) are rewritten. v1 is not preserved behind a feature flag; on merge, v2 is the only path.
- **Atomic docs render as a single card.** Docs without `subfeatures:` (pipes, variables, oscilloscope, …) emit one card using the doc-level `tagline` and `icon`. Same card UI as a sub-feature; the renderer doesn't distinguish.
- **No parent overview cards.** A doc with sub-features emits only its sub-feature cards; the sub-group heading provides the parent context. Avoids redundant "Filters" cards above lp/hp/bp/moog/sallen-key.
- **Math is sub-grouped, not exploded.** Math becomes a sub-group of Tools containing function-family cards (Arithmetic, Trigonometry, Hyperbolic, Range, Rounding) — not 63 individual function cards. The frontmatter `subfeatures:` array on `math.md` declares each family with an anchor into the `## Arithmetic`/`## Trigonometry` headings.
- **Tolerant build.** Missing required frontmatter logs a warning and skips the doc; build succeeds. Mismatched anchors log a warning and ship the card anyway. Anchor verification compares `subfeatures[].anchor` against each doc's existing `headings[]` field (already populated by v1's heading-extraction pass).
- **Filter pills hide, not dim.** Single-select; clicking `Effects` hides every other top-level group. Clicking `All` resets. Hidden cards don't stay laid out faintly; they're removed from the DOM tree (or visually-collapsed sections, see §6.4).

---

## 2. Current State (v1)

| Surface | v1 (today) | v2 (this PRD) |
|---|---|---|
| Card unit | 1 card per mirrored doc — 36 total | 1 card per sub-feature — ~80–110 total |
| Top-level grouping | 6 groups (Instruments / Effects / Sequencing / Visualizations / Language / Tools) | Same 6 groups, **with** named sub-groups inside |
| Sub-grouping | None | E.g. Effects → Frequency / Time-based / Nonlinear / Dynamics |
| Chips/tags | Up to 5 tag chips per card; resolved via `github-slugger.slug(keyword) === heading` lookup | None. Replaced by an optional code snippet per card |
| Card → link target | Top of doc (or anchor for chips) | Always an anchor: `/docs/reference/builtins/<slug>#<subfeature.anchor>` |
| Source of structure | Hardcoded `GROUP_MAPPING` (36 rows) + `ICON_MAP` in `scripts/build-overview.ts` | Per-doc upstream frontmatter — `group`, `subgroup`, `icon`, `tagline`, `subfeatures[]` |
| Discovery UX | Sectioned scroll; mobile-collapsible top-level groups | Filter pills (single-select, hide non-matches) + collapsible sub-groups |
| Build behavior on missing data | Warn-and-skip card; warn-and-skip chip | Warn-and-skip doc; warn-and-keep card on anchor mismatch |
| Upstream `.md` files | 42 mirrored entries (post Phase 1) | Same set; no further splits or new files |

### 2.1 What's broken about v1

**Distortion's chip resolution is the canonical case.** `distortion.md` declares 19 keywords (`distortion, saturate, softclip, bitcrush, fold, wavefold, drive, crush, lofi, tube, valve, smooth, adaa, tape, warmth, xfmr, transformer, excite, exciter, harmonics`). Its markdown body has 9 H2 headings (`saturate, softclip, bitcrush, fold, tube, smooth, tape, xfmr, excite`). The chip resolution rule is `github-slugger.slug(keyword) ∈ headings[]`, so:

- `saturate, softclip, bitcrush, fold, tube, smooth, tape, xfmr, excite` resolve → ✓
- `distortion, wavefold, drive, crush, lofi, valve, adaa, warmth, transformer, exciter, harmonics` don't → silently dropped, logs a warning each

Of the first 5 chips picked from the keywords array, some random subset ends up rendered. The chips that *do* render link correctly, but the chip *set* is a function of which order keywords were authored in, not what's most useful to a visitor.

**The Effects group is too coarse.** v1's Effects row contains filters / envelopes / delays / reverbs / modulation / distortion / dynamics — all in one ~7-card section. A visitor scanning for "what does nkido do for distortion?" sees one tile (the Distortion card) with chips that may or may not represent that doc's contents. There's no way to scan by sub-domain (frequency-domain effects vs nonlinear vs dynamics) because the layout doesn't expose that structure.

**Upstream docs lack semantic metadata.** `gray-matter`-parsed frontmatter on each `.md` carries `title, description, order, keywords[]`. There's no `group`, `subgroup`, `tagline`, or sub-feature breakdown. Adding a richer grid means either (a) inferring more structure from markdown headings (tried in v1; brittle), or (b) curating it website-side in a hand-maintained TS file (decouples upstream from the surface that depends on it). v2 picks neither: it adds the metadata to upstream frontmatter where the doc author has the most context.

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. **Reorganize the grid around sub-feature cards.** Each card represents a meaningful concept (one filter type, one distortion mode, one math family), not necessarily one whole doc.
2. **Add named sub-groups under each top-level group.** Sub-group label per doc, declared in upstream frontmatter. Effects → Frequency / Time-based / Nonlinear / Dynamics is the canonical example.
3. **Replace tag chips with optional code-snippet preview.** Per-card one-line nkido sample, syntax-highlighted to match the rest of the site.
4. **Drive everything from upstream frontmatter.** Add `group`, `subgroup`, `icon`, `tagline`, `subfeatures[]` fields. No website-side override file. v1's `GROUP_MAPPING` and chip resolver are removed.
5. **Filter pills + collapsible sub-groups** for discovery on a page that now has ~80–110 cards.
6. **Tolerant build.** Missing required frontmatter on a mirrored doc logs a warning and is skipped; mismatched anchors log a warning and ship the card; build never fails on grid drift.
7. **Refactor v1 in place.** Same file paths, rewritten internals. No feature flag, no v1/v2 coexistence.

### 3.2 Non-Goals (deferred to future work)

1. **Splitting more upstream `.md` files into separate pages.** v1 already split `visualizations.md` into 5 pages and added 7 more docs. v2 keeps the file layout exactly as Phase 1 left it. Cards link to anchors within shared parent docs.
2. **Search input on the grid itself.** The filter pills handle group-level narrowing; full-text search remains in the global header (Pagefind, unchanged).
3. **Per-card analytics.** Click tracking is out of scope; revisit only if there's evidence the grid needs prioritization tuning.
4. **Hand-curated website-side overrides.** All structure lives in upstream frontmatter. A future PRD can introduce overrides if cross-cutting concepts ever need to span multiple docs.
5. **Replacing or absorbing `FeatureGrid`.** The 9-card marketing FeatureGrid stays where it is, above `RunsEverywhere`. The two grids serve different jobs.
6. **Versioned docs.** The mirror still always points at upstream `master`.
7. **Restoring v1 behind a flag.** v1 is replaced; the legacy `GROUP_MAPPING` and `ICON_MAP` constants are deleted.
8. **Animated transitions on filter-pill click beyond a basic CSS opacity/visibility transition.**

---

## 4. Target Experience

A first-time visitor lands on `nkido.cc/`:

1. Hero → ExampleSelector → FeatureGrid → RunsEverywhere → **OverviewGrid (v2)**.
2. Section heading: **"What's in the box"** with a 1-line intro. Below the intro: a sticky pill row.

   ```
   [ All  |  Instruments  |  Effects  |  Sequencing  |  Visualizations  |  Language  |  Tools ]
   ```

3. By default `All` is active. Six top-level groups stack vertically. Each top-level group has named sub-group sections inside.
4. Within each sub-group, a responsive card grid (3–4 columns at desktop) shows individual sub-feature cards. Example, scrolled into the Effects group:

   ```
   ─── Effects ───────────────────────────────────────────────────
     ▾ Frequency
       [Lowpass] [Highpass] [Bandpass] [Moog] [Sallen-Key]
       [Envelope] [ADSR] …

     ▾ Time-based
       [Stereo Delay] [Ping-pong] [Plate] [Hall] [Chorus]
       [Flanger] [Phaser] [Comb] …

     ▾ Nonlinear
       [Saturate] [Softclip] [Bitcrush] [Fold] [Tube]
       [Smooth] [Tape] [XFMR] [Excite]

     ▾ Dynamics
       [Compressor] [Limiter] …
   ```

5. Each card shows:
   - A 24px Lucide icon (per-doc default; per-sub-feature override allowed).
   - The sub-feature name (`Saturate`).
   - A 1-line tagline (`Tape-style saturation`).
   - An optional one-line snippet in a syntax-highlighted code chip (`saw 110 -> saturate .5`).
6. Visitor clicks the card → navigates to `/docs/reference/builtins/distortion#saturate`. The page scrolls to the `## saturate` heading.
7. Visitor clicks the `Effects` filter pill → top-level groups other than Effects collapse out of the layout. The pill row stays sticky so they can switch back.
8. Below the last group, a footer CTA: **"View full reference →"** linking to `/docs/reference`.

On mobile (<768px):

- Pill row is horizontally scrollable (no wrapping).
- Top-level groups always render their heading; sub-group sections are **collapsed by default**.
- Tapping a sub-group heading expands it; chevron rotates.
- Card grid drops to 1 column.

If frontmatter is missing on a mirrored doc:

- The doc is omitted from `overview.json` entirely; a build warning is logged.
- The page still renders successfully — visitors see fewer cards rather than known-broken sections.
- Once the doc's frontmatter lands upstream, the next mirror fetch + build picks it up automatically.

### 4.1 Card Anatomy

```
┌──────────────────────────────────────┐
│  [Zap]                               │
│                                      │
│  Saturate                            │
│  Tape-style saturation               │
│                                      │
│  ┌────────────────────────────────┐  │
│  │ saw 110 -> saturate .5         │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

- **Icon**: 24px Lucide. Resolution order: `subfeature.icon` → doc `icon` → `Box` (fallback when neither set).
- **Title**: `<a>` linking to `${doc.url}#${subfeature.anchor}`. Same-tab navigation.
- **Tagline**: 1-line `subfeature.tagline`, or doc `tagline` for atomic docs. CSS `-webkit-line-clamp: 2` for ≤240 char descriptions; harder cap above that.
- **Snippet**: Optional. Rendered in a `<code>` block; syntax highlighting reuses the site's existing highlighter. If absent, the snippet block is omitted (card is shorter; layout uses CSS grid `align-items: stretch` so neighbouring cards don't visually deform).

---

## 5. Group + Sub-Group Structure

### 5.1 Top-Level Groups (unchanged from v1)

| Group | Heading | Intent |
|---|---|---|
| 1 | **Instruments** | Sound sources |
| 2 | **Effects** | Signal processors |
| 3 | **Sequencing** | Time, patterns, voice allocation |
| 4 | **Visualizations** | Inline editor visualizers |
| 5 | **Language** | Akkado syntax & data structures |
| 6 | **Tools** | Math, state, plumbing |

Top-level group order is fixed in the build script (drives the pill row order). Within a top-level group, sub-groups appear in the order their first contributing doc declares them (ties broken by doc `order`).

### 5.2 Intended Sub-Groups

Sub-group taxonomy is declared per-doc via the `subgroup:` frontmatter field. The intended starting layout:

| Group | Sub-groups | Contributing docs |
|---|---|---|
| Instruments | **Synthesis** · **Sample-based** | oscillators, fm-synthesis (Synthesis); samplers, soundfonts, samples-loading (Sample-based) |
| Effects | **Frequency** · **Time-based** · **Nonlinear** · **Dynamics** | filters, envelopes (Frequency); delays, reverbs, modulation (Time-based); distortion (Nonlinear); dynamics (Dynamics) |
| Sequencing | _Phase 1 author decision_ — proposal: **Patterns** · **Voicing** · **Timing** | mini-notation/basics, mini-notation/microtonal, mini-notation/chords, builtins/sequencing, builtins/polyphony, builtins/timelines |
| Visualizations | _flat — no sub-groups_ | oscilloscope, waveform, spectrum, pianoroll, waterfall |
| Language | **Syntax** · **Data** | pipes, variables, operators, conditionals, closures (Syntax); arrays, methods (Data) |
| Tools | **Math** · **State & I/O** · **Audio plumbing** | math (Math); state, edge, audio-input (State & I/O); utility, stereo (Audio plumbing) |

The Sequencing sub-grouping is a deliberate **[OPEN QUESTION]** — see §13. The upstream author lands on the final taxonomy when authoring frontmatter in Phase 1; the website doesn't need to know in advance.

### 5.3 Card Population

Cards within a sub-group come from `subfeatures[]` arrays in each contributing doc's frontmatter, concatenated in doc-`order` order, with within-doc array order preserved. A doc with no `subfeatures:` field contributes a single card (atomic-doc rendering).

A doc whose `group:` or `subgroup:` field is missing or unrecognised is skipped entirely with a warning. A `subfeature` whose `anchor:` doesn't match any heading in the doc's `headings[]` is logged but still rendered (the URL may 404-anchor; the visitor still lands on the doc top).

---

## 6. Architecture

### 6.1 Component & Script Layout (website repo)

```
src/lib/components/Home/
├── OverviewGrid.svelte      # REWRITTEN: filter pills, two-level nesting, collapsible sub-groups
└── OverviewCard.svelte      # REWRITTEN: icon, title, tagline, optional snippet

src/lib/data/
├── docs-manifest.json       # MODIFIED: per-entry adds group, subgroup, icon, tagline, subfeatures[]
└── overview.json            # REGENERATED: new shape — groups → subgroups → cards

scripts/
├── fetch-mirrored-docs.ts   # MODIFIED: persist new frontmatter fields to manifest
├── mirror-index.ts          # UNCHANGED
├── validate-frontmatter.ts  # MODIFIED: optionally check group/subgroup/subfeatures shape
└── build-overview.ts        # REWRITTEN: read enriched manifest, no GROUP_MAPPING, anchor verification
```

`scripts/build-overview.test.ts` and `OverviewGrid.test.ts` (with snapshots) are rewritten alongside their subjects.

### 6.2 Layout (ASCII)

```
┌──────────────────────────────────────────────────────────────────────┐
│   What's in the box                                                  │
│   Every instrument, effect, and tool — straight to its docs.         │
│                                                                      │
│  ┌─[ All ]─[ Instruments ]─[ Effects ]─[ Sequencing ]─[…]─┐ (sticky) │
│                                                                      │
│   ── Effects ─────────────────────────────────────────────────────   │
│     ▾ Frequency                                                      │
│       ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│       │ Lowpass │ │ Highpass│ │ Bandpass│ │  Moog   │   …            │
│       └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                      │
│     ▾ Nonlinear                                                      │
│       ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│       │ Saturate│ │ Softclip│ │ Bitcrush│ │  Fold   │   …            │
│       └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
│                                                                      │
│   …                                                                  │
│                                                                      │
│              View full reference →                                   │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.3 Data Shape

`overview.json` (regenerated):

```typescript
type OverviewGroupId =
  | 'instruments' | 'effects' | 'sequencing'
  | 'visualizations' | 'language' | 'tools';

type Overview = {
  generatedAt: string;
  groups: OverviewGroup[];
};

type OverviewGroup = {
  id: OverviewGroupId;
  heading: string;                  // 'Effects'
  subgroups: OverviewSubgroup[];    // in display order
};

type OverviewSubgroup = {
  id: string;                       // 'frequency'
  heading: string;                  // 'Frequency'
  cards: OverviewCard[];
};

type OverviewCard = {
  name: string;                     // 'Saturate' or 'Filters' (atomic)
  tagline: string;                  // 'Tape-style saturation'
  url: string;                      // '/docs/reference/builtins/distortion#saturate'
  icon: string;                     // Lucide name; 'Box' if unknown
  snippet?: string;                 // 'saw 110 -> saturate .5' or undefined
  source: {                         // for debugging only
    docSlug: string;                // 'distortion'
    docCategory: string;            // 'reference/builtins'
    anchor?: string;                // 'saturate'; absent for atomic docs
    anchorMatched: boolean;         // true if found in doc headings[]
  };
};
```

`OverviewGrid.svelte` imports `overview.json` directly:

```svelte
<script lang="ts">
  import overview from '$lib/data/overview.json';
  import OverviewCard from './OverviewCard.svelte';

  let activeFilter = $state<OverviewGroupId | 'all'>('all');
  let openSubgroups = $state<Record<string, boolean>>({});
</script>
```

### 6.4 Build-Overview Algorithm

`scripts/build-overview.ts`:

```
1. Read src/lib/data/docs-manifest.json.
2. For each manifest entry across all categories:
     a. Skip entries lacking `group` (warn).
     b. Skip entries whose `group` is not in the 6-group list (warn).
     c. If `subfeatures` is empty/absent and the doc has a tagline → atomic card path.
        Emit one OverviewCard with name=title, tagline=doc.tagline, anchor=undefined.
     d. If `subfeatures` is non-empty → for each subfeature:
        - Verify subfeature.anchor against entry.headings[]; warn on mismatch.
        - Resolve icon: subfeature.icon ?? entry.icon ?? 'Box'.
        - Emit OverviewCard with url = `${entry.url}#${subfeature.anchor}`.
3. Group cards into a tree: groups → subgroups → cards.
   - Subgroup order: first contributing doc's order within the top-level group.
   - Within-subgroup card order: doc order ascending, then subfeature array order.
4. Validate icon names against an allowlist sourced from lucide-svelte's exports.
   Unknown icons fall back to 'Box' with a warning.
5. Emit warnings to stderr; never exit non-zero. Write overview.json.
```

The script is invoked from `fetch-mirrored-docs.ts` at the end of `main()`, after `writeManifest`, so the two artifacts stay in sync. Exposed as `buildOverview()` plus a CLI entrypoint for local iteration (`bun run build:overview`).

### 6.5 Manifest Extension

`fetch-mirrored-docs.ts` already parses frontmatter via `gray-matter` and persists `title, description, order, keywords, headings`. Three changes:

1. Read the new fields off `data` if present: `data.group`, `data.subgroup`, `data.icon`, `data.tagline`, `data.subfeatures` (validated as an array of `{name, anchor, tagline, snippet?, icon?}`).
2. Persist them on the `MirrorResult` and into `manifest.entries[...].`. Existing fields are unchanged.
3. Drop the v1 `referenceKeyword` heuristic — no consumer remains after `build-overview.ts` is rewritten.

The output `.md` frontmatter that `DocPage` consumes is **not** changed for the user-facing fields (title, description, slug, etc.). The new fields are read but not echoed back to the rendered `.md`'s frontmatter; they exist only in the manifest and `overview.json`.

### 6.6 Filter Pills

```svelte
<div class="pill-row" role="tablist">
  <button
    role="tab"
    aria-pressed={activeFilter === 'all'}
    class:active={activeFilter === 'all'}
    onclick={() => activeFilter = 'all'}>All</button>
  {#each groups as g}
    <button
      role="tab"
      aria-pressed={activeFilter === g.id}
      class:active={activeFilter === g.id}
      onclick={() => activeFilter = g.id}>{g.heading}</button>
  {/each}
</div>

{#each groups as g}
  <section class="group" hidden={activeFilter !== 'all' && activeFilter !== g.id}>
    …
  </section>
{/each}
```

Single-select. Hidden groups use the HTML `hidden` attribute (removes them from accessibility tree and visual layout). The pill row uses `position: sticky; top: 0;` with a translucent backdrop on scroll.

Keyboard: pills are reachable via Tab; Left/Right arrows move focus across pills; Enter/Space activates. `aria-pressed` reflects active state for screen readers.

### 6.7 Sub-Group Collapse (Mobile)

CSS-driven, mirrors v1's pattern so SSR and hydration stay in sync without per-viewport JS state:

```css
/* Desktop: all sub-groups open. */
.subgroup .cards { display: grid; }

@media (max-width: 768px) {
  .subgroup .cards                    { display: none; }
  .subgroup[data-open='true'] .cards  { display: grid; }
}
```

`openSubgroups` tracks user toggles; the desktop-vs-mobile default comes from the stylesheet. A `prefers-reduced-motion` check disables chevron rotation.

---

## 7. Impact Assessment

| Component | Status | Notes |
|---|---|---|
| `src/routes/+page.svelte` | **Stays** | `<OverviewGrid />` already mounted after `<RunsEverywhere />`. |
| `src/lib/components/Home/Hero.svelte` | **Stays** | No change. |
| `src/lib/components/Home/ExampleSelector.svelte` | **Stays** | No change. |
| `src/lib/components/Home/FeatureGrid.svelte` | **Stays** | No change — additive. |
| `src/lib/components/Home/RunsEverywhere.svelte` | **Stays** | No change. |
| `src/lib/components/Home/OverviewGrid.svelte` | **Rewritten** | Filter pills, two-level group nesting, collapsible sub-groups, sticky pill bar. |
| `src/lib/components/Home/OverviewCard.svelte` | **Rewritten** | Tagline + optional snippet replaces chip list. |
| `src/lib/components/Home/__snapshots__` | **Regenerated** | Vitest snapshots update against the new fixture. |
| `src/lib/components/Home/OverviewGrid.test.ts` | **Modified** | Updated fixture + assertions. |
| `src/lib/data/overview.json` | **Regenerated** | New shape (groups → subgroups → cards). |
| `src/lib/data/docs-manifest.json` | **Modified** | Per-entry adds `group`, `subgroup`, `icon`, `tagline`, `subfeatures[]`. Existing fields preserved. |
| `scripts/build-overview.ts` | **Rewritten** | `GROUP_MAPPING` + `ICON_MAP` deleted; reads new frontmatter; anchor verification. |
| `scripts/build-overview.test.ts` | **Rewritten** | Tests cover new shape and edge cases (atomic docs, missing subgroup, anchor mismatch, unknown icon). |
| `scripts/fetch-mirrored-docs.ts` | **Modified** | Persist new frontmatter fields to manifest. Existing flow unchanged. |
| `scripts/validate-frontmatter.ts` | **Modified** | Optional shape check for `group`/`subgroup`/`subfeatures` once Phase 1 is done. |
| `scripts/mirror-index.ts` | **Stays** | No new entries. |
| `package.json` | **Stays** | No new deps; `build:overview` script already exists. |
| `static/_mirror-fallback/**/*.md` | **Modified** | Updated alongside upstream (frontmatter changes only). |
| `web/static/docs/reference/**/*.md` (nkido repo) | **Modified** | ~36 files gain new frontmatter fields. No body changes. |
| `docs/prd-landing-overview-grid.md` (this repo) | **Stays** | Historical record of v1. Not edited. |

No changes to:
- Header / Footer / Layout.
- `/docs` route layout or per-doc rendering (DocPage).
- The `ExampleSelector` or its underlying patches.
- Pagefind index configuration.
- The CI Lighthouse budget.

---

## 8. File-Level Changes

### 8.1 nkido.cc repo (this repo)

| File | Change |
|------|--------|
| `src/lib/components/Home/OverviewGrid.svelte` | **Rewritten.** Reads new `overview.json` shape. Renders sticky filter pill row, then 6 top-level group sections, each containing sub-group sections, each containing cards. State: `activeFilter` (`'all' \| OverviewGroupId`), `openSubgroups: Record<subgroupId, boolean>`. CSS-driven sub-group collapse on mobile. Sticky pill row. Footer CTA `View full reference →`. |
| `src/lib/components/Home/OverviewCard.svelte` | **Rewritten.** Props: `card: OverviewCard`. Renders icon (Lucide via `<svelte:component this={iconMap[card.icon]} />`, fallback `Box`), `<a>` title, tagline, optional snippet block. No chip list. The `<a>`'s `href` is `card.url`. |
| `src/lib/components/Home/OverviewGrid.test.ts` | **Modified.** New fixture covering: 3 groups × 2 subgroups × mixed (sub-feature + atomic) cards; one card with snippet, one without; one card with custom icon, one with default. Snapshot regenerated. |
| `src/lib/data/overview.json` | **Regenerated.** New shape per §6.3. Built artifact, checked into git. |
| `src/lib/data/docs-manifest.json` | **Modified.** Each entry gains optional fields: `group`, `subgroup`, `icon`, `tagline`, `subfeatures: { name, anchor, tagline, snippet?, icon? }[]`. Pre-existing fields unchanged. |
| `scripts/build-overview.ts` | **Rewritten.** Algorithm per §6.4. Reads enriched manifest. No `GROUP_MAPPING`. Validates icon names against `lucide-svelte` exports. Verifies subfeature anchors against `headings[]`. Emits warnings; exits 0. |
| `scripts/build-overview.test.ts` | **Rewritten.** Cases per §11.2. |
| `scripts/fetch-mirrored-docs.ts` | **Modified.** Two changes: (1) extend `MirrorResult` and the writer to persist `group`, `subgroup`, `icon`, `tagline`, `subfeatures` from frontmatter into the manifest; (2) drop the v1 `referenceKeyword` field on the rendered `.md`'s frontmatter (no consumer left). Heading extraction unchanged. |
| `scripts/validate-frontmatter.ts` | **Modified.** Optional shape check for new fields once Phase 1 is complete. Initially advisory (warn), promotable to required after upstream migration is done. |
| `static/_mirror-fallback/web/static/docs/reference/**/*.md` | **Modified.** Fallbacks regenerated alongside upstream changes. Body content unchanged; only frontmatter shape evolves. |
| `package.json` | **Stays.** No deps added. `bun run build:overview` already exists. |

### 8.2 nkido repo (upstream)

| File | Change |
|------|--------|
| `web/static/docs/reference/builtins/{filters,envelopes,delays,reverbs,modulation,distortion,dynamics}.md` | **Modified.** Add `group: effects`, `subgroup: <frequency\|time-based\|nonlinear\|dynamics>`, `icon: <Lucide>`, `tagline:`, `subfeatures: [...]`. Body unchanged. |
| `web/static/docs/reference/builtins/{oscillators,fm-synthesis,samplers,soundfonts,samples-loading}.md` | **Modified.** Add `group: instruments`, `subgroup: <synthesis\|sample-based>`, `icon`, `tagline`, `subfeatures`. |
| `web/static/docs/reference/builtins/{sequencing,polyphony,timelines}.md` | **Modified.** Add `group: sequencing`, `subgroup: <author decision>`, `icon`, `tagline`, `subfeatures`. |
| `web/static/docs/reference/mini-notation/{basics,microtonal,chords}.md` | **Modified.** Add `group: sequencing`, `subgroup`, `icon`, `tagline`, `subfeatures`. |
| `web/static/docs/reference/builtins/{oscilloscope,waveform,spectrum,pianoroll,waterfall,visualizations}.md` | **Modified.** Add `group: visualizations`, no `subgroup` (flat), `icon`, `tagline`. Atomic doc rendering — no `subfeatures`. (`visualizations.md` is the section overview; if Phase 1 left it as-is, it can carry frontmatter that points it at the same flat row, or it can be excluded with `group:` omitted to suppress its card.) |
| `web/static/docs/reference/language/{pipes,variables,operators,closures,arrays,methods,conditionals}.md` | **Modified.** Add `group: language`, `subgroup: <syntax\|data>`, `icon`, `tagline`. Atomic — no `subfeatures` for any of these. |
| `web/static/docs/reference/builtins/{math,utility,state,edge,stereo,audio-input}.md` | **Modified.** Add `group: tools`, `subgroup`, `icon`, `tagline`, `subfeatures` (math only — function families). The others are atomic. |

No `.md` body content changes. No new files. No file renames or deletions.

### 8.3 Frontmatter Schema (full reference)

```yaml
---
# Existing v1 fields (unchanged)
title: Distortion
description: Nonlinear shaping for warmth, grit, and color.
category: builtins
order: 6
keywords: [distortion, saturate, softclip, bitcrush, fold, ...]

# New v2 fields (all optional except group/subgroup if grid presence is desired)
group: effects                       # one of: instruments | effects | sequencing | visualizations | language | tools
subgroup: nonlinear                  # free string; multiple docs can share. Omit for flat groups (visualizations).
icon: Zap                            # Lucide-svelte component name; default for all subfeatures unless overridden
tagline: Soft to extreme nonlinearity # used for atomic-doc rendering only

subfeatures:                         # if absent → atomic doc renders as 1 card using doc-level tagline/icon
  - name: Saturate
    anchor: saturate                 # must match a markdown heading slug; warning if not
    tagline: Tape-style saturation
    snippet: saw 110 -> saturate .5  # optional; renders without if absent
  - name: Bitcrush
    anchor: bitcrush
    tagline: 8-bit lo-fi color
    snippet: noise -> bitcrush 4 .25
    icon: Binary                     # optional override
  - name: Tube
    anchor: tube
    tagline: Valve warmth
    icon: Cylinder                   # optional override; no snippet
---
```

**Field reference:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `group` | enum | Yes (to appear in grid) | One of 6 group IDs. Missing → doc skipped. |
| `subgroup` | string | No | If absent and the group has sub-groups, doc still skipped. If group is flat (visualizations), absent is normal. |
| `icon` | string | No | Lucide name. Fallback `Box`. |
| `tagline` | string | Required for atomic docs | 1-line description. ≤120 chars recommended. |
| `subfeatures` | array | No | If present and non-empty → sub-feature card path. Otherwise atomic. |
| `subfeatures[].name` | string | Yes | Card title. |
| `subfeatures[].anchor` | string | Yes | Slug matching a `## heading`. |
| `subfeatures[].tagline` | string | Yes | 1-line description for the sub-feature. |
| `subfeatures[].snippet` | string | No | One-line nkido sample. ≤80 chars recommended. |
| `subfeatures[].icon` | string | No | Lucide name override. Falls back to doc `icon`, then `Box`. |

Atomic-doc example (pipes.md):

```yaml
---
title: Pipes
group: language
subgroup: syntax
icon: Plug
tagline: Forward composition with `->` and `|>`
# no subfeatures: → renders as single card
---
```

---

## 9. Implementation Phases

### Phase 1 — Frontmatter enrichment (upstream nkido repo)

**Goal:** Every mirrored doc carries `group`, `subgroup` (where applicable), `icon`, `tagline`, and `subfeatures` (where applicable).

1. Author the frontmatter additions per §8.2. Group docs by top-level group and submit waves: Instruments → Effects → Sequencing → Visualizations → Language → Tools.
2. For docs that split into sub-features (filters, envelopes, delays, reverbs, modulation, distortion, dynamics, math, sequencing, polyphony, timelines, mini-notation/basics, mini-notation/chords): author `subfeatures[]` with one entry per `## heading` that's worth surfacing as a card. Anchors must match heading slugs (verify with `github-slugger`).
3. For atomic docs (pipes, variables, operators, closures, conditionals, arrays, methods, oscilloscope, waveform, spectrum, pianoroll, waterfall, state, edge, audio-input, utility, stereo, samples-loading, fm-synthesis, samplers, soundfonts): author `tagline` only.
4. Author `snippet` for sub-feature cards where a one-liner is meaningful (most builtins). Skip for sub-features where a one-liner would be artificial (most language constructs).
5. Run `bun run build:docs` upstream to regenerate `web/src/lib/docs/manifest.ts` (no schema change at upstream — the new fields are passthrough metadata).
6. Verify each mirrored doc still renders in the IDE's docs viewer (F1 lookup) without errors.

**Verification:**

- `bun run check` and `bun run build` succeed in nkido.
- F1 lookup for each existing slug still resolves to the same `.md`.
- Frontmatter passes a YAML lint.
- The new fields can be loaded into a TS object via the existing `gray-matter` parser without mutation.

### Phase 2 — Manifest extension (this repo)

**Goal:** `docs-manifest.json` exposes new per-entry fields for the build script to consume.

1. Modify `scripts/fetch-mirrored-docs.ts` to read and persist `group`, `subgroup`, `icon`, `tagline`, `subfeatures` per entry.
2. Drop the `referenceKeyword` field that v1 added to rendered `.md` frontmatter — no consumer remains after Phase 3.
3. Run `bun run scripts/fetch-mirrored-docs.ts` (also invoked transitively by `bun run predev` / `bun run prebuild`) and inspect the manifest output.
4. Commit regenerated `_mirror-fallback/...` files (frontmatter-only changes).

**Verification:**

- `src/lib/data/docs-manifest.json` shows the new fields populated for every entry where Phase 1 added them.
- `bun run check` succeeds.
- Existing chip resolution in v1 still works (Phase 2 doesn't touch `build-overview.ts` yet).

### Phase 3 — Build script + components rewrite (this repo)

**Goal:** v2 grid renders correctly on the landing page with sub-features, sub-groups, snippets, filter pills, and collapsible sub-groups.

1. Rewrite `scripts/build-overview.ts` per §6.4. Delete `GROUP_MAPPING` and `ICON_MAP`. Implement sub-feature card emission, anchor verification, icon fallback.
2. Rewrite `scripts/build-overview.test.ts` per §11.2.
3. Run `bun run build:overview` (or transitively via `fetch-mirrored-docs.ts`) and inspect `overview.json`. Verify ~80–110 cards, correct sub-group ordering.
4. Rewrite `OverviewCard.svelte` per §4.1.
5. Rewrite `OverviewGrid.svelte` per §6.2 + §6.6 + §6.7. Filter pills, collapsible sub-groups, sticky pill row, footer CTA.
6. Rewrite `OverviewGrid.test.ts` snapshot fixture per §11.3.

**Verification:**

- `bun run dev` — landing page shows ~80–110 sub-feature cards across 6 groups with sub-group sections.
- Click any card → navigates to the right anchor; the page scrolls to the matching `## heading`.
- Click `Effects` filter pill → only Effects sub-groups visible. Click `All` → all groups visible. Click `Instruments` → only Instruments visible.
- At <768px viewport: sub-groups collapse closed; tapping a sub-group heading expands.
- Footer CTA navigates to `/docs/reference`.
- Build script logs warnings (if any) for missing/mismatched fields; build still succeeds.

### Phase 4 — Cross-browser polish + accessibility

**Goal:** Grid is usable on all supported browsers and meets the a11y baseline already set by v1.

1. Test in Chrome, Firefox, Safari (desktop) + iOS Safari + Android Chrome.
2. Keyboard: Tab through pill row (Left/Right arrows move within row), Tab into cards, Enter activates a card link. Tab into sub-group headings, Enter toggles open/closed.
3. Screen reader: pills use `aria-pressed`, sub-group headings use `<button>` with `aria-expanded`. Card titles get `aria-label="<name> reference"`.
4. Focus visible: pills, headings, card titles get a 2px focus outline using `var(--accent-primary)`.
5. Reduced motion: disable chevron rotation transition; pill state-changes snap.
6. Lighthouse a11y on `/` stays ≥ 95.

**Verification:** Manual matrix; Lighthouse CI; axe-core spot-check.

---

## 10. Edge Cases

1. **Manifest entry missing `group`** — emit warning to stderr; skip the doc entirely. Build succeeds with fewer cards. Useful while upstream Phase 1 is in flight; the page just shows a smaller grid.

2. **Manifest entry has `group` but no `subgroup` for a group that requires sub-grouping** — same: warn, skip. (Visualizations is the explicit exception — it's flat.)

3. **A sub-feature's `anchor` doesn't match any heading in `headings[]`** — log a warning, render the card anyway with the configured anchor. The URL may 404-anchor; the visitor still lands on the doc page top. Authors fix on their next pass.

4. **A sub-feature has no `snippet`** — card renders without the snippet block. Card is shorter; CSS grid `align-items: stretch` keeps the row visually aligned.

5. **A doc has `subfeatures: []` (empty array)** — treated as atomic-doc path (single card from doc `tagline`).

6. **A doc with no `subfeatures` and no `tagline`** — warn ("doc has neither subfeatures nor tagline"); skip from grid.

7. **An `icon:` value isn't in lucide-svelte's exported names** — warn ("unknown icon 'Foo' on doc 'bar'"); fall back to `Box`. Card still renders.

8. **A sub-group has zero cards** — sub-group section is omitted from the layout. No "Coming soon" placeholder (cleaner than v1's empty-group fallback).

9. **A top-level group has zero cards across all sub-groups** — top-level group is omitted from the layout AND from the filter pill row. The pill for an empty group simply isn't rendered.

10. **Filter pill clicked while another is active** — switch active. Single-select. `All` resets.

11. **Mobile filter pill row overflows horizontally** — horizontal scroll, no wrapping. Snap-to-pill scroll on iOS Safari.

12. **`prefers-reduced-motion` set** — chevron rotation disabled; pill state-changes are instant.

13. **JS disabled** — grid renders fully via SSR; all groups expanded, no filter narrowing. Sub-group collapse degrades to "always expanded". Card links work.

14. **Sub-group ordering when two docs declare the same `subgroup`** — order is determined by the first contributing doc's `order` field. E.g. if filters.md (`order: 2`) and envelopes.md (`order: 4`) both declare `subgroup: frequency`, the "Frequency" sub-group inherits position from filters.md (the lower order).

15. **A doc with a single sub-feature** — still emits one card via the sub-feature path (with snippet/icon/anchor), not folded into atomic-doc rendering. Predictable: `subfeatures: [...]` always means "sub-feature cards".

16. **An author authors `subfeatures` for a doc whose body has no matching headings at all** — every anchor mismatches; all cards ship with broken anchors. Each emits its own warning. The build artifacts are correct from a website standpoint; the upstream author fixes the body next.

17. **Sub-feature `anchor` collides with another sub-feature in the same doc** — both cards route to the same URL. Allowed (uncommon, but not an error). No special handling.

---

## 11. Testing / Verification Strategy

### 11.1 Automated (blocking in CI)

- **`bun run check`** — type-check.
- **`bun run build`** — must succeed; `prebuild` runs `fetch-mirrored-docs.ts`, which invokes `build-overview.ts` at the end.
- **`bun run test`** — Vitest passes (build script + component snapshot).
- **Lighthouse CI** — perf ≥ 95 on `/`. a11y ≥ 95.
- **lychee** — no broken links inside the rendered grid or across mirrored docs.

### 11.2 Build-script tests (`scripts/build-overview.test.ts`)

Rewritten for the new shape. Cases:

- **Atomic doc emits one card** — manifest entry with `tagline` and no `subfeatures` → `cards: [{name: title, tagline, url, ...}]`. URL has no fragment.
- **Sub-feature doc emits N cards** — manifest entry with `subfeatures: [a, b, c]` → 3 cards, each with `url = doc.url + '#' + anchor`.
- **Mixed sub-features in a sub-group** — two docs both `subgroup: frequency`, one with 5 sub-features, one with 3 → sub-group has 8 cards in doc-`order` then array-order.
- **Missing `group`** — entry without `group:` → warn, skipped from output.
- **Missing `subgroup` for a non-flat group** — warn, skipped.
- **Anchor mismatch** — sub-feature with `anchor: foo` but `headings[]` doesn't contain `foo` → warn, card still in output with `source.anchorMatched: false`.
- **Unknown icon** — `icon: NotALucideIcon` → warn, card emitted with `icon: 'Box'`.
- **Sub-group ordering** — two docs share a sub-group, lower-`order` doc's position wins.
- **Empty top-level group** — no cards across any of its sub-groups → group omitted from `groups[]`.
- **Subfeature without snippet** — emitted card has `snippet` undefined.
- **Per-subfeature icon override** — emitted card uses `subfeature.icon`, not doc `icon`.

### 11.3 Component snapshot (`OverviewGrid.test.ts`)

Vitest + @testing-library/svelte snapshot of `OverviewGrid` with a fixture covering:

- 3 top-level groups, with one flat (no sub-groups) and two with sub-groups.
- A sub-group with 2 cards from one doc + 3 cards from another (verifies ordering).
- A mix of atomic cards (no fragment URL) and sub-feature cards.
- A card with snippet and a card without.
- A card with custom icon and a card with the default.
- A card whose `anchorMatched: false` (renders identically to a matched one — anchor mismatch is a build-time concern, not a render-time concern).

### 11.4 Manual (run on a Netlify preview before merge)

- **Card rendering**: Open `nkido.cc/` desktop, scroll to the bottom. Confirm: 6 group sections, sub-groups visible, ~80–110 cards. Click any sub-feature card → navigates to the right anchor in the parent doc.
- **Filter pills**: Click `Effects` → other groups disappear from layout. Click `All` → all reappear. Click `Instruments` → only Instruments visible. `aria-pressed` updates correctly (verified via DevTools accessibility tree).
- **Sub-group collapse on mobile**: Resize to 375px. Sub-groups all show heading + chevron; cards hidden. Tap heading → expands. Tap again → collapses.
- **Snippet rendering**: Pick 5 cards from different groups; confirm snippets render in the syntax-highlighted style consistent with the rest of the site. Cards without a snippet have no empty space where the snippet would be.
- **Footer CTA**: `View full reference →` navigates to `/docs/reference`.
- **Skip-on-missing fallback**: Temporarily delete `group` from one entry in `docs-manifest.json` on a feature branch. Run `bun run build:overview`. Confirm: that doc's cards are absent; the rest of the grid is intact; build succeeds; warning visible in stderr. Restore before merge.
- **Anchor mismatch behavior**: Temporarily change one sub-feature's `anchor` to `not-a-heading` on a feature branch. Run `bun run build:overview`. Confirm: warning logged; card still emitted; clicking the card navigates to the doc top (the broken anchor 404s silently). Restore before merge.
- **Pagefind sanity**: Search for `saturate`, `moog`, `bitcrush`. Confirm the parent docs surface in results (Pagefind indexes doc bodies, not the grid).

### 11.5 Cross-browser

Chrome, Firefox, Safari (desktop). iOS Safari, Android Chrome. Confirm grid layout, filter pills, sub-group collapse, anchor scrolling, focus styles, sticky pill bar.

---

## 12. Migration Notes (v1 → v2)

- v1's `GROUP_MAPPING` and `ICON_MAP` constants are deleted from `scripts/build-overview.ts`. No reference to them remains anywhere.
- v1's `referenceKeyword` field on rendered `.md` frontmatter is removed (was unused outside `build-overview.ts`).
- `overview.json`'s top-level shape changes from `{groups: [{cards: OverviewCard[]}]}` to `{groups: [{subgroups: [{cards: OverviewCard[]}]}]}`. Any consumer reading `overview.json` directly (currently only `OverviewGrid.svelte`, also rewritten) must be updated.
- `OverviewCard` props change: `card.chips` is gone; `card.snippet?` and `card.tagline` are added. Tests and snapshots regenerate.
- Mobile collapse semantics shift from "top-level group is the collapsible unit" (v1) to "sub-group is the collapsible unit" (v2). Top-level groups always show their heading on mobile; sub-groups collapse.
- Existing PRD `prd-landing-overview-grid.md` is left in place as historical record. Its "Status: Complete" status remains accurate for v1; v2 supersedes it on merge of this PRD's implementation.

---

## 13. Open Questions

1. **Final sub-group taxonomy for Sequencing and Tools.** §5.2 proposes Patterns/Voicing/Timing for Sequencing and Math/State&I/O/Audio plumbing for Tools, but the upstream author lands the decision when authoring frontmatter in Phase 1. The website doesn't need to know in advance — it reads whatever `subgroup:` values appear and renders them in first-doc order.

2. **Snippet syntax-highlighter.** The site already renders code blocks elsewhere (DocPage). Decision: reuse the same Shiki/Prism setup the rest of the site uses. If that adds non-trivial bundle weight to the landing page where it wasn't loaded before, fall back to a plain `<code>` block with monospace styling. To be confirmed during Phase 3.

3. **Should the `tagline` field be 1 line strict or allow 2-line wrapping?** Proposal: `-webkit-line-clamp: 2`, soft cap 120 chars per line, hard ellipsis past 240 chars. Tooltip-on-hover with full text is **future work**.

4. **Does math.md need 5 or 8 sub-feature cards?** §5.2 proposes 5 (Arithmetic, Trigonometry, Hyperbolic, Range, Rounding). Upstream author may choose to split further (e.g. Logarithmic separated from Exponential) when authoring math.md frontmatter. Either is fine.

5. **`visualizations.md` (the section overview that v1 Phase 1 retained)** — should it appear as an atomic card in the Visualizations group, or be excluded? Proposal: exclude (omit `group:` to suppress). The 5 split pages already cover the per-visualizer cards; an extra "Visualizations" overview card would be redundant.

---

## 14. Future Work (deferred from this PRD)

1. **Hand-curated website-side overrides.** A small TS file in this repo could inject extra cards or override taglines/icons for specific slugs without touching upstream. Useful if cross-cutting concepts ever need to span multiple docs.
2. **In-grid search input.** A type-to-filter box for fuzzy-matching cards by name/tagline. Useful once the grid grows beyond ~150 cards.
3. **Per-card analytics.** Track which cards visitors click. Defer until there's evidence the section needs prioritization tuning.
4. **Tooltip-on-hover with full description** — for cards whose tagline is truncated.
5. **Search-within-doc on card click** — instead of jumping to an anchor, open the doc with the sub-feature's name highlighted.
6. **Image/screenshot per card** — for visualizers especially; a tiny preview alongside the icon.
7. **Sub-feature page splits** — if any specific sub-feature warrants its own URL (e.g. `/docs/reference/builtins/distortion/saturate` instead of an anchor), split it upstream and update the corresponding `subfeatures[].anchor` to a relative URL.
8. **Replacing or merging `FeatureGrid`.** Once v2 proves itself, the marketing FeatureGrid could be redesigned to focus on cross-cutting capabilities instead of overlapping with the overview surface.

---

## 15. Related Work

- [`prd-landing-overview-grid.md`](./prd-landing-overview-grid.md) — v1 PRD; shipped. v2 supersedes it. Phase 1 of v1 (upstream doc splits and 12 new pages) is taken as already-shipped baseline.
- [`prd-launch-hardening.md`](./prd-launch-hardening.md) — established the docs-mirror pipeline (`fetch-mirrored-docs.ts`, `mirror-index.ts`) and Pagefind. v2 extends the mirror to persist new frontmatter fields without changing the mirror's overall shape.
- [`prd-landing-example-selection.md`](./prd-landing-example-selection.md) — replaced the static landing demo with a live example selector. The OverviewGrid (v1 and v2) sits below it, complementing rather than competing.
- [`prd-project-website.md`](./prd-project-website.md) — v1 of the website composition.
