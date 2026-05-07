# PRD: Docs Navigation Overhaul — Sidebar, TOC, and Content Gaps

> **Status: NOT STARTED** — Restructures `/docs/*` around a section-scoped left sidebar, a per-page right TOC, and breadcrumb navigation; replaces the current top-tab + hub-page model. Adds three pieces of net-new content (one concept, one cookbook, one migration guide) and expands the existing top-level `/getting-started` into a full install/first-run guide. Aligns frontmatter (upstream `nkido`) as the single source of truth for grouping, matching the philosophy of `prd-landing-overview-grid-v2.md`.
>
> **Why:** With ~50 docs across 3 sections, leaf-to-sibling navigation costs three clicks (back → scan hub-page card grid → click sibling); long reference pages have no in-page TOC; and three content gaps (cookbook, migration guide, unifying mental-model concept) push visitors back to GitHub or external blogs. A canonical doc-site layout — left sidebar + right TOC + breadcrumbs — fixes all of these without changing any URLs.

---

## 1. Executive Summary

The shipped docs section relies entirely on hub-page drill-down for navigation: `/docs` → `/docs/reference` → `/docs/reference/builtins` → `/docs/reference/builtins/filters`. Once the visitor is on a leaf page, the only way to a sibling page is to click the back link, scan the hub-page card grid, and re-enter. There is no canonical "doc tree on the left" view, and no in-page table of contents on long reference pages (e.g. `distortion` has nine H2 sections). For a docs section with ~50 markdown pages and ~80–110 sub-features cataloged in the v2 overview grid, this is the primary navigation gap users notice first.

This PRD restores the canonical doc-site layout — **left sidebar + content + right TOC** — and fills three small content gaps that currently force visitors back to GitHub or external blogs.

**Key decisions made during planning:**

- **Section-scoped sidebar.** Sidebar shows only the active section's tree (Concepts, Tutorials, or Reference). Switching sections happens via breadcrumbs at the top of the page, not via top tabs. The current top-tab bar is removed.
- **Sub-groups inside Reference, flat lists in Concepts & Tutorials.** Reference uses the existing `group`/`subgroup` manifest metadata to render two-level sub-grouping (e.g. `Builtins → Frequency → Filters`). Concepts and Tutorials are flat ordered lists driven by frontmatter `order`.
- **Frontmatter is the source of truth.** Sidebar structure is generated at build time from the existing `docs-manifest.json` plus a small per-section override file for ordering tweaks. Upstream concept/tutorial frontmatter gains a consistent `order:` field. This matches the v2 overview grid's philosophy: structure declared near the doc, not in a hand-maintained TS table on the website.
- **Right TOC, sticky with scroll-spy.** All leaf pages with ≥3 H2 headings render an auto-generated right-side TOC. The currently-visible heading is highlighted via `IntersectionObserver`.
- **Mobile: off-canvas drawer.** Sidebar collapses into a slide-in drawer triggered by a "Menu" button at the top of doc content. TOC collapses inline above the page on narrow widths.
- **Search moves into the sidebar header.** Pagefind trigger lives at the top of the sidebar (and inside the mobile drawer), replacing its current spot in the deleted top-tab bar.
- **Hub pages stay.** `/docs`, `/docs/concepts`, `/docs/tutorials`, `/docs/reference`, `/docs/reference/builtins` continue to render their card grids — the sidebar is an alternative navigation, not a replacement for landing pages.
- **New content: three docs + one expanded page.** "How to think in NKIDO" (concept), single-page "Cookbook", single-page "Migrating from Tidal / Strudel / SuperCollider" — all under existing sections (no new top-level). The existing top-level `/getting-started` is expanded into a full install/first-run guide; no install page inside `/docs`.

---

## 2. Current State

| Surface | Today | After this PRD |
|---|---|---|
| Docs nav (desktop) | Sticky horizontal tab bar at top: Concepts / Tutorials / Reference + Pagefind trigger | Breadcrumb at top + section-scoped left sidebar (260px) + right TOC (220px) |
| Docs nav (mobile) | Same tab bar, vertically stacked | Breadcrumb + "Menu" button → off-canvas drawer (sidebar) + collapsible inline TOC |
| Section switching | Click a top tab | Click a breadcrumb segment ("Docs" → hub) or a sidebar item from the hub page |
| Sibling navigation on leaf page | Back link → hub → click sibling card | Sidebar already shows all siblings; one click |
| In-page TOC | None | Auto-generated from H2/H3, sticky right column, scroll-spy active heading |
| Search | Top-right of tab bar | Top of sidebar (and inside mobile drawer); keyboard `/` still triggers |
| Reference grouping | Three flat hub pages: Builtins / Language / Mini-notation; each lists its docs in a card grid | Sidebar shows two-level tree using existing manifest `group`/`subgroup` (e.g. `Builtins → Frequency → Filters / Spectrum`) |
| Concepts grouping | Flat list of 3 cards | Flat sidebar list, ordered by frontmatter `order` |
| Tutorials grouping | Flat list of 5 cards | Flat sidebar list, ordered by frontmatter `order` |
| Hub pages | All exist (`/docs`, `/docs/concepts`, `/docs/tutorials`, `/docs/reference`, `/docs/reference/builtins`, `/docs/reference/language`, `/docs/reference/mini-notation`) | Unchanged in structure; layout shifts to leave room for sidebar |
| Sidebar persistence | N/A | Active branch auto-expanded; user collapse state persisted in `localStorage` |
| Net-new content | — | `/docs/concepts/thinking-in-nkido`, `/docs/tutorials/cookbook`, `/docs/tutorials/migrating`, expanded `/getting-started` |
| Frontmatter (upstream) | Concepts/tutorials have `order` inconsistently; reference has `group`, `subgroup`, `icon`, `tagline`, `subfeatures[]` from v2 | Concepts & tutorials gain consistent `order:` (and optional `subgroup:` ignored for now). Reference unchanged. |
| Top-tab `+layout.svelte` | Renders horizontal tabs + Pagefind | Replaced by a docs-shell layout: breadcrumb header + sidebar + content slot + TOC region |

### 2.1 What's broken about today

- **Leaf-to-sibling navigation costs three clicks** (back → scan → click). For a returning user looking up `bp` after reading `lp`, this is the dominant friction point. The v2 overview grid on the landing page mitigates this for first-time discovery, but doesn't help once you're inside `/docs`.
- **No in-page TOC** on long reference pages (Distortion has 9 H2 sections, Math has many sub-headings, Visualizations was split into 5 docs partly because its single-page TOC was unworkable).
- **Top tabs flatten the IA.** The tabs bar shows "Concepts / Tutorials / Reference" — but Reference itself has three sub-sections (Builtins / Language / Mini-notation), each with sub-groups (Frequency / Time-based / etc.). The tab bar exposes only the top level, so visitors discover sub-groups only after drilling in.
- **No persistent navigation surface** as visitors move between pages — every leaf page makes you re-acquire the "where am I" state.
- **Content gaps**: visitors coming from Strudel or SuperCollider have to guess at NKIDO's mental model; cookbook-style "give me a kick drum recipe" content lives only on the landing-page overview grid as one-line snippets, with no longer-form patches; the four existing concept docs (Signals, Hot-swap, Mini-notation — three today, plus the new Thinking-in-NKIDO) describe individual ideas but no doc explains how they fit together as a unified mental model.

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. **One-click sibling navigation.** From any leaf doc page, every other page in the same section is one click away via the sidebar.
2. **Section-scoped sidebar with sub-groups in Reference.** Driven by `docs-manifest.json` `group`/`subgroup` for Reference; flat list ordered by frontmatter `order` for Concepts and Tutorials.
3. **Right-side TOC on every leaf page with ≥3 H2s**, with sticky positioning and `IntersectionObserver`-based scroll-spy.
4. **Breadcrumb-driven section switching** replaces the current top-tab bar.
5. **Off-canvas mobile drawer** for the sidebar; TOC collapses inline at top of page on widths <1024px.
6. **Search lives at the top of the sidebar** (and inside the mobile drawer); `/` keybind unchanged.
7. **Frontmatter-driven structure.** Upstream concept/tutorial frontmatter gets a consistent `order:` field. No website-only TS sidebar tree to drift.
8. **Three new doc pages + one expanded page.** `/docs/concepts/thinking-in-nkido`, `/docs/tutorials/cookbook`, `/docs/tutorials/migrating`; expanded `/getting-started` (top-level, outside docs).
9. **Hub pages stay** as curated landing pages — they are the entry from the homepage and from Pagefind results that match section names. The sidebar is an additional navigation surface, not a replacement.
10. **Persistence:** Sidebar group expand/collapse state stored in `localStorage` per user (key `nkido:docs-sidebar:state`); active branch always auto-expanded on page load.

### 3.2 Non-Goals (explicit cuts, not "later")

1. **Versioned docs / docs for older NKIDO releases.** Single set of docs tracks `master`.
2. **Full-text search across the live IDE's reference docs panel.** Pagefind indexes only `nkido.cc` content; `live.nkido.cc` has its own panel-internal search.
3. **Sidebar-driven section switching** (e.g. a "Concepts / Tutorials / Reference" pill row inside the sidebar). Section switching is via breadcrumb only; the sidebar is always scoped to one section.
4. **Per-doc cross-references / "next/previous"** at the bottom of each page. The sidebar makes the next/previous concept implicit, but no auto-rendered footer nav in this PRD.
5. **Expanding sub-feature anchors into the sidebar tree** (the "2-level tree with subfeatures" option). Sidebar shows doc-level entries only; anchors are reachable via the right TOC.
6. **Per-page edit-on-GitHub link / "last updated" stamp.** Possible follow-up; not in this PRD.

### 3.3 Future Work (deferred, not non-goals)

- Sub-feature anchor entries inside the sidebar (e.g. expand `Filters` → `lp / hp / bp / moog / sallenkey`).
- "Coming from X" sub-section under Tutorials with one page per ecosystem.
- Per-recipe Cookbook pages (currently a single page).
- Versioned docs / multi-release docs.
- "Edit this page on GitHub" footer.

---

## 4. Information Architecture

### 4.1 Updated sitemap (changes only)

```
/getting-started               EXPANDED — full install/first-run guide
/docs/                         Hub (unchanged structure; layout shifts for sidebar)
├── concepts/
│   ├── signals/                  (unchanged)
│   ├── hot-swap/                 (unchanged)
│   ├── mini-notation/            (unchanged)
│   └── thinking-in-nkido/        NEW
├── tutorials/
│   ├── hello-sine/               (unchanged)
│   ├── synthesis/                (unchanged)
│   ├── filters/                  (unchanged)
│   ├── rhythm/                   (unchanged)
│   ├── testing-progression/      (unchanged)
│   ├── cookbook/                 NEW
│   └── migrating/                NEW
└── reference/                    (unchanged structure; sidebar exposes manifest sub-groups)
    ├── builtins/...
    ├── language/...
    └── mini-notation/...
```

No path changes to existing pages.

### 4.2 Breadcrumb structure

Breadcrumb renders at the top of every doc page (concept/tutorial/reference leaf, **not** hub pages). Format:

```
Docs / Reference / Builtins / Filters
```

Each segment is a clickable link. Last segment is the current page (rendered as plain text or `aria-current="page"`).

**Hub pages (`/docs`, `/docs/concepts`, `/docs/tutorials`, `/docs/reference`, `/docs/reference/builtins`, `/docs/reference/language`, `/docs/reference/mini-notation`)** keep their existing `<a href="/docs" class="back-link">All docs</a>` style "back" link; they don't render breadcrumbs (the back-link already says where you came from, and the page heading itself names the section).

### 4.3 Sidebar shape — per section

```
┌────────────────────────────┐
│  🔎 Search docs            │   ← Pagefind trigger (existing component, restyled)
├────────────────────────────┤
│  Concepts                  │   ← section title (links to /docs/concepts hub)
│    Signals and DAGs        │   ← ordered by frontmatter `order:`
│    Hot-swap explained      │
│    Mini-notation           │
│    How to think in NKIDO   │   NEW
└────────────────────────────┘

┌────────────────────────────┐
│  🔎 Search docs            │
├────────────────────────────┤
│  Tutorials                 │
│    Hello Sine              │
│    Synthesis               │
│    Filters                 │
│    Rhythm                  │
│    Testing progressions    │
│    Cookbook                │   NEW
│    Migrating               │   NEW
└────────────────────────────┘

┌────────────────────────────┐
│  🔎 Search docs            │
├────────────────────────────┤
│  Reference                 │
│  ▼ Builtins                │   ← top-level group
│    ▼ Synthesis             │   ← sub-group from manifest
│        Oscillators         │
│        FM synthesis        │
│        Soundfonts          │
│    ▼ Frequency             │
│        Filters             │
│        Spectrum            │
│    ▼ Time-based            │
│        Delays              │
│        Reverbs             │
│    ▼ Nonlinear             │
│        Distortion          │
│        Dynamics            │
│    ▼ Sources               │
│        Samplers            │
│        Samples loading     │
│        Audio input         │
│    ▼ Modulation            │
│        Modulation          │
│        Envelopes           │
│    ▼ Spatial               │
│        Stereo              │
│        Polyphony           │
│    ▼ Sequencing            │
│        Sequencing          │
│        Timelines           │
│    ▼ Visualizations        │
│        Waveform            │
│        Spectrum (viz)      │
│        Pianoroll           │
│        Oscilloscope        │
│        Waterfall           │
│    ▼ Utility               │
│        Utility             │
│        Math                │
│        State               │
│        Edge                │
│  ▼ Language                │   ← collapsed by default unless active
│    ▼ Syntax                │   ← sub-group `syntax` from manifest
│        Pipes               │
│        Operators           │
│        Variables           │
│        Closures            │
│        Conditionals        │
│        Methods             │
│        Arrays              │
│  ▼ Mini-notation           │
│    ▼ Patterns              │   ← sub-group `patterns` from manifest
│        Basics              │
│        Microtonal          │
│        Chords              │
└────────────────────────────┘
```

The exact `subgroup` labels above are illustrative — the canonical list is whatever the manifest currently emits (see §5.2). The sidebar **renders whatever sub-groups appear in the manifest**; it doesn't hard-code them. `language` and `mini-notation` each currently have a single sub-group (`syntax` and `patterns` respectively); rendering them as a sub-group of one keeps the tree shape uniform across the three top-level Reference sections.

### 4.4 Layout grid (desktop)

```
┌────────────────────────────────────────────────────────────────┐
│  Site Header  (logo, top nav, mobile hamburger)                │
├──────────┬───────────────────────────────────────────┬─────────┤
│          │  Docs / Reference / Builtins / Filters    │         │
│ Sidebar  ├───────────────────────────────────────────┤   TOC   │
│  260px   │                                           │  220px  │
│          │     Doc content                           │         │
│  (scroll │     (max-width 720px, fluid)              │  Sticky │
│  spies   │                                           │  scroll │
│  active  │                                           │  -spy   │
│  page)   │                                           │         │
│          │                                           │         │
└──────────┴───────────────────────────────────────────┴─────────┘
```

- Sidebar: fixed `260px` width, sticky to viewport top below the site header, scrolls independently when content overflows.
- Content: max-width `720px`, centered in available space between sidebar and TOC.
- TOC: fixed `220px` width, sticky to viewport top, scrolls independently. Hidden when the page has fewer than 3 H2s.

### 4.5 Layout grid (mobile / narrow widths)

| Width | Sidebar | TOC |
|---|---|---|
| `≥1280px` | Sticky 260px column | Sticky 220px column |
| `1024px–1279px` | Sticky 240px column | **Inline** above page content (collapsible `<details>`) |
| `768px–1023px` | Off-canvas drawer (button "Menu" pinned at top of content) | Inline above page content |
| `<768px` | Off-canvas drawer | Inline above page content |

- The off-canvas drawer: full-height left panel sliding in over content with a backdrop click-to-close, `Escape`-to-close, `aria-modal="true"`, focus trapped.
- Drawer trigger: a small `Menu` button rendered at the top-left of doc content on narrow widths, just above the breadcrumb, labeled `Docs menu`.

---

## 5. Sidebar Design

### 5.1 Data sources

The sidebar tree is built **at build time** by `scripts/build-sidebar.ts` (new) from two inputs:

1. **`src/lib/data/docs-manifest.json`** — generated by the upstream-mirror pipeline (`scripts/fetch-mirrored-docs.ts`); carries `title`, `slug`, `url`, `group`, `subgroup`, `order`, `keywords`, `headings` per entry. Used directly for Reference and Tutorials.
2. **`src/lib/data/docs-sidebar-overrides.ts`** (new, hand-curated) — a small object that:
   - Declares the order/labels for top-level Reference groups (`Builtins / Language / Mini-notation`) since these are not in the manifest itself.
   - Declares the order of sub-groups within each top-level Reference group when the alphabetical/frontmatter-order default isn't right.
   - Optional: declares an explicit ordering or label override for any individual entry (escape hatch).

Tutorials sidebar entries come from `manifest.entries['tutorials']` (already populated). **Concepts are not in the manifest today** — they live as local `+page.md` files at `src/routes/docs/concepts/*/+page.md` with no upstream `nkido` mirror. Phase 1 of this PRD extends `scripts/fetch-mirrored-docs.ts` (or adds a sibling local-index pass) to enumerate the local concept pages, parse their frontmatter via `gray-matter`, extract their headings, and emit a new `manifest.entries['concepts']` section with the same shape as `tutorials`. This keeps the build-sidebar step uniform across all four sections.

### 5.2 Sidebar generation

`scripts/build-sidebar.ts` runs as part of `bun run build` (called from the existing prebuild chain or directly from `vite.config.ts`). Output: `src/lib/data/docs-sidebar.json`.

```ts
// Shape of src/lib/data/docs-sidebar.json
type SidebarTree = {
  concepts:    SidebarLeaf[];                    // flat
  tutorials:   SidebarLeaf[];                    // flat
  reference: {
    builtins:        SidebarSubgroup[];          // grouped by `subgroup`
    language:        SidebarSubgroup[];          // grouped by `subgroup` (today: single `syntax` bucket)
    'mini-notation': SidebarSubgroup[];          // grouped by `subgroup` (today: single `patterns` bucket)
  };
};

type SidebarLeaf = {
  title: string;        // from manifest entry.title
  url: string;          // from manifest entry.url
  slug: string;         // for active-state matching
};

type SidebarSubgroup = {
  label: string;        // human-readable, e.g. "Frequency"
  slug: string;         // for collapse-state persistence, e.g. "frequency"
  entries: SidebarLeaf[];
};
```

The sidebar JSON nests under `reference.{builtins, language, 'mini-notation'}` rather than mirroring the manifest's flat keys (`reference/builtins`, `reference/language`, `reference/mini-notation`), because the sidebar is per-section and Reference is a single top-level section in this UI.

For all three Reference sub-trees: bucket entries by `entry.subgroup`. Order of buckets comes from `docs-sidebar-overrides.ts`; missing-from-override sub-groups go to the end alphabetically with a one-line warning during build (`tolerant build` per v2 PRD pattern). Within a bucket, entries are ordered by `entry.order`.

`reference/language` and `reference/mini-notation` each ship today with a single sub-group (`syntax` and `patterns` respectively). Rendering them as a sub-group of one keeps the SidebarSubgroup shape uniform across all three Reference sub-trees, and leaves room for future sub-grouping (e.g. splitting Language into `syntax` / `control-flow` / `data`).

### 5.3 Active state and persistence

- **Active page**: matched by exact `pathname === entry.url`; the `<a>` element gets `aria-current="page"` and a visual highlight (left border + bg).
- **Auto-expand active branch**: the sub-group containing the active page is expanded on initial render. (For `language` / `mini-notation`, no sub-groups exist, so this is a no-op there.)
- **Collapsed state persistence**: a JSON object stored at `localStorage['nkido:docs-sidebar:state']` keyed by sub-group slug, e.g. `{ "frequency": "open", "time-based": "closed" }`. Toggling a sub-group writes a new entry. On load, the saved state is merged with the auto-expand-active-branch rule: **active branch is always open regardless of saved state**. Other branches default to **closed** (saves vertical space; user opens what they want).
- **First-visit default**: with no `localStorage`, only the active branch is open. (Empty saved state = all closed except active.)

### 5.4 Visual design

- Section title (e.g. "Reference") is a non-clickable header **except** that clicking it scrolls the sidebar to top — minor nicety, not required.
- Top-level groups in Reference (`Builtins / Language / Mini-notation`): bold, with caret indicator (`▼` open, `▶` closed); clickable to toggle.
- Sub-groups (e.g. `Frequency`): smaller, slightly muted, with caret indicator; clickable to toggle.
- Leaf entries: indented, normal weight, hover state matches the existing `.tabs a:hover` (bg `--bg-tertiary`). Active leaf: left border accent (`--accent-primary`), bg `--bg-tertiary`, color `--text-primary`.
- Search trigger at top: same styling as today's `SearchBox.svelte` `.trigger` button, but full-width inside the sidebar header.

### 5.5 Component tree

```
src/routes/docs/+layout.svelte                    (rewritten)
├─ <DocsShell>                                     (new wrapper)
│  ├─ <DocsSidebar section="...">                  (new)
│  │  ├─ <SearchBox/>                              (existing, unchanged)
│  │  ├─ section header
│  │  └─ <SidebarTree data={...}>                  (new)
│  │     └─ <SidebarSubgroup>                      (new, recursive only one level)
│  │        └─ <SidebarLeaf>                       (new)
│  ├─ <DocsBreadcrumb segments={...}>              (new)
│  ├─ <slot/>  (page content)
│  └─ <DocsTOC headings={...}>                     (new)
└─ <MobileDrawer> wraps DocsSidebar on <1024px     (new, conditional render)
```

The breadcrumb segment list is computed in the layout from `page.url.pathname` against the manifest (so `/docs/reference/builtins/filters` → `[Docs, Reference, Builtins, Filters]`).

### 5.6 Section detection

`DocsShell` decides which sidebar tree to render by inspecting `page.url.pathname`:

| Pathname starts with | Sidebar tree |
|---|---|
| `/docs/concepts` | `concepts` |
| `/docs/tutorials` | `tutorials` |
| `/docs/reference` | `reference` (whole reference subtree) |
| `/docs` (and not above) | No sidebar — render hub layout (existing `+page.svelte` design with cards) |

The `/docs` hub gets a non-sidebar layout (full-width centered card grid) because it's the section-picker itself.

---

## 6. Right-Side TOC Design

### 6.1 What pages get a TOC

A leaf page renders a TOC iff it has **≥3 H2 headings**. H3s are nested under their preceding H2. H4+ are ignored.

For pages with 0–2 H2s, the TOC region is omitted; content + sidebar take the full width. (Most concept and tutorial pages will have a TOC; some short pages won't.)

### 6.2 Where the headings come from

`docs-manifest.json` includes a `headings` field per entry (extracted from the markdown body by `extractHeadings` in `scripts/fetch-mirrored-docs.ts`). The current shape is `string[]` (slugs only), which is insufficient for the TOC: the TOC needs the original heading text for display and the heading depth for nesting. **Phase 1 extends `extractHeadings` to return `{ slug, text, depth }[]`** and updates the manifest schema accordingly. Any current consumer of the old shape (e.g. the v2 overview chip resolver, if still alive) must be updated in the same change.

For pages built with `+page.md`, the new heading list is populated automatically. For `.svelte` content pages (e.g. concept/tutorial *hub* pages like `/docs/concepts/+page.svelte`), no heading list is emitted — hubs don't render a TOC.

For the new pages (Cookbook, Migrating, Thinking in NKIDO), we'll either:

- **Author them as `+page.md`** (preferred) — automatic heading extraction.
- **Or, if `.svelte`**, author the headings list manually and pass it to `<DocsTOC>` via prop.

The PRD specifies all three new pages as `+page.md` to keep the heading-extraction path uniform.

### 6.3 Render

The TOC component (`<DocsTOC>`) renders:

```
On this page
  Heading 1
    Sub-heading 1.1
    Sub-heading 1.2
  Heading 2
  Heading 3
```

- Sticky top, scrolls independently if it overflows viewport height.
- Each item is an `<a href="#slug">` linking to the heading anchor (slug from `github-slugger`, matching the existing manifest slugger).

### 6.4 Scroll-spy behavior

`IntersectionObserver` watches each `h2`/`h3` rendered by the doc body:

```ts
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        activeHeadingSlug = entry.target.id;
        return;
      }
    }
  },
  { rootMargin: '-30% 0px -55% 0px', threshold: 0 }
);
```

The TOC `<a>` with matching `slug` gets a `data-active="true"` attribute → CSS highlights it (left border + accent color). Only one active at a time.

`rootMargin` tuned so that headings activate as they reach the upper third of the viewport (reasonable for slow scrolls; standard pattern). If precision tuning is needed during implementation, it lands here.

### 6.5 Mobile / narrow widths

On widths `<1280px`, TOC is rendered **inline above the page content** as a `<details>` element labeled "Contents", **collapsed by default**. Clicking expands to show the same heading list. Scroll-spy still works (the active item is always visually highlighted, even when collapsed — when the user expands, they see where they currently are).

---

## 7. New Content

Three net-new doc pages. One existing top-level page is expanded.

### 7.1 `/docs/concepts/thinking-in-nkido` (NEW)

**Section:** Concepts.
**Frontmatter `order:`:** `4` (after Mini-notation).
**Length target:** ~600–900 words. Long enough to convey a unified mental model; short enough that a reader gets the whole picture in one sitting.
**Content outline:**

1. **The four pillars** — Signals, DAGs, Hot-swap, Patterns. One paragraph each, linking to the dedicated concept page.
2. **How they compose** — narrative walkthrough of a small patch that uses all four ideas (e.g. `osc("sin", "60 64 67 72") |> moog(%, env(lfo("saw", 1) * 1500 + 200, 0)) |> reverb(0.3) |> out()`), labelling each concept as it appears.
3. **Why this combination** — short justification: signals are the universal interface, DAGs make order-of-operations obvious, hot-swap enables exploratory composition, mini-notation removes the boilerplate of "create a clip, schedule events, …".
4. **What's *not* here** — nkido is not a beat-and-bar sequencer DAW; not a Max/MSP-style box-and-line UI; not a sample triggerer. Setting expectations before someone goes looking for these.
5. **Next steps** — one link to Hello Sine (tutorial entry), one link to the live IDE.

### 7.2 `/docs/tutorials/cookbook` (NEW, single page)

**Section:** Tutorials.
**Frontmatter `order:`:** `6` (after `testing-progression`).
**Length target:** ~1200–1800 words. Long-form single page — the user's choice.
**Structure:** Single page with H2 headings per recipe, ~12–18 recipes. Each recipe is:

```
## Kick drum

A short one-line description of what makes this a kick.

` ` ` akk
osc("sin", env({a:0, d:0.15, s:0, r:0}) * 60 + 30)
  * env({a:0, d:0.05, s:0, r:0}, gate)
  |> out()
` ` `

A sentence or two on why this works (e.g. pitch envelope from 60 Hz down to 30 Hz gives the punch; short amp envelope shapes the transient).
```

**Recipe set (initial, ~15 recipes):**

- *Drums:* Kick, Snare, Hi-hat (closed), Hi-hat (open), Clap.
- *Bass:* Sub-bass (sine), Acid bass (saw + moog), Pluck bass.
- *Pads:* Warm pad (filtered saw + reverb), Glassy pad (FM + chorus).
- *Effects:* Sidechain pump (env-driven amp), Granular cloud (samples + grain), Stereo widener.
- *Generative:* Random walk pitch (mini-notation `?`), Euclidean rhythm, Drone (sustained osc + slow LFO).

Final list selected during implementation; the PRD scopes "12–18 recipes covering drums / bass / pads / effects / generative".

The `referenceKeyword` frontmatter field (used by `DocPage.svelte` to render a "Reference: …" link in the page footer) is omitted — too many recipes touch too many references. Each recipe's code uses standard `<code>` blocks; the right TOC handles intra-page navigation.

### 7.3 `/docs/tutorials/migrating` (NEW, single page)

**Section:** Tutorials.
**Frontmatter `order:`:** `7` (after Cookbook).
**Length target:** ~1500–2200 words. Single page covering all three ecosystems via H2 sections.
**Structure:**

1. **Intro** — 2 paragraphs. Why these ecosystems specifically (overlap in audience).
2. **Quick comparison table** — 6–8 rows mapping: pattern syntax / signal flow / synthesis approach / sample handling / live-coding workflow / FX routing / state model.
3. **## Coming from Tidal** — pattern-language analogues, pure-tone synth differences, scheduling model, what doesn't translate.
4. **## Coming from Strudel** — closer to Tidal but JS-native; map Strudel's `.s()`, `.sound()`, `.cpm()` to NKIDO equivalents; explain that NKIDO does the synthesis whereas Strudel triggers samples by default.
5. **## Coming from SuperCollider** — different paradigm (server/client → DAG/host); SynthDef → NKIDO patch; pattern → mini-notation; `Pbind` → `osc("sin", "60 64 67 72")`-style.
6. **## What's missing if you migrate** — features each ecosystem has that NKIDO does not (yet): SuperCollider's deep server programmability, Tidal's enormous ecosystem of helper libraries, Strudel's web-based community-share workflow.

The `referenceKeyword` frontmatter field is set to `mini-notation` (the most likely landing reference page).

### 7.4 `/getting-started` (EXPANDED, top-level — outside `/docs`)

**Existing surface:** A "choose your path" page with three big cards (Web IDE, GitHub, CLI). No actual install/first-run instructions on the page itself.

**Expanded version:** Keep the three-card chooser at the top, **add full content sections below** it:

1. **Web IDE first run** — what to expect, browser requirements (recent Chrome/Firefox/Safari), audio permissions, the click-to-activate pattern.
2. **CLI install** — one section per platform (macOS via Homebrew tap or build-from-source; Linux build-from-source; Windows WSL or build-from-source). Each section: one or two commands, expected output, troubleshooting.
3. **First patch** — `nkido play hello.akk` (or whatever the v1 CLI verb is — copied from upstream README). 5-line example file.
4. **Next steps** — links to `/docs/tutorials/hello-sine`, `/docs/concepts/signals`, the live IDE, the GitHub repo.

This page lives at `/getting-started`, **not inside `/docs`**, per the answer to "where does install live". It does NOT get the docs sidebar — it's a top-level marketing/onboarding page using the existing layout.

It does, however, get a right-side TOC (same `<DocsTOC>` component, used in standalone mode) since it now has multiple H2 sections.

---

## 8. Frontmatter Schema (Upstream Changes)

The shipped reference frontmatter (per `prd-landing-overview-grid-v2.md`) already includes `group`, `subgroup`, `icon`, `tagline`, `subfeatures[]`, `order`, `keywords[]`. **No changes to reference frontmatter.**

The schema requirement on **concept** and **tutorial** frontmatter is `order:` (used to order the sidebar). Tutorials are mirrored from upstream `nkido`; concepts are website-local files (no upstream).

```yaml
---
layout: doc
title: Hello Sine
description: Your first patch...
backHref: /docs/tutorials
backLabel: Tutorials
referenceKeyword: osc        # existing — used by DocPage.svelte footer
category: tutorials           # existing — see naming note below
order: 1                      # REQUIRED, used to order the sidebar
keywords: [...]               # existing
---
```

**Current state — no migration PRs needed:** All 3 concept pages (signals, hot-swap, mini-notation) and all 5 tutorial pages (hello-sine, filters, synthesis, rhythm, testing-progression) already declare `order:` in frontmatter today. No upstream PRs against `nkido` are required. The build-sidebar step still tolerates missing values defensively (warn + assign by slug) so future entries don't break the build.

**`category:` naming note.** Concept frontmatter currently uses `category: concept` (singular) while tutorial frontmatter uses `category: "tutorials"` (plural). The build-sidebar step keys off the URL path, not `category`, so the divergence is cosmetic. As part of this PRD, normalize concept frontmatter to `category: "concepts"` (plural) for consistency.

**Tolerant build, per v2 pattern:** Missing `order:` → warn and assign default. Unknown `subgroup:` in reference (already shipped) → bucket into a "Misc" sub-group at end, per existing v2 logic.

---

## 9. Impact Assessment

| Component | Status | Notes |
|---|---|---|
| `src/routes/docs/+layout.svelte` | **Modified** | Replaced top-tab bar with sidebar + breadcrumb + TOC region. Renders `<DocsShell>`. |
| `src/routes/docs/+page.svelte` | Stays | Hub landing page — unchanged. (Detected via section-detection logic; renders without sidebar.) |
| `src/routes/docs/concepts/+page.svelte` | Stays | Card-grid hub. Content unchanged. |
| `src/routes/docs/tutorials/+page.svelte` | Stays | Card-grid hub. Content unchanged. (Should be updated to include the two new tutorials in the card grid.) |
| `src/routes/docs/reference/+page.svelte` | Stays | Card-grid hub. Unchanged. |
| `src/routes/docs/reference/builtins/+page.svelte` | Stays | DocIndex render, manifest-driven. Unchanged. |
| `src/routes/docs/reference/language/+page.svelte` | Stays | Same. |
| `src/routes/docs/reference/mini-notation/+page.svelte` | Stays | Same. |
| `src/lib/components/Docs/DocPage.svelte` | **Modified** | Add `headings` prop; render `<DocsTOC>` when ≥3 H2s. Existing `back-link` may be replaced by breadcrumb when inside the docs shell — see §11 Phase 2. |
| `src/lib/components/Docs/DocIndex.svelte` | **Modified** | Wrapped in docs shell layout (sidebar visible alongside it) when used under `/docs/reference/*`. |
| `src/lib/components/Docs/SearchBox.svelte` | Stays | Component unchanged; just rendered in a new location (sidebar header). The existing `.trigger` button styling is reused with a width override. **Current consumer:** only `src/routes/docs/+layout.svelte`. Moving it into the sidebar is a one-spot edit — no other call sites. |
| `src/lib/components/Docs/DocsShell.svelte` | **New** | Top-level wrapper combining sidebar + content + TOC + breadcrumb. |
| `src/lib/components/Docs/DocsSidebar.svelte` | **New** | Renders the section-scoped tree from the prebuilt JSON. |
| `src/lib/components/Docs/SidebarTree.svelte` | **New** | Recursive tree (one level deep for sub-groups). |
| `src/lib/components/Docs/DocsBreadcrumb.svelte` | **New** | Renders the segment list. |
| `src/lib/components/Docs/DocsTOC.svelte` | **New** | Renders right TOC + scroll-spy. |
| `src/lib/components/Docs/MobileDrawer.svelte` | **New** | Off-canvas wrapper for the sidebar on narrow widths. |
| `src/lib/data/docs-manifest.json` | **Modified (schema)** | Add a `concepts` entries section (populated from local `src/routes/docs/concepts/*/+page.md` by the extended fetch step). Change `headings` field shape from `string[]` to `{ slug, text, depth }[]` so the TOC has display text and nesting depth. |
| `src/lib/data/docs-sidebar.json` | **New** | Build artifact emitted by `build-sidebar.ts`. Committed (parity with `docs-manifest.json`). |
| `src/lib/data/docs-sidebar-overrides.ts` | **New** | Hand-curated order tweaks for top-level Reference groups + sub-groups. |
| `scripts/build-sidebar.ts` | **New** | Reads manifest + overrides, writes sidebar JSON. Wired into `package.json` build pipeline. |
| `package.json` | **Modified** | Add the build-sidebar step to the prebuild chain. |
| `src/routes/getting-started/+page.svelte` | **Modified** | Expanded with install + first-patch + next-steps content. Renders right TOC standalone. |
| `src/routes/docs/concepts/thinking-in-nkido/+page.md` | **New** | Concept page. |
| `src/routes/docs/tutorials/cookbook/+page.md` | **New** | Single-page cookbook. |
| `src/routes/docs/tutorials/migrating/+page.md` | **New** | Single-page migration guide. |
| `src/routes/sitemap.xml/+server.ts` | **Modified** | Add the three new doc URLs. |
| `scripts/fetch-mirrored-docs.ts` | **Modified** | (a) Extend `extractHeadings` to return `{ slug, text, depth }[]` and update the manifest writer accordingly. (b) Enumerate local concept pages under `src/routes/docs/concepts/*/+page.md` and emit them as `manifest.entries['concepts']`. |
| Concept frontmatter (`src/routes/docs/concepts/*/+page.md`) | **Modified** | Normalize `category: concept` → `category: "concepts"` (plural) for consistency with tutorials. |
| Pagefind index | Auto-rebuilt | New pages picked up by the existing postbuild Pagefind step. |

---

## 10. File-Level Changes

### 10.1 New files

| File | Purpose |
|---|---|
| `src/lib/components/Docs/DocsShell.svelte` | Layout wrapper (sidebar + content + TOC + breadcrumb regions). |
| `src/lib/components/Docs/DocsSidebar.svelte` | Section-scoped tree, search at top. |
| `src/lib/components/Docs/SidebarTree.svelte` | Recursive (one level deep) sub-group + leaf renderer. |
| `src/lib/components/Docs/DocsBreadcrumb.svelte` | Breadcrumb segment list, computed from pathname + manifest. |
| `src/lib/components/Docs/DocsTOC.svelte` | Right TOC, scroll-spy via `IntersectionObserver`. Also usable standalone (for `/getting-started`). |
| `src/lib/components/Docs/MobileDrawer.svelte` | Off-canvas drawer with backdrop, focus trap, esc-to-close. |
| `src/lib/data/docs-sidebar.json` | Build-time artifact: prebuilt sidebar tree per section. Generated, not committed. |
| `src/lib/data/docs-sidebar-overrides.ts` | Hand-curated reference top-level + sub-group ordering. |
| `scripts/build-sidebar.ts` | Reads manifest + overrides, emits `docs-sidebar.json`. |
| `src/routes/docs/concepts/thinking-in-nkido/+page.md` | New concept. |
| `src/routes/docs/tutorials/cookbook/+page.md` | New cookbook. |
| `src/routes/docs/tutorials/migrating/+page.md` | New migration guide. |

### 10.2 Modified files

| File | Change |
|---|---|
| `src/routes/docs/+layout.svelte` | Replace top-tab + Pagefind layout with `<DocsShell>` rendering sidebar + breadcrumb + slot + TOC. Detect section from pathname. |
| `src/lib/components/Docs/DocPage.svelte` | Accept and render `headings` (extracted from markdown at build time, or passed explicitly). When ≥3 H2s, render `<DocsTOC>`. Drop the `back-link` (breadcrumb supersedes) when inside the docs shell — render a no-op or guard with a prop. |
| `src/lib/components/Docs/DocIndex.svelte` | Same: drop `back-link` (breadcrumb supersedes) when rendered inside docs shell. |
| `scripts/fetch-mirrored-docs.ts` | Extend `extractHeadings` → `{slug,text,depth}[]`; emit `manifest.entries['concepts']` from local `+page.md` files. |
| `src/routes/docs/tutorials/+page.svelte` | Add Cookbook + Migrating to the card grid (manifest-driven; auto-includes once the new pages are mirrored). |
| `src/routes/docs/concepts/+page.svelte` | Add Thinking in NKIDO to the card grid (same — auto-included once the local concept-enumeration pass lands). |
| `src/routes/docs/concepts/*/+page.md` | Normalize `category: concept` → `category: "concepts"`. |
| `src/routes/getting-started/+page.svelte` | Expand with full install + first-patch sections; render `<DocsTOC>` standalone. |
| `src/routes/sitemap.xml/+server.ts` | Add three new URLs. |
| `package.json` | `prebuild` chain calls `bun run scripts/build-sidebar.ts` after the manifest build. |

### 10.3 Files explicitly NOT changed

- `src/lib/components/Layout/Header.svelte` — site-wide nav unchanged.
- `src/lib/components/Layout/Footer.svelte` — footer unchanged.
- `src/lib/data/docs-manifest.json` schema — already has everything needed; the new build-sidebar step is purely a consumer.
- `src/lib/components/Home/*` — landing page components unchanged.
- v2 overview grid (`OverviewGrid.svelte`, `OverviewCard.svelte`) — unchanged. (The sidebar and the overview grid are different surfaces with different goals; they coexist.)

---

## 11. Implementation Phases

### Phase 1 — Build pipeline + sidebar tree generation (no UI yet)

**Goal:** Land the build-sidebar step, the manifest-schema extensions, and the override file. Site behavior unchanged.

- **Extend `extractHeadings`** in `scripts/fetch-mirrored-docs.ts` to return `{ slug, text, depth }[]` instead of `string[]`. Update the manifest writer and the `headings` field type. Update any current consumer of the old shape (e.g. v2 overview chip resolver, if still alive) so the build doesn't break.
- **Enumerate local concept pages** in `scripts/fetch-mirrored-docs.ts` (or a sibling local-index pass): scan `src/routes/docs/concepts/*/+page.md`, parse frontmatter via `gray-matter`, extract headings, and emit a `manifest.entries['concepts']` section with the same shape as `tutorials`.
- **Normalize concept frontmatter:** rewrite `category: concept` → `category: "concepts"` across the 3 concept pages.
- Create `scripts/build-sidebar.ts`. Read `docs-manifest.json` + `docs-sidebar-overrides.ts` (the latter starts as a stub). Emit `src/lib/data/docs-sidebar.json` (committed to the repo, parity with `docs-manifest.json`).
- Wire into `package.json` prebuild (after manifest build, before `vite build`).
- Hand-roll the override file for reference top-level + sub-group ordering.
- (No upstream PRs needed — every concept and tutorial already declares `order:`. The build-sidebar step still tolerates missing values defensively.)

**Verification:** `bun run build` succeeds; `docs-sidebar.json` is emitted with the expected shape (concepts ⨯ 4 entries, tutorials ⨯ 7 entries, all three Reference sub-trees with sub-groups); manifest's `headings` field is the new shape; warnings logged for any missing frontmatter.

### Phase 2 — Layout components + breadcrumb (sidebar visible, TOC not yet)

**Goal:** Visitors see the new layout. Breadcrumb replaces top tabs.

- Create `DocsShell.svelte`, `DocsSidebar.svelte`, `SidebarTree.svelte`, `DocsBreadcrumb.svelte`, `MobileDrawer.svelte`.
- Rewrite `src/routes/docs/+layout.svelte` to use `DocsShell`. Section detection via `page.url.pathname`. `/docs` itself renders without a sidebar.
- Update `DocPage.svelte` and `DocIndex.svelte` to **suppress the `back-link`** when rendered inside the docs shell (the breadcrumb supersedes it). One option: add a `<svelte:context>` or a Svelte 5 context-API value `inDocsShell: true`; child detects and skips.
- Wire Pagefind `<SearchBox>` into the sidebar header. Remove from old top-tab bar location. (`SearchBox` is currently only consumed by `src/routes/docs/+layout.svelte`, so this is a one-spot edit.)
- Implement `localStorage` persistence (`nkido:docs-sidebar:state`).
- Off-canvas drawer: build, test escape close, click-outside close, focus trap, `aria-modal`.

**Verification:** Browse `/docs/reference/builtins/filters` → sidebar shows full Reference tree, Frequency sub-group auto-expanded, Filters highlighted. Click another sub-group → toggles. Reload → state preserved. Mobile width → drawer button appears, opens drawer, closes with backdrop click / esc.

### Phase 3 — Right TOC + scroll-spy

**Goal:** Every leaf doc page with ≥3 H2 has a working right-side TOC.

- Create `DocsTOC.svelte`. Accepts `headings: { slug, text, depth }[]` prop. Renders sticky list. `IntersectionObserver` highlights the active heading.
- Modify `DocPage.svelte` to pass headings into `DocsTOC` (sourced from the manifest's `headings` field — already populated).
- Implement narrow-width inline TOC (`<details>` collapsible above the page) for widths <1280px.

**Verification:** On `/docs/reference/builtins/distortion` (9 H2s), TOC renders all 9, scroll-spy follows. On `/docs/concepts/signals` (long page with multiple H2s), same. On a short page (<3 H2s), TOC region is omitted; content gets full width. Resize browser → TOC collapses inline at 1280px → drawer button appears at 1024px → both still work.

### Phase 4 — New content

**Goal:** Three new pages live; existing top-level `/getting-started` expanded.

- Author `src/routes/docs/concepts/thinking-in-nkido/+page.md`. Confirm sidebar picks it up.
- Author `src/routes/docs/tutorials/cookbook/+page.md` with 12–18 recipes per §7.2.
- Author `src/routes/docs/tutorials/migrating/+page.md` per §7.3.
- Expand `src/routes/getting-started/+page.svelte` per §7.4. Render `<DocsTOC>` standalone.
- Update `src/routes/sitemap.xml/+server.ts` with the three new URLs.

**Verification:** Pagefind picks up the new pages (rebuild + search). Sidebar shows them. Each renders cleanly. Hub pages (concepts, tutorials) auto-include them via the manifest-driven card grid.

### Phase 5 — Polish

- Light-mode + dark-mode visual review of sidebar and TOC.
- A11y: keyboard nav through sidebar (tab, enter to expand/collapse, arrow keys not required but nice to have); breadcrumb has correct `aria-label="breadcrumb"`; drawer focus-trap; TOC has `aria-label="On this page"`.
- Lighthouse + axe pass on `/docs/reference/builtins/filters` (representative leaf page) and `/getting-started`.
- Pagefind smoke-test: search "kick" → finds Cookbook; search "tidal" → finds Migrating; search "DAG" → finds Signals + Thinking in NKIDO.

---

## 12. Edge Cases

### 12.1 A doc has no sub-group declared in the manifest

- **Today:** the v2 overview grid drops it into a "Misc" bucket with a build warning.
- **Sidebar behavior:** same. New entries without `subgroup:` go into a `Misc` sub-group, rendered last in the sidebar tree, with a build warning. Override file can promote them into the right group on the next iteration.

### 12.2 An entry's `order:` collides with another entry's `order:`

- **Behavior:** stable secondary sort by `slug`. Build warning logged so the human notices and fixes it.

### 12.3 A page exists in routes but isn't in the manifest

- **Cause:** local `.md` page that the build pipeline didn't pick up (e.g. authored directly in the website repo without a manifest update).
- **Behavior:** the page renders fine (SvelteKit routes from the filesystem), but it doesn't appear in the sidebar. Build emits a warning when it sees a route with no manifest entry. Fix is to ensure the manifest pipeline picks it up.

### 12.4 The active page isn't in the sidebar tree at all

- **Possible cause:** a page added after the last build, or a bug.
- **Behavior:** sidebar renders normally with no active highlight. Page still works; user can navigate via breadcrumb. No crash.

### 12.5 Sidebar would push content below 600px on narrow desktops (e.g. 1024px)

- **Behavior:** at `≤1023px`, sidebar becomes drawer. At `1024–1279px`, sidebar is `240px` (slightly tighter) and TOC moves inline. At `≥1280px`, full three-column layout with `260px / fluid / 220px`.

### 12.6 Page has H2s but no IDs

- **Cause:** content authored as Svelte HTML without slugifying. Should not happen for `+page.md` pages.
- **Behavior:** the manifest's `headings` extraction skips them; TOC is blank or omitted (depending on count). For `.svelte` content pages, manual headings prop required (per §6.2); document this in component JSDoc.

### 12.7 `localStorage` is unavailable (private browsing, quota)

- **Behavior:** sidebar falls back to the default state (active branch open, others closed) on every load. Toggle interactions still work in-session; just don't persist across reloads.

### 12.8 User navigates via in-page anchor link (not via TOC)

- **Behavior:** scroll-spy still picks it up via `IntersectionObserver`. TOC active state updates within ~one scroll frame.

### 12.9 Print stylesheet

- Sidebar and TOC are hidden on print (CSS media query). Only content + breadcrumb print. Out of scope to deeply optimize, but noted so we set `display: none` on print.

### 12.10 Reduced motion

- Sub-group expand/collapse animation respects `prefers-reduced-motion: reduce` — sets transition to `none`. Drawer slide-in similarly.

### 12.11 Hub pages with sidebar visible

- `/docs/concepts` (hub) — does the sidebar show the Concepts tree alongside the card grid?
- **Decision:** **yes**. The sidebar is part of the docs shell. On `/docs/concepts`, sidebar shows Concepts tree with no active highlight; the page content is the card grid. This is consistent with leaf pages and avoids a layout jump when navigating from leaf to hub.
- The sole exception is `/docs` itself (the section-picker hub), which renders **without** a sidebar — the page already serves as the section picker.

### 12.12 Right TOC on a page with many H3s under one H2

- **Behavior:** flatten visually if the H3 list is long (>10). Render H2 only and let users scroll within the section. For now, render all H2/H3 and let CSS overflow handle it (max-height + scroll inside the TOC). Acceptable v1.

### 12.13 Existing `referenceKeyword` footer on `DocPage`

- The "Reference: `osc` →" footer link rendered by `DocPage.svelte` based on `referenceKeyword` frontmatter is **kept**. It's a content-side affordance complementary to the sidebar.

---

## 13. Testing & Verification Strategy

### 13.1 Build-time tests

- `bun run build` succeeds on a clean checkout.
- `docs-sidebar.json` is generated and contains:
  - `concepts` array with all 4 concept entries (3 existing + Thinking in NKIDO).
  - `tutorials` array with all 7 tutorial entries (5 existing + Cookbook + Migrating).
  - `reference.builtins` with sub-groups matching the manifest.
  - `reference.language` with a single `syntax` sub-group containing all 7 language entries.
  - `reference.mini-notation` with a single `patterns` sub-group containing all 3 mini-notation entries.
- `docs-manifest.json` `headings` field is the new `{ slug, text, depth }[]` shape on every entry.
- Build logs no unexpected warnings (one warning per genuinely-missing-frontmatter entry is acceptable).
- `bun run check` (svelte-check) passes with no new errors.

### 13.2 Unit tests (Vitest)

- `scripts/build-sidebar.ts` has a unit test exercising:
  - Manifest with all expected fields → correct tree shape.
  - Manifest with a missing `subgroup` on a Reference entry → entry lands in `Misc` sub-group, warning logged.
  - Manifest with missing `order:` on a Concepts entry → entries sort by slug, warning logged.
  - Override file declares a sub-group order → tree respects it.
- `DocsBreadcrumb` segment computation: given pathname `/docs/reference/builtins/filters` + manifest, breadcrumb computes `[Docs, Reference, Builtins, Filters]` with correct hrefs (`/docs`, `/docs/reference`, `/docs/reference/builtins`, current). Catches off-by-one segment and href-construction errors cheaply.
- `DocsTOC.svelte` heading-extraction logic (if extracted into a helper): given a list of `{ slug, text, depth }`, produces the right nested structure (H3s nested under preceding H2; H4+ ignored).

### 13.3 E2E / manual verification

| Scenario | Expected |
|---|---|
| Visit `/docs/reference/builtins/filters` on desktop | Sidebar shows Reference tree; `Frequency` open; `Filters` highlighted. Breadcrumb reads `Docs / Reference / Builtins / Filters`. TOC shows H2s of the page. |
| Click `Distortion` in sidebar | Routes to `/docs/reference/builtins/distortion`. Sidebar `Frequency` collapses; `Nonlinear` expands; Distortion highlighted. |
| Toggle `Time-based` group manually | Visible immediately; persists across reload (`localStorage`). |
| Resize to 1023px | Sidebar collapses to drawer; "Menu" button appears at top-left of content. TOC moves inline at top of page (collapsed `<details>`). |
| Open mobile drawer | Backdrop appears; clicking sidebar items navigates; backdrop click / Esc closes; focus is trapped while open. |
| Press `/` anywhere | Pagefind modal opens (existing behavior, unchanged). |
| Click `Docs` in breadcrumb | Routes to `/docs` hub. Sidebar disappears (per §12.11). |
| Visit `/getting-started` | Standalone TOC renders. No docs sidebar (it's not under `/docs`). |
| Disable JS | Sidebar still renders (it's part of the prerendered HTML); active state via path matching works. Toggle (collapse/expand) doesn't work — sub-groups render in their default state. TOC renders without scroll-spy active state. Acceptable. |
| Lighthouse on `/docs/reference/builtins/filters` | Performance ≥ 90, A11y ≥ 95, no new violations. |
| axe DevTools on the same page | No critical or serious issues. |
| `prefers-reduced-motion: reduce` | Sub-group expand/collapse and drawer slide animations are disabled. |

### 13.4 Pagefind verification

- After build: `bun run preview`, search `kick` → top result is Cookbook with the relevant excerpt.
- Search `tidal` → top result is Migrating.
- Search `DAG` → top result is Signals; Thinking in NKIDO appears in the top 5.
- Search a deep reference term like `bitcrush` → top result is `/docs/reference/builtins/distortion#bitcrush` (existing behavior, unchanged).

### 13.5 Cross-browser

- Chrome (latest), Firefox (latest), Safari (latest). Mobile Safari + Chrome on Android.
- The off-canvas drawer focus trap should work in all four. `IntersectionObserver` is supported everywhere we care about (no polyfill needed).

---

## 14. Open Questions

None at draft time — all design choices specified above. Items below are explicit deferred work, not unresolved questions.

- **Sub-feature anchors in the sidebar** (e.g. expand `Filters` → `lp / hp / bp / moog`): deferred to a follow-up. Tracked as future work in §3.3.
- **"Edit on GitHub" page footer**: deferred. Not in this PRD.
- **Versioned docs**: explicit non-goal §3.2.
- **Per-recipe pages for the cookbook**: deferred. Single page is the v1 — future work can split if recipe count outgrows it.

---

## 15. Summary

This PRD reshapes `/docs` around the canonical doc-site layout: section-scoped left sidebar, breadcrumb top, scroll-spy right TOC, and an off-canvas mobile drawer — replacing the top-tab + hub-only navigation that ships today. Sidebar structure is generated from the existing manifest plus a small per-section override file, so `prd-landing-overview-grid-v2.md`'s "frontmatter is the source of truth" principle extends consistently into navigation. Three net-new pages (`thinking-in-nkido`, `cookbook`, `migrating`) and an expanded top-level `/getting-started` close the most-cited content gaps without inflating the IA.

Implementation is staged across five phases: build pipeline → layout shell → TOC → content → polish. Each phase is independently shippable; users see working, useful surface after each.
