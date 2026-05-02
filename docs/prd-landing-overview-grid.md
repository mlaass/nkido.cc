# PRD: Landing Page Runtime Overview Grid

> **Status: Phase 3 complete** — Sectioned "What's in the box" grid lives at the end of the landing page (after `RunsEverywhere`). Surfaces 36 cards across 6 groups (Instruments, Effects, Sequencing, Visualizations, Language, Tools), each linking to mirrored docs. Generated from `docs-manifest.json` with hardcoded group/icon rules. Phases 1 (upstream docs), 2 (mirror expansion), and 3 (grid component) complete; remaining: tests + a11y polish (Phase 4).
>
> **Phase 1 changes (vs original PRD):** Visualizations group expanded from 4 to 5 cards — `waveform` got its own split page rather than being merged into oscilloscope. Total cards: **36** (not 35). 12 new upstream docs pages authored (not 11): the original 11 plus `waveform.md`.

---

## 1. Executive Summary

The landing page currently ends with `RunsEverywhere` — a "runs on browser/native/Godot/ESP32" section. Visitors who scroll that far have signalled real interest, but there is no surface that conveys the *breadth of what nkido can actually do*: the instruments, effects, pattern tools, visualizations, language constructs, and utility primitives. The 9-card `FeatureGrid` above sells capabilities at a marketing level ("95+ DSP opcodes", "Hot-swap preserved"); it does not enumerate them.

This PRD proposes a new `OverviewGrid` section appended after `RunsEverywhere` that:

- Lists 36 cards organized into 6 named groups: **Instruments**, **Effects**, **Sequencing**, **Visualizations**, **Language**, **Tools**.
- Renders each card with icon + title + 1-line description + up to 5 tag chips. Card title links to the top of the corresponding mirrored doc; each tag chip deep-links to its anchor inside that doc.
- Is **generated entirely from `src/lib/data/docs-manifest.json`** by a build-time script with hardcoded group rules and icon mappings — no hand-curated card list to drift out of sync.
- Ships with a "View full reference →" footer CTA linking to `/docs/reference`.

Key decisions made during planning:

- **Source of truth: the existing mirrored manifest.** The manifest already includes title, description, keywords, slug, url, and order per page. Group assignment and icon are hardcoded in the build script keyed by `(category, slug)`.
- **Cross-repo dependency: 12 new upstream docs pages must land first.** The grid needs cards for samplers, SoundFont, FM synthesis, polyphony, timelines, samples-loading, chords, and the 5 visualization split-outs (oscilloscope, waveform, spectrum, waterfall, pianoroll). Phase 1 of this PRD writes those upstream alongside `visualizations.md`, which stays as a section overview. Phase 2 expands the website's `MIRROR_INDEX` to pick them up plus 6 existing-but-unmirrored docs (`edge`, `state`, `audio-input`, `conditionals`, `methods`, `arrays`). Phase 3 builds the website grid.
- **36 cards across 6 sectioned groups.** Each group has its own header. Cards within a group are ordered by the manifest's `order` field.
- **Tag chips link to anchors; chips with no matching heading are dropped.** A chip's keyword must match a markdown heading in the doc (case- and slug-insensitive); chips that do not resolve are silently omitted with a build warning. This is the primary build-time integrity check.
- **Build degrades gracefully.** Cards whose slug is missing from the manifest log a warning and are silently omitted from `overview.json`; the badge count auto-tracks the actual number of resolved cards. The grid never blocks a build, and the page never ships known-broken links.
- **Mobile is collapsible.** On `<768px`, group sections collapse closed by default; tapping a heading expands. On desktop, all sections are always open.
- **Pagefind is not integrated.** Cards are static links; site-wide search remains via the existing global search. The grid is a navigation surface, not a search UI.

---

## 2. Current State

| Surface | Today | After this PRD |
|---|---|---|
| Landing-page tail | Ends with `RunsEverywhere` | Adds `OverviewGrid` as the final section |
| Capability narrative | `FeatureGrid` (9 cards): "95+ DSP opcodes", "Hot-swap preserved", etc. | Unchanged. New grid sits below `RunsEverywhere`, separate from `FeatureGrid` |
| Doc discovery | Header nav → `/docs`; in-doc Pagefind search | Header nav + `OverviewGrid` cards on the landing page deep-link directly into the relevant doc/section |
| Mirrored docs | 24 entries in `MIRROR_INDEX` (13 builtins + 4 language + 2 mini-notation + 5 tutorials) | 42 entries: +6 existing-but-unmirrored (`edge`, `state`, `audio-input`, `conditionals`, `methods`, `arrays`), +12 new pages (samplers, soundfonts, polyphony, timelines, fm-synthesis, samples-loading, chords, oscilloscope, waveform, spectrum, pianoroll, waterfall). `visualizations.md` stays as a section overview. Net +18 |
| Upstream docs | 1 single `visualizations.md`; no standalone pages for samplers, SoundFonts, FM, polyphony, timelines, sample loading, or chords | 12 new pages authored upstream; `visualizations.md` retained as the visualizations section overview, with sub-topic detail moved into the five split pages |
| Tag-chip → anchor linking | N/A | New convention: every grid card derives anchor links from manifest `keywords` matched against markdown headings in the source `.md` |

### 2.1 What `FeatureGrid` does (and doesn't) cover today

`src/lib/components/Home/FeatureGrid.svelte` lists 9 capabilities (`Live-coding patterns`, `95+ DSP opcodes`, `Runs everywhere`, `Runtime parameter controls`, `Customizable web UI`, `Instant documentation lookup`, `Lightweight runtime`, `Hot-swap preserved`, `MIT licensed`). These are **marketing claims**, not navigation. None of the cards link anywhere.

`OverviewGrid` is **navigation**: every card resolves to a mirrored doc page. The two grids serve different jobs and both stay on the landing page.

### 2.2 What the manifest already provides

`src/lib/data/docs-manifest.json` is generated by `scripts/fetch-mirrored-docs.ts` and ships in-repo. Each entry already exposes:

```json
{
  "title": "Filters",
  "description": "Filters shape the frequency content of signals by attenuating or boosting certain frequencies.",
  "slug": "filters",
  "order": 2,
  "keywords": ["filter","lp","lowpass","hp","highpass","bp","bandpass","moog","svf","cutoff","resonance","q"],
  "url": "/docs/reference/builtins/filters",
  "source": "live"
}
```

The grid needs no new authored data per card. Group assignment and icon come from a hardcoded mapping in the generator script; everything else is read from the manifest.

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. **Add a sectioned overview grid** to the landing page, after `RunsEverywhere`, surfacing 36 cards across 6 named groups.
2. **Generate the grid data from `docs-manifest.json`** with hardcoded group + icon rules — no hand-curated card list.
3. **Author 12 new upstream docs pages** in the nkido repo so every group has real content to link to.
4. **Expand `MIRROR_INDEX`** by 18 entries to cover the new pages plus 6 existing-but-unmirrored docs needed by the Tools and Language groups.
5. **Anchor-link tag chips** to specific sections within mirrored docs; silently drop chips whose anchors don't resolve.
6. **Collapsible group sections on mobile** (<768px); always-expanded on desktop.
7. **No build failures** from grid drift: missing manifest entries warn but ship.
8. **Footer CTA**: "View full reference →" link to `/docs/reference`.

### 3.2 Non-Goals (deferred to future work)

1. **Hand-curated card layouts.** Cards come strictly from the manifest. Future work could add overrides for highlighted concepts that span multiple docs.
2. **Pagefind integration on the grid.** No filter input on the grid itself; site-wide search stays in the header.
3. **Per-card code snippet previews.** The earlier `prd-landing-example-selection.md` already provides live code via the example selector. The overview grid is text + tags only.
4. **Per-card analytics** (which cards visitors click most).
5. **Animation on group expand/collapse beyond a basic CSS transition.**
6. **Versioned docs.** Mirror always points at upstream `master`.
7. **Replacing or absorbing `FeatureGrid`.** It stays where it is.
8. **Automated screenshots / image previews per card.**

---

## 4. Target Experience

A first-time visitor lands on `nkido.cc/`:

1. Hero → ExampleSelector → FeatureGrid → RunsEverywhere → **OverviewGrid (new)**.
2. They see a section heading: **"What's in the box"** with a 1-line intro and a small badge: *"95+ DSP opcodes · 36 reference pages"*.
3. Below the intro, six labeled subsections stack vertically: `Instruments`, `Effects`, `Sequencing`, `Visualizations`, `Language`, `Tools`. Each subsection has its own heading.
4. Within each subsection, a responsive card grid (4–5 columns at desktop) shows individual reference pages: e.g. under `Effects`, cards for `Filters`, `Envelopes`, `Delays`, `Reverbs`, `Modulation`, `Distortion`, `Dynamics`.
5. Each card shows: a Lucide icon, the title (`Filters`), a 1-line description from the manifest, and 5 tag chips (`moog`, `svf`, `lowpass`, `highpass`, `cutoff`).
6. Visitor clicks the card title → navigates to `/docs/reference/builtins/filters` (top of doc).
7. Visitor clicks a tag chip (e.g. `moog`) → navigates to `/docs/reference/builtins/filters#moog` (anchor).
8. Below the last group, a footer CTA: **"View full reference →"** linking to `/docs/reference`.

On mobile (<768px):
- Group headings show a chevron; subsections are **collapsed by default**.
- Tapping a heading expands that group; chevron rotates.
- Card grid drops to 1 column when expanded.

If the manifest is missing entries for some cards (e.g. upstream rename hasn't propagated):
- Affected cards are silently omitted from the grid; the badge count auto-decrements.
- A warning is logged to the build output: `⚠ overview: missing manifest entry for slug 'foo'`.
- The page still renders successfully — visitors see fewer cards rather than known-broken links.

---

## 5. Group Definitions and Card Composition

### 5.1 Six Groups

| Group | Heading | Source | Card count |
|---|---|---|---|
| 1 | **Instruments** | Sound sources | 5 |
| 2 | **Effects** | Signal processors | 7 |
| 3 | **Sequencing** | Time, patterns, voice allocation | 6 |
| 4 | **Visualizations** | Inline editor visualizers | 5 |
| 5 | **Language** | Akkado syntax & data structures | 7 |
| 6 | **Tools** | Math, state, plumbing | 6 |
| | | **Total** | **36** |

**Why these 6 groups (and not the manifest's category/subcategory)?** The mirror's structure (`reference/builtins`, `reference/language`, `reference/mini-notation`, `tutorials`) is organised by *file location upstream*, not by *what the user is trying to accomplish*. Using it directly would lump filters, oscillators, samplers, math utilities, sequencers, and visualisers into one giant "builtins" group of ~25 cards, hide visualisers behind a non-obvious `builtins/` prefix, and split sequencing across `builtins/` and `mini-notation/`. The 6 groups here are intent-shaped: a visitor scanning the page can find sound sources separately from signal processors separately from how-time-works. New docs slot into the group whose intent they match, which the implementer keys into the hardcoded `GROUP_MAPPING` table — never by inferring from path.

### 5.2 Card Mapping (slug → group)

The generator hardcodes this mapping. If a manifest entry's slug is not in the table, it does **not** appear in the grid (existing entries like `signals`, `DOCUMENTATION_GUIDE`, and the tutorial slugs are excluded by omission).

| Group | Slugs (in `order` ascending) | Mirror category/subcategory |
|---|---|---|
| Instruments | `oscillators`, `fm-synthesis`, `samplers`, `soundfonts`, `samples-loading` | reference/builtins |
| Effects | `filters`, `envelopes`, `delays`, `reverbs`, `modulation`, `distortion`, `dynamics` | reference/builtins |
| Sequencing | `sequencing`, `polyphony`, `timelines`, `basics`, `microtonal`, `chords` | builtins (3) + mini-notation (3) |
| Visualizations | `oscilloscope`, `waveform`, `spectrum`, `waterfall`, `pianoroll` | reference/builtins |
| Language | `pipes`, `variables`, `operators`, `closures`, `arrays`, `methods`, `conditionals` | reference/language |
| Tools | `math`, `utility`, `state`, `edge`, `stereo`, `audio-input` | reference/builtins |

### 5.3 Card Icon Mapping

Icons are imported from `lucide-svelte`, matching the icon style already used in `FeatureGrid.svelte`. The mapping is hardcoded in the generator:

| Slug | Icon | Slug | Icon |
|---|---|---|---|
| `oscillators` | `Waves` | `pipes` | `Plug` |
| `fm-synthesis` | `Radio` | `variables` | `Variable` |
| `samplers` | `Drum` | `operators` | `Calculator` |
| `soundfonts` | `Piano` | `closures` | `Parentheses` |
| `samples-loading` | `FolderOpen` | `arrays` | `Brackets` |
| `filters` | `Sliders` | `methods` | `Workflow` |
| `envelopes` | `Activity` | `conditionals` | `GitBranch` |
| `delays` | `Repeat2` | `math` | `Sigma` |
| `reverbs` | `Wind` | `utility` | `Wrench` |
| `modulation` | `Wand2` | `state` | `Database` |
| `distortion` | `Zap` | `edge` | `Triangle` |
| `dynamics` | `Gauge` | `stereo` | `Headphones` |
| `sequencing` | `ListMusic` | `audio-input` | `Mic` |
| `polyphony` | `Layers` | `oscilloscope` | `LineChart` |
| `timelines` | `Clock` | `spectrum` | `BarChart` |
| `basics` | `Music` | `pianoroll` | `Grid3x3` |
| `microtonal` | `KeyRound` | `waterfall` | `AreaChart` |
| `chords` | `Music2` | `waveform` | `AudioWaveform` |

(Specific Lucide icon names are suggestions; the implementer may swap to better matches as long as one icon exists per slug.)

### 5.4 Card Anatomy

```
┌──────────────────────────────────────────────────┐
│  [icon]                                          │
│                                                  │
│  Filters                                         │
│  Filters shape the frequency content of          │
│  signals by attenuating or boosting…             │
│                                                  │
│  [moog] [svf] [lowpass] [highpass] [cutoff]      │
└──────────────────────────────────────────────────┘
```

- **Icon**: 24px Lucide, color `var(--accent-primary)`. Matches `FeatureGrid` icon style.
- **Title**: `<a>` linking to the top of the doc (`url` from manifest). Same-tab navigation.
- **Description**: 1-line `description` from manifest, truncated at ~120 chars with ellipsis if longer.
- **Tag chips**: First 5 entries from the manifest's `keywords` array that resolve to a markdown heading in the source `.md`. Chips that do not resolve are silently dropped. Each chip is `<a href="<url>#<anchor>">`.

---

## 6. Architecture

### 6.1 Component Structure (website repo)

```
src/lib/components/Home/
├── OverviewGrid.svelte      # NEW: renders 6 group sections + footer CTA
└── OverviewCard.svelte      # NEW: single card (icon, title, description, tag chips)

src/lib/data/
├── docs-manifest.json       # EXISTING: built by fetch-mirrored-docs.ts (extended)
└── overview.json            # NEW: built by scripts/build-overview.ts (see §6.4)

scripts/
├── fetch-mirrored-docs.ts   # EXISTING: needs MIRROR_INDEX expansion + heading extraction
├── mirror-index.ts          # EXISTING: 17 new entries
└── build-overview.ts        # NEW: merges manifest + group/icon rules → overview.json
```

### 6.2 OverviewGrid Layout (ASCII)

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   What's in the box                                                  │
│   Every instrument, effect, and tool — straight to its docs.         │
│   [ 95+ DSP opcodes · 36 reference pages ]                           │
│                                                                      │
│   ── Instruments ─────────────────────────────────────────────────   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │ osc      │  │ FM       │  │ samplers │  │ soundfnt │   …        │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
│   ── Effects ─────────────────────────────────────────────────────   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│   │ filters  │  │ envelopes│  │ delays   │  │ reverbs  │   …        │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
│                                                                      │
│   …                                                                  │
│                                                                      │
│              View full reference →                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.3 Data Shape

`overview.json` (generated):

```typescript
type OverviewGroup = {
  id: 'instruments' | 'effects' | 'sequencing' | 'visualizations' | 'language' | 'tools';
  heading: string;                  // "Instruments", "Effects", …
  cards: OverviewCard[];
};

type OverviewCard = {
  slug: string;                     // 'filters'
  title: string;                    // 'Filters' (from manifest)
  description: string;              // 1-line, from manifest
  url: string;                      // '/docs/reference/builtins/filters'
  icon: string;                     // 'Sliders' (Lucide name)
  chips: { keyword: string; anchor: string; href: string }[];
                                    //   keyword: 'moog'
                                    //   anchor: 'moog'
                                    //   href: '/docs/reference/builtins/filters#moog'
};
```

`OverviewGrid.svelte` imports `overview.json` directly:

```svelte
<script lang="ts">
  import overview from '$lib/data/overview.json';
  import OverviewCard from './OverviewCard.svelte';
  // group-level open/closed state for mobile collapse
  let openGroups = $state<Record<string, boolean>>({});
</script>
```

### 6.4 Build-Overview Script

`scripts/build-overview.ts`:

```
1. Read src/lib/data/docs-manifest.json.
2. For each (group, slug) in the hardcoded GROUP_MAPPING table:
     - Find matching manifest entry by slug + category/subcategory.
     - If missing → emit warning, skip this slug. The card does not appear.
     - Otherwise: build the card. Resolve up to 5 chips from manifest.keywords:
         - For each keyword (in order), look up the matching heading in the source .md.
         - If found → emit chip { keyword, anchor: slugify(heading), href: `${url}#${anchor}` }.
         - If not found → emit warning, skip this keyword.
         - Stop after 5 successful chips.
3. Sort cards within each group by manifest `order` ascending; ties broken by slug.
4. Write overview.json to src/lib/data/.
```

The script is invoked from `scripts/fetch-mirrored-docs.ts` at the end of its run, after the manifest is written, so the two stay in sync without an extra prebuild step. A standalone `bun run build:overview` task is also added for local iteration when the manifest hasn't changed.

### 6.5 Heading Extraction

To validate chip anchors, `fetch-mirrored-docs.ts` is extended to parse markdown headings from each fetched/fallback doc and emit a per-doc heading list to the manifest:

```json
{
  "title": "Filters",
  "headings": ["filters", "lp", "hp", "bp", "moog", "svf", "ladder", ...],
  ...
}
```

**Heading-level range is configurable** via a constant at the top of `fetch-mirrored-docs.ts`:

```ts
// Heading levels to expose as chip-resolvable anchors.
// Start narrow; widen if too many keywords fail to resolve.
const HEADING_LEVELS = { min: 2, max: 5 } as const; // H2–H5
```

H1 is excluded by default because the page title comes from frontmatter and is rendered separately by `DocPage`. H6 is excluded because nothing in the current manifest's `keywords` arrays matches that depth. The range can be relaxed if upstream docs introduce structures that need it.

Anchor matching is **case-insensitive, slugified**: a keyword `Lowpass` matches a heading `## Lowpass` via `slugify('Lowpass') === 'lowpass'`. The slug rules match SvelteKit's default heading-slug algorithm (via `rehype-slug`, already configured in `svelte.config.js`) so that anchor URLs resolve in the rendered HTML.

### 6.6 Mobile Collapse

The collapse behaviour is **CSS-driven** so SSR and hydration stay in sync without per-viewport JS state. `openGroups` tracks user-toggled state only; the desktop-vs-mobile default comes from the stylesheet.

```svelte
<script lang="ts">
  // Per-group open state. Initial values are all `true` (the desktop default).
  // On mobile, CSS hides cards regardless of this value until the user taps a heading.
  let openGroups = $state<Record<string, boolean>>(
    Object.fromEntries(overview.map(g => [g.id, true]))
  );
</script>

{#each overview as group}
  <section class="group" data-open={openGroups[group.id]}>
    <button type="button" class="group-heading"
            aria-expanded={openGroups[group.id]}
            onclick={() => openGroups[group.id] = !openGroups[group.id]}>
      {group.heading}
      <Chevron />
    </button>
    <div class="cards"> ... </div>
  </section>
{/each}
```

```css
/* Desktop: cards always visible. */
.group .cards { display: grid; }

@media (max-width: 768px) {
  /* Mobile: cards hidden by default, shown only when the user has opened the group. */
  .group .cards                   { display: none; }
  .group[data-open='true'] .cards { display: grid; }
}
```

The cards `<div>` is always in the SSR output (no `{#if}` wrapping it), so server-rendered HTML matches the client's first paint regardless of viewport — only the CSS visibility differs. Tapping a heading toggles `data-open`; on desktop the toggle is a no-op visually (cards stay shown) but `aria-expanded` still reflects the state for screen readers, so the button has consistent semantics across viewports. A `prefers-reduced-motion` check disables the chevron rotation transition.

---

## 7. Impact Assessment

| Component | Status | Notes |
|---|---|---|
| `src/routes/+page.svelte` | **Modified** | Append `<OverviewGrid />` after `<RunsEverywhere />`. |
| `src/lib/components/Home/Hero.svelte` | **Stays** | No change. |
| `src/lib/components/Home/ExampleSelector.svelte` | **Stays** | No change. |
| `src/lib/components/Home/FeatureGrid.svelte` | **Stays** | No change — the new grid is additive. |
| `src/lib/components/Home/RunsEverywhere.svelte` | **Stays** | No change. |
| `src/lib/components/Home/OverviewGrid.svelte` | **New** | Renders 6 groups + footer CTA, with mobile collapse state. |
| `src/lib/components/Home/OverviewCard.svelte` | **New** | Renders a single card. |
| `src/lib/data/overview.json` | **New** | Generated by `build-overview.ts`. Checked in; CI rebuilds it. |
| `src/lib/data/docs-manifest.json` | **Modified** | Adds `headings: string[]` per entry. Extends to cover 17 new entries from MIRROR_INDEX expansion. |
| `scripts/mirror-index.ts` | **Modified** | +17 entries (6 existing-but-unmirrored docs + 11 new docs). |
| `scripts/fetch-mirrored-docs.ts` | **Modified** | Extract markdown headings and persist to manifest. |
| `scripts/build-overview.ts` | **New** | Merges manifest + hardcoded group/icon rules → `overview.json`. |
| `package.json` | **Modified** | Add `"build:overview": "bun scripts/build-overview.ts"` for local iteration. No `prebuild` change — `fetch-mirrored-docs.ts` invokes the overview builder at the end of its run, and that script is already in `prebuild`/`predev`. Add `test`/`test:watch` scripts for the new Vitest setup. |
| `static/_mirror-fallback/web/static/docs/reference/builtins/{11 new}.md` | **New** | Fallback copies of the new upstream docs. |
| `web/static/docs/reference/builtins/samplers.md` (nkido repo) | **New** | Documents `samp` and sampler builtins. |
| `web/static/docs/reference/builtins/soundfonts.md` (nkido repo) | **New** | Documents `gm` SoundFont and SoundFont playback. |
| `web/static/docs/reference/builtins/fm-synthesis.md` (nkido repo) | **New** | FM synthesis split out of `oscillators.md`. |
| `web/static/docs/reference/builtins/polyphony.md` (nkido repo) | **New** | `poly`, `mono`, `legato`, `spread` split out of `sequencing.md`. |
| `web/static/docs/reference/builtins/timelines.md` (nkido repo) | **New** | `timeline` builtin and curve notation split from `sequencing.md`. |
| `web/static/docs/reference/builtins/samples-loading.md` (nkido repo) | **New** | How to load and reference user-supplied samples + built-in sample banks. |
| `web/static/docs/reference/builtins/oscilloscope.md` (nkido repo) | **New** | Split from `visualizations.md`. |
| `web/static/docs/reference/builtins/waveform.md` (nkido repo) | **New** | Split from `visualizations.md`. |
| `web/static/docs/reference/builtins/spectrum.md` (nkido repo) | **New** | Split from `visualizations.md`. |
| `web/static/docs/reference/builtins/pianoroll.md` (nkido repo) | **New** | Split from `visualizations.md`. |
| `web/static/docs/reference/builtins/waterfall.md` (nkido repo) | **New** | Split from `visualizations.md`. |
| `web/static/docs/reference/builtins/visualizations.md` (nkido repo) | **Modified** | Stays as the visualizations section overview; sub-topic detail moves into the four split pages, replaced by short summaries with cross-links. |
| `web/static/docs/reference/mini-notation/chords.md` (nkido repo) | **New** | Chord literals + voicings split from `basics.md`. |
| `web/src/lib/docs/manifest.ts` (nkido repo) | **Modified** | Auto-regenerated by upstream's `bun run build:docs` to include new pages. |

No changes to:
- Header / Footer / Layout.
- `/docs` route layout or per-doc rendering.
- The `ExampleSelector` or its underlying patches.
- Pagefind index configuration.
- The CI Lighthouse budget (the new section adds DOM but no heavy assets).

---

## 8. File-Level Changes

### 8.1 nkido.cc repo (this repo)

| File | Change |
|------|--------|
| `src/routes/+page.svelte` | Add `import OverviewGrid from '$lib/components/Home/OverviewGrid.svelte';` and `<OverviewGrid />` after `<RunsEverywhere />`. |
| `src/lib/components/Home/OverviewGrid.svelte` | **New.** Reads `overview.json`, renders `<section>` per group with collapsible heading on mobile. CSS grid `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));`. Includes the title `"What's in the box"`, intro text, count badge, and footer CTA. |
| `src/lib/components/Home/OverviewCard.svelte` | **New.** Props: `card: OverviewCard`. Renders icon (resolved via `<svelte:component this={iconMap[card.icon]} />`), `<a>` title, description, chip list. Title has `aria-label="<title> reference"`. Each chip is `<a class="chip">`. No placeholder/coming-soon variant — missing-manifest cards are skipped at the build step (per §10 #1). |
| `src/lib/data/overview.json` | **New.** Generated artifact, checked into git. Rebuilt by `fetch-mirrored-docs.ts` at the end of its run (so `prebuild`/`predev` regenerate it transitively). |
| `src/lib/data/docs-manifest.json` | **Modified.** Each entry gains a `headings: string[]` field listing slugified markdown headings within the configured level range (default H2–H5; see §6.5). |
| `scripts/mirror-index.ts` | **Modified.** Add 17 entries. See §8.3 for the full list. |
| `scripts/fetch-mirrored-docs.ts` | **Modified.** Two changes: (1) After fetching/loading each `.md`, parse the markdown to extract headings within `HEADING_LEVELS` (default H2–H5; see §6.5), slugify, and write to the manifest as `headings`. (2) At end of `main()`, after `writeManifest`, invoke the overview builder so the two artifacts stay in sync. |
| `scripts/build-overview.ts` | **New.** Implements the algorithm in §6.4. Hardcoded `GROUP_MAPPING` (36 rows: slug → group) and `ICON_MAP` (36 rows: slug → Lucide icon name). Exposes a `buildOverview()` function so `fetch-mirrored-docs.ts` can call it; also runs as a CLI entrypoint when invoked directly. Logs warnings to stderr; exits 0 always. |
| `package.json` | **Modified.** Add `"build:overview": "bun scripts/build-overview.ts"` for local iteration. **No `prebuild` change needed** — `fetch-mirrored-docs.ts` (already in `prebuild` and `predev`) invokes the overview builder at the end of its run. Also add `"test": "vitest run"` and `"test:watch": "vitest"` scripts. |
| `vitest.config.ts` | **New.** Minimal Vitest config wiring the Svelte plugin and pointing at `**/*.test.ts` under `scripts/` and `src/`. |
| `package.json` (devDeps) | **Modified.** Add `vitest`, `@testing-library/svelte`, `jsdom` (or `happy-dom`) as devDependencies. |
| `static/_mirror-fallback/web/static/docs/reference/builtins/{samplers,soundfonts,polyphony,timelines,fm-synthesis,samples-loading,oscilloscope,waveform,spectrum,pianoroll,waterfall}.md` | **New.** Fallback copies committed to this repo so builds succeed without GitHub access (matches existing fallback pattern). |
| `static/_mirror-fallback/web/static/docs/reference/builtins/{edge,state,audio-input}.md` | **New.** Fallback copies for the existing-but-newly-mirrored builtins. |
| `static/_mirror-fallback/web/static/docs/reference/language/{conditionals,methods,arrays}.md` | **New.** Fallback copies for the existing-but-newly-mirrored language docs. |
| `static/_mirror-fallback/web/static/docs/reference/mini-notation/chords.md` | **New.** Fallback copy. |
| `static/_mirror-fallback/web/static/docs/reference/builtins/visualizations.md` | **Stays.** Upstream file is retained (kept as the visualizations section overview); existing fallback continues to apply. |

### 8.2 nkido repo (upstream)

| File | Change |
|------|--------|
| `web/static/docs/reference/builtins/samplers.md` | **New.** Document `samp` and related sample-playback builtins. Include sections for one-shot playback, transport rate, and built-in 808/909 banks. |
| `web/static/docs/reference/builtins/soundfonts.md` | **New.** Document SoundFont (.sf2) loading, the `gm` General MIDI bank, polyphonic playback, voice management. |
| `web/static/docs/reference/builtins/fm-synthesis.md` | **New.** Move FM-synthesis content out of `oscillators.md` (which currently has `### FM synthesis` as a subsection). Cover carrier/modulator topology, modulation index, frequency ratios. |
| `web/static/docs/reference/builtins/polyphony.md` | **New.** Move `poly`, `mono`, `legato`, `spread` from `sequencing.md` into a dedicated page. Sequencing.md gets a redirecting note ("See polyphony for voice allocation"). |
| `web/static/docs/reference/builtins/timelines.md` | **New.** Move the `timeline` builtin and curve notation from `sequencing.md`/`mini-notation/curve-notation.md` into a dedicated page. Curve-notation reference stays in mini-notation; timelines.md focuses on the builtin and scheduling semantics. |
| `web/static/docs/reference/builtins/samples-loading.md` | **New.** Document how user files reach the sampler at runtime (drag-and-drop in the IDE, fetch URLs, packaged sample banks). |
| `web/static/docs/reference/builtins/oscilloscope.md` | **New.** Split from `visualizations.md`. Document the oscilloscope visualizer (signal display, trigger, time base). |
| `web/static/docs/reference/builtins/waveform.md` | **New.** Split from `visualizations.md`. Document the waveform / envelope visualizer (min/max amplitude over time). |
| `web/static/docs/reference/builtins/spectrum.md` | **New.** Split from `visualizations.md`. Document the spectrum analyzer. |
| `web/static/docs/reference/builtins/pianoroll.md` | **New.** Split from `visualizations.md`. Document the pianoroll visualizer for note events. |
| `web/static/docs/reference/builtins/waterfall.md` | **New.** Split from `visualizations.md`. Document the waterfall (spectrogram) view. |
| `web/static/docs/reference/builtins/visualizations.md` | **Modified.** Stays as a section overview / index page. Detailed sub-topic content moves into the four split pages; `visualizations.md` keeps short summaries with cross-links. |
| `web/static/docs/reference/mini-notation/chords.md` | **New.** Move chord literals, inline chords, and voicing transforms (`anchor`, `mode`, `voicing`, `addVoicings`) from `basics.md`/`sequencing.md` into a dedicated mini-notation page. |
| `web/static/docs/reference/builtins/sequencing.md` | **Modified.** Remove the moved-out sections (`poly`/`mono`/`legato`/`spread` → polyphony.md, `timeline` → timelines.md, voicing transforms → mini-notation/chords.md). Add cross-links. |
| `web/static/docs/reference/builtins/oscillators.md` | **Modified.** Remove the FM synthesis subsection (now `fm-synthesis.md`). Cross-link. |
| `web/static/docs/reference/mini-notation/basics.md` | **Modified.** Remove chord-related sections (now `chords.md`). Cross-link. |
| `web/src/lib/docs/manifest.ts` | **Modified.** Auto-regenerated by `bun run build:docs` to include new pages and pick up the trimmed `visualizations.md` overview. |

### 8.3 MIRROR_INDEX additions

```typescript
// Existing-but-newly-mirrored (6)
{ upstream: 'web/static/docs/reference/builtins/edge.md',         category: 'reference', subcategory: 'builtins',     slug: 'edge' },
{ upstream: 'web/static/docs/reference/builtins/state.md',        category: 'reference', subcategory: 'builtins',     slug: 'state' },
{ upstream: 'web/static/docs/reference/builtins/audio-input.md',  category: 'reference', subcategory: 'builtins',     slug: 'audio-input' },
{ upstream: 'web/static/docs/reference/language/conditionals.md', category: 'reference', subcategory: 'language',     slug: 'conditionals' },
{ upstream: 'web/static/docs/reference/language/methods.md',      category: 'reference', subcategory: 'language',     slug: 'methods' },
{ upstream: 'web/static/docs/reference/language/arrays.md',       category: 'reference', subcategory: 'language',     slug: 'arrays' },

// New upstream docs (11)
{ upstream: 'web/static/docs/reference/builtins/samplers.md',         category: 'reference', subcategory: 'builtins',     slug: 'samplers' },
{ upstream: 'web/static/docs/reference/builtins/soundfonts.md',       category: 'reference', subcategory: 'builtins',     slug: 'soundfonts' },
{ upstream: 'web/static/docs/reference/builtins/fm-synthesis.md',     category: 'reference', subcategory: 'builtins',     slug: 'fm-synthesis' },
{ upstream: 'web/static/docs/reference/builtins/polyphony.md',        category: 'reference', subcategory: 'builtins',     slug: 'polyphony' },
{ upstream: 'web/static/docs/reference/builtins/timelines.md',        category: 'reference', subcategory: 'builtins',     slug: 'timelines' },
{ upstream: 'web/static/docs/reference/builtins/samples-loading.md',  category: 'reference', subcategory: 'builtins',     slug: 'samples-loading' },
{ upstream: 'web/static/docs/reference/builtins/oscilloscope.md',     category: 'reference', subcategory: 'builtins',     slug: 'oscilloscope' },
{ upstream: 'web/static/docs/reference/builtins/waveform.md',         category: 'reference', subcategory: 'builtins',     slug: 'waveform' },
{ upstream: 'web/static/docs/reference/builtins/spectrum.md',         category: 'reference', subcategory: 'builtins',     slug: 'spectrum' },
{ upstream: 'web/static/docs/reference/builtins/pianoroll.md',        category: 'reference', subcategory: 'builtins',     slug: 'pianoroll' },
{ upstream: 'web/static/docs/reference/builtins/waterfall.md',        category: 'reference', subcategory: 'builtins',     slug: 'waterfall' },
{ upstream: 'web/static/docs/reference/mini-notation/chords.md',      category: 'reference', subcategory: 'mini-notation', slug: 'chords' },

// `web/static/docs/reference/builtins/visualizations.md` — stays in MIRROR_INDEX
// as the visualizations section overview; not added to GROUP_MAPPING (the four
// split pages provide the per-card detail in the Visualizations group).
```

---

## 9. Implementation Phases

### Phase 1 — Upstream docs split & new pages (nkido repo)

**Goal:** All 11 new docs pages exist upstream; `visualizations.md` is trimmed to an overview; affected pages have their moved-out sections cross-linked.

1. Author the 11 new `.md` files per §8.2.
2. Modify `sequencing.md`, `oscillators.md`, `mini-notation/basics.md` to remove relocated content and add cross-links.
3. Modify `visualizations.md`: trim sub-topic detail (now in the four split pages) and replace with short per-topic summaries plus cross-links. Keep the page as the section overview.
4. Run `bun run build:docs` upstream to regenerate `web/src/lib/docs/manifest.ts`.
5. Verify each new page renders in the IDE's docs viewer (F1 lookup) without errors.
6. Verify each existing chip-anchor in `web/src/lib/docs/lookup.ts` still resolves; for any anchors that previously deep-linked into removed sub-sections of `visualizations.md`, update to point at the corresponding split page.

**Verification:**
- `bun run check` and `bun run build` succeed in nkido.
- F1 lookup for `samplers`, `soundfonts`, `fm`, `polyphony`, `timeline`, `chords`, `oscilloscope`, `waveform`, `spectrum`, `pianoroll`, `waterfall` returns the right page.
- F1 lookup for `visualizations` still resolves to `visualizations.md` (now the overview); deep-link anchors that previously pointed into removed sub-sections instead resolve to the relevant split page.

### Phase 2 — Mirror expansion + heading extraction (nkido.cc repo)

**Goal:** `MIRROR_INDEX` covers all 41 entries; manifest includes `headings` per entry; fallbacks committed.

1. Add 17 entries to `scripts/mirror-index.ts` per §8.3. (`visualizations.md` row stays.)
2. Modify `scripts/fetch-mirrored-docs.ts` to extract markdown headings (default H2–H5; configurable via `HEADING_LEVELS` constant) and write `headings: string[]` per manifest entry.
3. Run the existing fetch script (`bun run scripts/fetch-mirrored-docs.ts`, also invoked transitively by `bun run predev` / `bun run prebuild`) to populate the live + fallback files.
4. Commit the new `_mirror-fallback/...` files (14 new fallbacks).
5. Verify `src/lib/data/docs-manifest.json` now contains 41 entries each with `headings`.
6. Verify routes `/docs/reference/builtins/{new pages}`, `/docs/reference/language/{conditionals,methods,arrays}`, `/docs/reference/mini-notation/chords` all render in `bun run dev`.

**Verification:**
- `bun run check` and `bun run build` succeed.
- Lychee link checker passes for the rendered build (cross-links into `visualizations.md` and the four split pages all resolve).
- Pagefind reindex picks up the new pages.

### Phase 3 — OverviewGrid component + build script (nkido.cc repo)

**Goal:** The grid renders correctly on the landing page with all 36 cards, anchored chips, mobile collapse, and footer CTA.

1. Implement `scripts/build-overview.ts` per §6.4. Hardcoded `GROUP_MAPPING` and `ICON_MAP`. Export a `buildOverview()` function plus a CLI entrypoint.
2. Wire `fetch-mirrored-docs.ts` to call `buildOverview()` at the end of `main()` (after `writeManifest`).
3. Run `bun run build:overview` (or `bun run scripts/fetch-mirrored-docs.ts`) to produce `src/lib/data/overview.json`. Inspect output: 6 groups, 36 cards in steady state, ≤5 chips per card.
4. Implement `OverviewCard.svelte` per §5.4.
5. Implement `OverviewGrid.svelte` per §6.2 and §6.6 (CSS-driven mobile collapse).
6. Add `<OverviewGrid />` to `src/routes/+page.svelte` after `<RunsEverywhere />`.

**Verification:**
- `bun run dev` — landing page shows 6 sectioned groups with 36 cards total.
- Click any card title → top of correct doc.
- Click a tag chip → navigates to a heading anchor that scrolls to the right section.
- At <768px viewport: groups collapse closed; tap heading expands.
- Footer CTA navigates to `/docs/reference`.
- Build script logs warnings (if any) for missing chips/manifest entries; build still succeeds.

### Phase 4 — Cross-browser polish + accessibility

**Goal:** Grid is usable on all supported browsers and meets a11y baseline.

1. Test in Chrome, Firefox, Safari (desktop) + iOS Safari + Android Chrome.
2. Keyboard navigation: tab through cards, Enter on title navigates, arrow keys within a chip row optional.
3. Screen reader: each card title has an `aria-label`; group headings use `<button>` with `aria-expanded`.
4. Focus visible: chips and titles get a 2px focus outline using `var(--accent-primary)`.
5. Reduced motion: respect `prefers-reduced-motion` for chevron rotation.
6. Lighthouse a11y on `/` stays ≥ 95.

**Verification:** Manual matrix; Lighthouse CI; axe-core spot-check.

---

## 10. Edge Cases

1. **Manifest entry missing for a slug in `GROUP_MAPPING`** — emit warning to stderr; skip the card entirely (the slug does not appear in `overview.json`). Build succeeds. The group renders with whatever cards did resolve; the badge count auto-tracks and stays accurate. Useful while upstream docs are in flight between Phase 1 and Phase 2 — the page just shows fewer cards instead of shipping known-broken links.

2. **Manifest entry has fewer than 5 keywords** — emit chips for all valid keywords (could be fewer than 5). The card simply has less tag content.

3. **Manifest entry has zero keywords or all keywords fail anchor resolution** — card renders with no chips. Title and description still appear. No warning unless the count of resolved chips is `< 1`, in which case log info-level note ("card 'foo' has no resolvable chips").

4. **Duplicate slug across categories (theoretically: `filters` exists as both a builtin and a tutorial)** — the tutorial is filtered out at the `GROUP_MAPPING` step (it's not in the table). If a future change introduces a real collision, the build script must key on `(category, subcategory, slug)` tuple, not `slug` alone.

5. **A keyword exactly matches a heading in case but with surrounding whitespace** — slugify strips whitespace, lowercases, and replaces non-alphanumerics with `-`. Heading `## Low Pass Filter` → `low-pass-filter`. Keyword `Low Pass Filter` → `low-pass-filter`. Match succeeds.

6. **A chip-keyword resolves to multiple headings (e.g. both `## moog` and `### moog ladder`)** — pick the first match in document order. Document this in the build script comment.

7. **Visualizations split moves sub-section content out of `visualizations.md`** — `visualizations.md` itself stays as the section overview, but any anchors that previously deep-linked into a sub-section (e.g. `visualizations.md#oscilloscope`) should be redirected to the corresponding split page (`oscilloscope.md`). The `lookup.ts` regeneration in Phase 1 handles this. For the website mirror, the manifest is rebuilt fresh in Phase 2; chip anchors that no longer resolve in `visualizations.md` are silently dropped per the standard chip-resolution rules.

8. **`fetch:docs` fails (offline build, GitHub down)** — falls back to `_mirror-fallback/` files. The new fallbacks committed in Phase 2 ensure offline builds still produce a complete manifest. `overview.json` is rebuilt from the fallback-derived manifest. Build succeeds with `source: 'fallback'` in manifest entries.

9. **A doc page gets renamed upstream without updating MIRROR_INDEX** — the fetch step logs a 404 warning; the entry uses the fallback. No grid drift unless the slug also moves; if it does, the card is silently omitted per Edge Case 1.

10. **Mobile collapse state leaks into desktop after viewport resize** — the component listens for `resize` and re-syncs `openGroups` to all-true if the viewport crosses ≥768px while running. Avoids visitors seeing collapsed groups on desktop after rotating their phone.

11. **Card description is longer than 120 chars and gets truncated** — truncation uses CSS `-webkit-line-clamp: 2` to allow up to 2 visible lines; only descriptions exceeding ~240 chars get a hard ellipsis. Tooltip-on-hover with full description is **future work**, not in scope.

12. **Tag chip count differs across cards in the same row, causing uneven card heights** — cards use `align-items: stretch` and a min-height; chip rows align to the bottom so titles and descriptions remain visually aligned across a row.

13. **Group has zero cards (e.g. every slug in Instruments is missing from the manifest pre-Phase 1)** — group still renders its heading with a single italic line ("Coming soon") in place of the cards grid. Better than hiding the group entirely, since visitors can see the intended structure and that more is on the way. In steady state (Phase 2 complete) this case shouldn't occur.

14. **`prefers-reduced-motion` is set** — chevron rotation and any expand/collapse animations are disabled (instant snap).

15. **Visitor opens the page with JavaScript disabled** — the grid renders fully (SSR), with all groups expanded. Mobile collapse degrades gracefully to "always expanded".

---

## 11. Testing / Verification Strategy

### 11.1 Automated (blocking in CI)

- **`bun run check`** — type-check.
- **`bun run build`** — must succeed; `prebuild` runs `fetch-mirrored-docs.ts`, which now invokes the overview builder at the end of its run.
- **Lighthouse CI** — perf ≥ 95 on `/` (the grid adds DOM but no extra fonts, scripts, or images). a11y ≥ 95.
- **lychee** — no broken links inside the rendered grid or across any of the 17 newly mirrored doc pages.

### 11.2 Build-script tests

- **`scripts/build-overview.test.ts`** (new): unit tests for the script with mocked manifest input. Cases:
  - Manifest entry missing for a slug in `GROUP_MAPPING` → card omitted from output, warning logged.
  - All chips resolve → exactly 5 chips, in keyword order.
  - 3 of 5 chips fail anchor resolution → 2 chips emitted, warnings logged.
  - Group ordering matches manifest `order`.
  - Slug not in `GROUP_MAPPING` → entry skipped silently (e.g. `tutorials/hello-sine` does not appear).
  - All slugs in a group missing → group has empty `cards: []` (renderer shows "Coming soon" per §10 #13).

### 11.3 Component snapshot

- A Vitest + @testing-library/svelte snapshot of `OverviewGrid` rendered with a fixture `overview.json` (3 groups, 5 cards each) to lock the markup and prevent accidental layout regressions.

### 11.4 Manual (run on a Netlify preview before merge)

- **Card rendering**:
  1. Open `nkido.cc/` on desktop (>1024px). Scroll to the bottom.
  2. Confirm: 6 group headings, 36 cards total, distributed per §5.2.
  3. Hover any card → focus styles visible.

- **Title-click navigation**:
  1. Click the **Filters** card title.
  2. Confirm: navigates to `/docs/reference/builtins/filters` at the top of the page.

- **Chip-click navigation**:
  1. On the **Filters** card, click the `moog` chip.
  2. Confirm: navigates to `/docs/reference/builtins/filters#moog` and the page scrolls to the `## moog` heading.

- **Mobile collapse**:
  1. Resize to 375px width.
  2. Confirm: all group sections show only their heading + chevron; cards hidden.
  3. Tap the **Effects** heading. Cards expand. Chevron rotates.
  4. Tap again → collapses.

- **Footer CTA**:
  1. Click "View full reference →".
  2. Confirm: navigates to `/docs/reference`.

- **Skip-on-missing fallback** (Phase-2 boundary):
  1. Temporarily delete an entry from `docs-manifest.json` in a feature branch.
  2. Run `bun run build:overview`.
  3. Confirm: corresponding card is absent from `overview.json`; the badge count auto-decrements.
  4. Build succeeds; `⚠ overview: missing manifest entry for slug 'foo'` visible in stderr.
  5. Restore manifest before merge.

- **Pagefind sanity**:
  1. Open the global site search.
  2. Search for `samplers`, `polyphony`, `chord`, `pianoroll`.
  3. Confirm: each new mirrored page is in the index.

### 11.5 Cross-browser

- Chrome, Firefox, Safari on desktop.
- iOS Safari, Android Chrome.
- Confirm grid layout, collapse behavior, anchor scrolling, focus styles.

---

## 12. Open Questions

1. **Does the count badge text track the actual number of cards or stay marketing-friendly?** Proposed: "95+ DSP opcodes · 36 reference pages" where "36" is auto-derived from `overview.json` length so it stays accurate as docs are added. "95+" is a hand-set constant matching `FeatureGrid`. If the card count fluctuates as upstream rolls out new docs, the badge updates automatically.

2. **Should the sequencing-related move (poly/mono/legato/spread out of `sequencing.md`)** require coordination with `prd-pattern-array-note-extensions-phase-2.md` or similar in-flight upstream work? Phase 1 implementer should grep upstream PRDs for references to `sequencing.md` voice-allocation sections before splitting.

3. **Does `prefers-reduced-motion` need to disable the mobile collapse animation entirely, or just shorten it to a snap?** Proposed: full snap (no animation). Tracked here in case a11y review requests a different behavior.

4. **Should "View full reference →" be the only footer CTA, or also include "Read the tutorials"?** Proposed: just "View full reference →" since tutorials are linked from the docs landing page itself. Add a second CTA only if user testing shows tutorials are hard to discover.

5. **Are upstream docs expected to use a frontmatter `keywords:` array, or do we keep the existing `keywords` derivation in `fetch-mirrored-docs.ts`?** Currently `keywords` is auto-derived during the mirror. New docs should follow the same convention; if they ship with frontmatter `keywords`, the existing extraction takes precedence.

---

## 13. Future Work (deferred from this PRD)

1. **Hand-curated card overrides** — allow a small TS file to inject extra cards or override icons/descriptions for specific slugs without changing the manifest or upstream docs.
2. **In-grid filter input** — a small text input above the grid that fuzzy-filters cards by title/keyword. Useful once the grid grows beyond ~50 cards.
3. **Per-card analytics** — track which cards visitors click. Defer until we have evidence the section needs prioritization tuning.
4. **Tooltip-on-hover with full description** — for cards whose description is truncated in the layout.
5. **Search-within-doc on chip click** — instead of jumping to an anchor, open the doc with the chip's keyword highlighted.
6. **More granular grouping** — sub-groups within Effects (Time-based, Distortion, Dynamics) once card count grows.
7. **Image/screenshot per card** — for visualizers especially; a tiny preview image alongside the icon.
8. **Replacing `FeatureGrid` with a hybrid layout** — once the OverviewGrid proves itself, the marketing-style FeatureGrid could be redesigned to focus on cross-cutting capabilities instead of overlapping with the overview.

---

## 14. Related Work

- [`prd-project-website.md`](./prd-project-website.md) — v1 PRD; specified the original landing-page composition.
- [`prd-launch-hardening.md`](./prd-launch-hardening.md) — established the docs-mirror pipeline (`fetch-mirrored-docs.ts`, `mirror-index.ts`) and Pagefind. This PRD extends both.
- [`prd-landing-example-selection.md`](./prd-landing-example-selection.md) — replaced the static landing demo with a live example selector. Complementary to this PRD: example selector shows nkido in action; OverviewGrid lists everything visitors can do once they install/open the IDE.
- `web/src/lib/docs/manifest.ts` (nkido repo) — upstream auto-generated docs manifest, regenerated when new pages land in Phase 1.
- `web/src/lib/docs/lookup.ts` (nkido repo) — F1 keyword index. Will be regenerated after Phase 1's content moves to keep keyword-anchor mappings accurate.
