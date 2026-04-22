# PRD: nkido.cc Launch Hardening

> **Status: NOT STARTED** — Launch-blocker polish pass following [`prd-project-website.md`](./prd-project-website.md). Every item in this PRD must land before public launch.

---

## 1. Executive Summary

Project-website v1 (per `prd-project-website.md`) shipped the SvelteKit scaffold, all routes, the launch blog post, mobile nav, sitemap, and a click-to-activate `LiveEmbed` placeholder. Five categories of work were explicitly deferred. This PRD closes them as a single launch-blocker pass.

Key decisions made during planning:

- **Scope is website-only.** The live-app changes from v1 §8 (`/embed` route, `?docs=<keyword>` deep-links, COEP/COOP/CSP wiring on `live.nkido.cc`) are **dropped from the launch path entirely**, not just deferred to the nkido repo. The `LiveEmbed` iframe is replaced with a static annotated screenshot + CTA. Concept-doc footers stop pointing at `live.nkido.cc/?docs=...` and instead link to mirrored reference pages on `nkido.cc`.
- **Reference docs are mirrored on `nkido.cc`** (promoted from v1 §17.1) — fetched at build time from `nkido/web/static/docs/{reference,tutorials}/` via raw GitHub URLs. URL structure: `/docs/reference/<category>/<slug>` and `/docs/tutorials/<slug>`. Single source of truth remains the upstream files.
- **Cross-docs search ships with Pagefind** (promoted from v1 §17.4) — build-time static index, lazy-loaded WASM, covers concepts + tutorials + reference.
- **mdsvex big-bang migration**: existing hand-written concept and blog content moves from `.svelte`-with-inline-HTML into `.md` files with frontmatter, picked up by mdsvex. The mirrored content uses the same convention so authoring is uniform.
- **Hand-written hello-sine tutorial is replaced by the upstream mirror.** Concept pages stay hand-written (upstream has only `signals.md`; the rest are nkido.cc-specific intros for first-time visitors).
- **CI gating becomes blocking**: Lighthouse CI (≥95 in all four categories on the four pages from v1 §14.1) and lychee link checker block PR merges.
- **Single hand-designed `og-image.png`** referenced by every route. No per-route generation.
- **Three dev-journal blog posts** ship with launch (Hot-swap deep-dive, Stereo support design, ESP32 port story) plus the existing launch post.
- **GitHub Releases auto-fetch** runs at build time; release posts live at `/blog/releases/<tag>`. Falls back to the last-committed `releases.json` if the API fails.
- **Code of Conduct**: adopt Contributor Covenant 2.1. **CONTRIBUTING.md**: fetched at build time from `nkido` master with last-known-good fallback (matches v1 §12 Edge Case 8).
- **Godot/ESP32 pages get a content beef-up** but stay text-only — screenshots are explicitly out of scope for this pass.

---

## 2. Current State

What v1 delivered vs. what this PRD changes.

| Surface | After v1 (today) | After this PRD |
|---|---|---|
| Landing demo | `LiveEmbed` click-to-activate iframe pointing at `live.nkido.cc/embed` (route does not exist) | Static annotated screenshot of the IDE + "Try it on `live.nkido.cc`" CTA |
| Concept docs | 3 hand-written `.svelte` pages (signals, hot-swap, mini-notation) with footer links to `live.nkido.cc/?docs=...` | Same 3 pages converted to `.md` (mdsvex); footers link to mirrored reference pages on `nkido.cc` |
| Tutorial docs | 1 hand-written `.svelte` page (hello-sine) | All 5 tutorials mirrored from `nkido/web/static/docs/tutorials/` (overwrites the hand-written hello-sine) |
| Reference docs | None on `nkido.cc`; v1 plan was to deep-link into the live IDE | 13+ reference pages mirrored from `nkido/web/static/docs/reference/{builtins,language,mini-notation}/`, served at `/docs/reference/<category>/<slug>` |
| Search | None | Pagefind across all docs (concept + tutorial + reference) |
| Blog | 1 launch post + index | 1 launch post + 3 dev-journal posts + auto-rendered GitHub Releases at `/blog/releases/<tag>` |
| OG image | `<meta og:image>` references `/og-image.png` but the file does not exist | One hand-designed `static/og-image.png` (1200×630) used by every route |
| CI | None beyond `bun run check`/`bun run build` succeeding | Lighthouse CI + lychee link checker, both blocking on PRs |
| Community page | Self-contained vendored content | Renders fetched `CONTRIBUTING.md` from `nkido` master; CoC link points to vendored Contributor Covenant 2.1 |
| Godot / ESP32 pages | Skeleton install + status banner + 3-line code samples | Real GDScript + ESP-IDF samples, full pin/control map, troubleshooting section, link tree (still no screenshots) |
| `live.nkido.cc/embed` | Specified in v1 §8, not built | **Out of scope** — see §3.2 |
| Docs URL deep-link `?docs=<keyword>` | Specified in v1 §8, not built | **Out of scope** — see §3.2 |

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. **Replace the dead-iframe placeholder** on the landing page with a working static demo so Goal 2 from v1 ("show, don't tell") is met without depending on cross-origin iframe negotiations.
2. **Mirror reference + tutorial docs** on `nkido.cc` so the full opcode/builtin reference is SEO-indexable and reachable without loading the WASM IDE.
3. **Add cross-docs search** so concept + tutorial + reference content is discoverable from a single search box on the website.
4. **Migrate authored content to mdsvex** so future content (blog posts, new concepts, mirrored docs) is plain markdown with frontmatter, not HTML-in-Svelte.
5. **Land enough launch content**: real `og-image.png`, 3 dev-journal posts, beefed-up Godot/ESP32 pages, Contributor Covenant 2.1, fetched `CONTRIBUTING.md`.
6. **Block regressions in CI**: Lighthouse CI + lychee both fail PRs that drop the launch quality bar.

### 3.2 Non-Goals (hard cuts — not "later")

These are **explicit scope exclusions** for the launch path. Some appear in v1 and remain hard cuts; others are downgraded from v1 §8 / §17.

1. **`live.nkido.cc/embed` route, `?docs=<keyword>` deep-links, COEP/COOP/CSP wiring on the live app** — v1 §8 specified these so the iframe and reference deep-links would work. With the iframe replaced by a static screenshot and the reference docs mirrored on `nkido.cc`, **none of those changes are required for launch**. They may be revisited in a separate live-app PRD post-launch.
2. **Per-route OG images / programmatic OG generation** (e.g. via `@vercel/og`, satori) — single hero image only.
3. **Screenshots on `/godot` and `/esp32`** — content beef-up is text-only.
4. **`docs.nkido.cc` as a separate site** — see v1 §17.2; still deferred.
5. **Versioned docs** — see v1 §17.5; still deferred.
6. **Auto-capture of Godot/ESP32 screenshots via Playwright headless** — considered, dropped as overkill.
7. **Newsletter / accounts / second IDE** — carried over from v1 §3.2; remain hard cuts.

### 3.3 Target Experience (deltas from v1 §3.3)

The three journeys from v1 §3.3 stay in force; this PRD changes how two of them are realized.

**Journey A (first-time visitor) — change**: instead of a click-to-activate iframe playing audio in place, the landing page now shows an **annotated screenshot** of the IDE (code on the left, signal visualizer on the right, with three labeled call-outs: pattern source, hot-swap indicator, audio output). The CTA "Try it on live.nkido.cc →" sits directly under the screenshot. Acceptance still: "at ~8–10s of reading the visitor can state what nkido is."

**Journey B (Godot dev) — change**: with the page beefed up (real GDScript, full troubleshooting), the 30-second decision target now requires the visitor to scroll one screenful past the install block. Verified by the install-decision test in v1 §14.2 — re-run after the beef-up lands.

**Journey C (returning user)** — unchanged.

**New Journey D (someone searching for `karplus_strong`)**:

1. Lands on `nkido.cc` from a search engine query for `nkido karplus_strong`.
2. SEO surface = mirrored reference page `/docs/reference/builtins/synthesis` (or wherever karplus_strong lives in the upstream tree).
3. **Within 3s** of arrival, can find the function signature + usage example.
4. Outcome: reference is reachable without the WASM IDE; SEO indexes mirrored content.

---

## 4. Architecture

### 4.1 Reference + tutorial mirror pipeline

```
                ┌──────────────────────────────────────────────┐
                │  github.com/mlaass/nkido (master)            │
                │                                              │
                │  web/static/docs/                            │
                │   ├── reference/                             │
                │   │   ├── builtins/   (13 .md files)         │
                │   │   ├── language/                          │
                │   │   └── mini-notation/                     │
                │   └── tutorials/      (5 .md files)          │
                └──────────────────────────────────────────────┘
                                    │
                  raw.githubusercontent.com/...
                                    │
                                    ▼
                ┌──────────────────────────────────────────────┐
                │  scripts/fetch-mirrored-docs.ts              │
                │  - Reads MIRROR_INDEX (hand-maintained list  │
                │    of file paths to fetch).                  │
                │  - GETs each via raw URL, with GITHUB_TOKEN. │
                │  - Verifies each has YAML frontmatter.       │
                │  - Writes to:                                │
                │      src/routes/docs/reference/<cat>/<slug>/ │
                │        +page.md                              │
                │      src/routes/docs/tutorials/<slug>/       │
                │        +page.md                              │
                │  - On fetch failure: keeps existing fallback │
                │    files committed under                     │
                │    static/_mirror-fallback/ and copies them  │
                │    into the routes tree, then prints a       │
                │    loud warning. Build does NOT fail (so a   │
                │    GitHub outage doesn't block deploys).     │
                │  - On frontmatter validation failure:        │
                │    fails the build loudly.                   │
                └──────────────────────────────────────────────┘
                                    │
                                    ▼
                ┌──────────────────────────────────────────────┐
                │  SvelteKit + mdsvex: prerender each          │
                │  +page.md → static HTML.                     │
                └──────────────────────────────────────────────┘
```

**Run timing**: `prebuild` and `predev` scripts in `package.json` run `fetch-mirrored-docs.ts` before every build and dev start. This makes the mirror invisible to contributors — `bun run dev` works out of the box.

**Source-of-truth contract**: the PRD explicitly forbids editing files under `src/routes/docs/reference/**/+page.md` or `src/routes/docs/tutorials/**/+page.md` directly. They are gitignored except for the fallback copies under `static/_mirror-fallback/`.

**Fallback behavior** (matches v1 §12 Edge Case 8 spirit but inverted):

- v1 said "fail the build loudly if CONTRIBUTING.md fetch fails." That stays for `CONTRIBUTING.md` (single file, recovery is obvious).
- For the mirror, failing the build on every GitHub blip is too brittle — there are 18+ files. Instead: **on fetch failure, log loudly and use the committed fallback**. Build proceeds. This means a stale-but-working site survives a GitHub outage.

### 4.2 Search (Pagefind)

```
build/             ← SvelteKit static output
  ├── docs/
  │   ├── concepts/...
  │   ├── tutorials/...
  │   └── reference/...
  └── ...
       │
       │   pagefind --site build  (postbuild hook)
       ▼
build/pagefind/    ← Pagefind index + WASM, lazy-loaded
```

- **Index scope**: everything under `/docs/` is indexed. Marketing pages (`/`, `/godot`, `/esp32`, `/getting-started`) are excluded via `data-pagefind-ignore` on their root layout.
- **UI**: a search box in the docs sub-layout (`src/routes/docs/+layout.svelte`) that opens a modal when clicked or when the user presses `/`. Component: `src/lib/components/Docs/SearchBox.svelte`.
- **Bundle cost**: ~50 KB JS for the launcher; the WASM index is fetched on first interaction only.

### 4.3 Landing demo replacement

Replaces `src/lib/components/Home/LiveEmbed.svelte` with `src/lib/components/Home/LandingDemo.svelte`:

```
┌──────────────────────────────────────────────────────────┐
│                Try it in your browser →                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────┐   ┌──────────────────────┐  │
│  │ // hello-sine.akk      │   │   ▒▒▒▒▒▒▒░░░░░░      │  │
│  │ osc('sin', 440) * 0.3  │ ① │  ▒▒▒░▒░▒░▒░░▒░░▒    │  │
│  │   |> out()             │   │   ▒▒▒░░░░░░░░░░     │  │
│  │                        │   │      ② signal viz   │  │
│  │ // hot-swap with: ✓    │   │                     │  │
│  │ osc('sin', 660) * 0.3  │ ③ │  ▶ playing — 0:08    │  │
│  │   |> out()             │   │                     │  │
│  └────────────────────────┘   └──────────────────────┘  │
│                                                          │
│  ① Pattern source     ② Real-time signal viz            │
│  ③ Hot-swap preserves phase across edits                │
│                                                          │
│  [ Try it on live.nkido.cc → ]   [ See on GitHub ]      │
└──────────────────────────────────────────────────────────┘
```

The screenshot itself lives at `static/landing-demo.png` (and a `@2x` retina variant). Rendered via plain `<picture>` + `<source>`. Annotated overlays are HTML/CSS, not baked into the image, so they remain readable on dark/light themes and at small viewports.

### 4.4 CI gating

```
PR opened
   │
   ▼
GitHub Actions (.github/workflows/ci.yml)
   │
   ├── bun install + bun run check              (existing)
   ├── bun run build                            (existing)
   ├── lychee --base build/ build/**/*.html     (NEW, blocking)
   └── lhci autorun                             (NEW, blocking)
            └── routes: /, /getting-started, /godot, /esp32
            └── thresholds: perf ≥ 95, a11y ≥ 95,
                            seo ≥ 95, best-practices ≥ 95
```

- Lychee config in `lychee.toml` at repo root. Internal links checked against the build output; external links only checked for the nkido / godot / esp32 / ko-fi / sponsors URLs (don't ping the whole world).
- Lighthouse CI config in `lighthouserc.json`. Runs against the built static site served by `bun run preview`.

---

## 5. Tech Stack Additions

| Tool | Purpose | Where |
|---|---|---|
| `mdsvex` | Markdown preprocessor for `+page.md` files | `svelte.config.js` |
| `pagefind` | Static search index + lazy WASM | `package.json` postbuild script |
| `gray-matter` | YAML frontmatter parsing in fetch script | `scripts/fetch-mirrored-docs.ts` |
| `shiki` | Syntax highlighting (mdsvex highlighter) | `svelte.config.js` mdsvex config |
| `@lhci/cli` | Lighthouse CI runner | dev dep, GH Actions |
| `lychee` | Link checker | GH Actions install (binary) |

`marked` from v1 §9.1 is no longer needed — mdsvex covers all markdown rendering, and the fetch script just validates frontmatter and writes the body back out for mdsvex to consume.

---

## 6. Frontmatter Convention

All `+page.md` files (hand-written and mirrored) use this frontmatter shape so the same DocPage layout, sidebar, and Pagefind metadata work uniformly:

```yaml
---
title: Delays
description: Echo, comb, and tap-delay primitives.
category: builtins         # for reference: builtins | language | mini-notation
                           # for tutorials: tutorial
                           # for concepts: concept
                           # for blog: post
order: 5                   # display order within the category
keywords: [delay, delay_ms, tap_delay, echo, feedback]
referenceKeywords: [delay, delay_ms]   # optional, for cross-doc back-links
---
```

The mirror fetch script enforces these fields on every fetched file. Hand-authored files are checked at build time by a small `scripts/validate-frontmatter.ts` that runs in `prebuild`.

---

## 7. Impact Assessment

| Component | Status | Notes |
|---|---|---|
| `src/routes/+page.svelte` | **Modified** | Swap `<LiveEmbed>` for `<LandingDemo>`. |
| `src/lib/components/Home/LiveEmbed.svelte` | **Removed** | Superseded by `LandingDemo.svelte`. |
| `src/lib/components/Home/LandingDemo.svelte` | **New** | Static screenshot + annotated overlay + CTA. |
| `src/lib/components/Docs/DocPage.svelte` | **Modified** | Reference footer now links to `/docs/reference/<category>/<slug>` not `live.nkido.cc/?docs=...`. |
| `src/lib/components/Docs/SearchBox.svelte` | **New** | Pagefind UI component. |
| `src/routes/docs/+layout.svelte` | **New** | Docs sub-layout with sidebar + search box. |
| `src/routes/docs/concepts/{signals,hot-swap,mini-notation}/+page.svelte` | **Removed** | Replaced by `+page.md`. |
| `src/routes/docs/concepts/{signals,hot-swap,mini-notation}/+page.md` | **New** | mdsvex-authored, content unchanged. |
| `src/routes/docs/tutorials/hello-sine/+page.svelte` | **Removed** | Hand-written version replaced by mirrored upstream. |
| `src/routes/docs/tutorials/<slug>/+page.md` (×5) | **Generated** (mirror) | gitignored; fallback copies in `static/_mirror-fallback/`. |
| `src/routes/docs/reference/<category>/<slug>/+page.md` (×18+) | **Generated** (mirror) | gitignored; fallback copies in `static/_mirror-fallback/`. |
| `src/routes/blog/+page.svelte` | **Modified** | Merge hand-written + release posts; sort by date. |
| `src/routes/blog/{introducing-nkido,hot-swap-deep-dive,stereo-design,esp32-port-story}/+page.md` | **New** (3 new + 1 converted) | Launch post converted to `.md`; 3 new dev-journal posts. |
| `src/routes/blog/releases/[tag]/+page.ts` | **New** | Loads from `src/lib/data/releases.json`. |
| `src/routes/community/+page.svelte` | **Modified** | Render fetched `CONTRIBUTING.md`; link to vendored CoC. |
| `src/routes/code-of-conduct/+page.md` | **New** | Vendored Contributor Covenant 2.1. |
| `src/routes/godot/+page.svelte` | **Modified** | Beefed-up GDScript samples + troubleshooting. Still text-only. |
| `src/routes/esp32/+page.svelte` | **Modified** | Full pin/control map, ESP-IDF samples, troubleshooting. Still text-only. |
| `src/routes/sitemap.xml/+server.ts` | **Modified** | Routes list reads from a generated manifest so mirrored URLs appear. |
| `static/og-image.png` | **New** | 1200×630 PNG with logo + tagline + code snippet. |
| `static/landing-demo.png` + `@2x` | **New** | IDE screenshot for the landing-page demo block. |
| `static/_mirror-fallback/**` | **New** | Last-known-good copies of mirrored docs. |
| `scripts/fetch-mirrored-docs.ts` | **New** | Reference + tutorial fetch + frontmatter validation. |
| `scripts/fetch-contributing.ts` | **New** | Pulls `CONTRIBUTING.md` from `nkido` master; fail-loud on miss (per v1 §12.8). |
| `scripts/fetch-releases.ts` | **New** | GitHub Releases API → `src/lib/data/releases.json`. |
| `scripts/validate-frontmatter.ts` | **New** | Lints hand-authored `+page.md` frontmatter. |
| `svelte.config.js` | **Modified** | Add mdsvex preprocessor. |
| `package.json` | **Modified** | Add deps; add `prebuild`, `predev`, `postbuild` scripts. |
| `.gitignore` | **Modified** | Ignore generated mirror routes + `releases.json`. |
| `lighthouserc.json` | **New** | LHCI config. |
| `lychee.toml` | **New** | lychee config. |
| `.github/workflows/ci.yml` | **New** | Build + check + lychee + LHCI on PR. |
| `netlify.toml` | **Modified** | Inject `GITHUB_TOKEN` env var; add `/code-of-conduct` to redirect-aware routes if needed. |

---

## 8. File-Level Changes (this repo only)

The table in §7 enumerates per-file changes. No changes to the `nkido` repo are scoped here — all live-app concerns are explicit non-goals (§3.2).

---

## 9. Implementation Phases

Each phase ends in a verification step. Phases are sequential except where noted.

### Phase 1 — mdsvex migration (1 day)

**Goal**: existing hand-written content (3 concepts + launch blog post) authored as `+page.md`; build still green.

- Add `mdsvex` to `devDependencies` and configure in `svelte.config.js` with `shiki` highlighter.
- Convert `src/routes/docs/concepts/{signals,hot-swap,mini-notation}/+page.svelte` → `+page.md` with frontmatter.
- Convert `src/routes/blog/introducing-nkido/+page.svelte` → `+page.md`.
- Update `DocPage.svelte` so it can be used as a layout from `+page.md` files (mdsvex layout convention).
- Delete the converted `.svelte` files.
- Add `scripts/validate-frontmatter.ts` and wire into `prebuild`.

**Verification**: `bun run check` passes; `bun run build` produces the same set of routes; visual diff of the four converted pages matches pre-migration screenshots.

### Phase 2 — Mirror pipeline (1.5 days)

**Goal**: reference + tutorials fetched from upstream, prerendered, reachable.

- Write `scripts/fetch-mirrored-docs.ts` per §4.1.
- Hand-maintain `scripts/mirror-index.ts` listing the upstream files to fetch (13+ reference + 5 tutorials, with explicit category/slug mapping).
- Wire `prebuild` and `predev` to run the fetch.
- Commit a snapshot of every mirrored file under `static/_mirror-fallback/` (not in routes tree).
- Add `.gitignore` rules for `src/routes/docs/reference/**/+page.md` and `src/routes/docs/tutorials/**/+page.md`.
- Verify the upstream file index (count + frontmatter shape) matches expectations and document the fallback semantics in repo `README.md`.
- Replace the hand-written `src/routes/docs/tutorials/hello-sine/+page.svelte` (it'll be overwritten by the mirror).

**Verification**: with `GITHUB_TOKEN` set, `bun run build` fetches and prerenders all 18+ pages. Disabling the network: build still succeeds, falling back to `_mirror-fallback/`, with a warning in the build log.

### Phase 3 — Search (0.5 day)

**Goal**: search box in the docs sub-layout, indexes everything under `/docs/`.

- Add `pagefind` to `devDependencies`.
- Add `postbuild` script: `pagefind --site build`.
- Build `src/routes/docs/+layout.svelte` with the search box (slot for child content) and `src/lib/components/Docs/SearchBox.svelte` (Pagefind launcher).
- Tag the marketing-page layout with `data-pagefind-ignore` so non-doc content isn't indexed.

**Verification**: in a built+previewed site, typing "karplus" surfaces the relevant builtins page; typing "hot-swap" surfaces both the concept page and the dev-journal post.

### Phase 4 — Landing demo replacement (0.5 day)

**Goal**: dead-iframe placeholder replaced with static demo block.

- Capture `static/landing-demo.png` (and `@2x`) — a screenshot of the IDE running `hello-sine` with the visualizer panel visible.
- Build `src/lib/components/Home/LandingDemo.svelte` per §4.3.
- Swap `<LiveEmbed>` for `<LandingDemo>` in `src/routes/+page.svelte`.
- Delete `src/lib/components/Home/LiveEmbed.svelte`.

**Verification**: landing page renders the screenshot at full width on desktop and stacks on mobile; both CTAs click through to the right targets; no console errors; Lighthouse perf ≥ 95 on `/`.

### Phase 5 — Content beef-up (1 day)

**Goal**: launch-quality Godot + ESP32 pages, 3 dev-journal posts, single OG image, Code of Conduct.

- Rewrite `src/routes/godot/+page.svelte` with a full GDScript example (real `NkidoEngine` + `NkidoPlayer` API as it ships in the addon's MVP), troubleshooting (Godot version compatibility, `addons/` path issues, sample-rate mismatch), and a clearer link tree.
- Rewrite `src/routes/esp32/+page.svelte` with full pin/control map, real ESP-IDF + ESP-ADF commands, UART loader usage, troubleshooting (codec init failures, brown-out), and a link tree.
- Author 3 dev-journal posts as `+page.md`:
  - `/blog/hot-swap-deep-dive` — how semantic IDs preserve state.
  - `/blog/stereo-design` — designing nkido's stereo support.
  - `/blog/esp32-port-story` — what it took to fit Cedar in 146 KB.
- Add `static/og-image.png` (1200×630, hand-designed).
- Add `src/routes/code-of-conduct/+page.md` with Contributor Covenant 2.1 verbatim + a one-paragraph nkido-specific intro.
- Update footer to include the Code of Conduct link.

**Verification**: each page renders cleanly on mobile + desktop; 4 blog posts visible on `/blog`; OG preview tested via the Slack/Twitter/Discord debuggers (all show the new image).

### Phase 6 — Build-time fetches (0.5 day)

**Goal**: `CONTRIBUTING.md` and GitHub Releases pulled at build time.

- Write `scripts/fetch-contributing.ts` — pulls raw `CONTRIBUTING.md` from `mlaass/nkido@master`. **Fail-loud on miss** in CI; fall back to a vendored copy at `static/_fallback/CONTRIBUTING.md` only when running `bun run dev` locally (matches v1 §12.8).
- Update `src/routes/community/+page.svelte` to render the fetched markdown.
- Write `scripts/fetch-releases.ts` — GitHub Releases API → `src/lib/data/releases.json`.
- Add `src/routes/blog/releases/[tag]/+page.ts` and `+page.svelte` to render each release.
- Update `src/routes/blog/+page.svelte` to merge release posts with hand-written posts, sorted by date.

**Verification**: with a tagged release in the upstream repo, the release page renders and appears on the `/blog` index. Without a token in the local env, `bun run dev` succeeds using the fallback.

### Phase 7 — CI gating (0.5 day)

**Goal**: PRs blocked on Lighthouse and link-check failures.

- Add `lighthouserc.json` with thresholds from §4.4.
- Add `lychee.toml` (internal-only by default; allowlist external nkido / godot / esp32 / sponsors URLs).
- Add `.github/workflows/ci.yml`: install Bun, install lychee binary, install lhci, run `check` + `build` + `lychee` + `lhci autorun`.
- Set `GITHUB_TOKEN` secret usage for the mirror fetch in CI.

**Verification**: open a draft PR that intentionally adds a broken internal link → CI fails on lychee. Open another that drops Lighthouse perf on `/godot` (e.g. by including a 5MB image) → CI fails on LHCI.

### Phase 8 — Sitemap + launch checklist (0.25 day)

**Goal**: sitemap covers mirrored content; launch checklist re-verified.

- Modify `src/routes/sitemap.xml/+server.ts` to read a generated `src/lib/data/route-manifest.json` written by the mirror fetch (so `/docs/reference/...` and mirrored tutorial routes appear automatically).
- Walk through the v1 §14.3 launch checklist + the additions from this PRD.

**Verification**: `curl https://nkido.cc/sitemap.xml` lists all mirrored URLs; the launch checklist passes end-to-end on a fresh deploy.

---

## 10. Edge Cases

1. **GitHub raw URL returns 404 for one mirrored file** — fetch script logs the missing path loudly, falls back to the committed `_mirror-fallback/` copy for that file only, and continues. CI build does not fail. (Inverted from v1 §12.8: the cost of failing 18+ files for one missing entry is too high.)
2. **GitHub rate-limits the mirror fetch in CI** — `GITHUB_TOKEN` is required in CI; without it, fetch script aborts before partial fetches and uses fallback for everything. PR author is told via build log to set the secret.
3. **Mirrored markdown has invalid frontmatter** (missing `title`, etc.) — fetch script fails the build loudly. Forces upstream to fix the file rather than silently shipping a broken page.
4. **Upstream renames a reference file** (e.g. `synthesis.md` → `granular.md`) — `mirror-index.ts` is hand-maintained; the rename surfaces as a 404 (per case 1) until the index is updated. Acceptable for launch; long-term we could discover via API listing instead.
5. **Pagefind index includes the Code of Conduct or other administrivia** that we don't want surfaced in search results — tag the CoC page with `data-pagefind-ignore`. Pagefind respects it.
6. **`CONTRIBUTING.md` fetch fails in CI** — fail loud, **build fails** (single file, single source, recoverable by re-running). Different policy than the mirror because the impact (one missing page) is bounded and easy to fix.
7. **Dev journal post links to a builtin that has been removed upstream** — lychee won't catch it (lychee resolves URLs, not semantic content). Accepted risk; the build still succeeds and the link 404s into the standard 404 page. Mitigation: dev-journal posts link to `/docs/reference/builtins/<file>` not to specific anchors, so the page-level link survives content drift.
8. **Lighthouse score drops below 95 on a single audit run** due to network jitter — LHCI runs three iterations and uses the median per its default behavior. Set explicitly in `lighthouserc.json`.
9. **Mirror fallback files drift from upstream** — they're committed once at Phase 2 and only updated when the live fetch fails (rare). Worst case: a deploy uses 6-month-old reference docs. Mitigated by the loud build-log warning, plus: if the fetch succeeds in a subsequent deploy, the build uses the live content again.
10. **Search index includes draft / WIP content** that an author committed but didn't intend to publish — there is no draft mechanism in this PRD (all `+page.md` files are public). Authors who need a draft should keep the file in a feature branch.
11. **Returning visitor expects the iframe (from v1) and finds the screenshot** — non-issue, since v1 never publicly shipped. The screenshot is the launch baseline.
12. **OG image is cached aggressively by Slack/Twitter** — bake a `?v=1` query param into the meta-tag URLs so a new image rolls out without manual cache-busting requests to each platform.

---

## 11. Testing / Verification Strategy

### 11.1 Automated (blocking in CI)

- **`bun run check`** — type-check, must pass.
- **`bun run build`** — must succeed; mirror fetch must run; route count check (≥ 18 + 5 + 4 + 3 = 30 prerendered routes including mirrored content).
- **lychee** — broken-link check on `build/`. Internal: full graph. External: allowlist (nkido, godot-nkido-addon, cedar-esp32, github.com/sponsors/mlaass, ko-fi.com/mlaass).
- **Lighthouse CI** — `/`, `/getting-started`, `/godot`, `/esp32` (per v1 §14.1). Perf ≥ 95, A11y ≥ 95, SEO ≥ 95, Best Practices ≥ 95. Median of 3 runs.
- **Frontmatter lint** — `validate-frontmatter.ts` runs in `prebuild`; rejects any `+page.md` missing `title`/`description`/`category`.

### 11.2 Manual (run on a Netlify preview before merge to `master`)

- **Search smoke test**: type 5 representative queries (`osc`, `karplus_strong`, `hot-swap`, `tutorial`, `granular`) and verify each returns at least one expected page.
- **Mobile pass at 375px**: landing screenshot is legible (not a 16:10 letterbox); mobile nav opens; docs search modal usable.
- **Dark/light theme pass**: landing screenshot annotations remain readable in both; OG image (single PNG) acceptable in both contexts.
- **OG link unfurl**: paste `https://nkido.cc/`, `/blog/introducing-nkido`, `/docs/reference/builtins/oscillators` into Slack + Twitter + Discord debuggers. Each shows title + description + image.
- **Mirror outage simulation**: temporarily point `MIRROR_BASE_URL` to a 404 host, run `bun run build`, confirm fallback path is taken and warning appears in log.
- **Repeat the four qualitative tests from v1 §14.2**: 10-second pitch test, standalone concept-docs readability, Godot install-decision test, top-nav discoverability. Targets unchanged.

### 11.3 Launch checklist (additive to v1 §14.3)

- [ ] All v1 §14.3 boxes still pass (re-check after content/structure changes).
- [ ] `static/og-image.png` exists and renders in 3 link-unfurl debuggers.
- [ ] `static/landing-demo.png` + `@2x` exist; landing page passes Lighthouse perf ≥ 95.
- [ ] Pagefind index built; search returns results for 5 sample queries.
- [ ] Mirror has fetched at least once successfully on a real deploy (check build log).
- [ ] `_mirror-fallback/` is populated (failsafe for next deploy).
- [ ] `CONTRIBUTING.md` renders on `/community` from a live fetch.
- [ ] `/code-of-conduct` renders Contributor Covenant 2.1.
- [ ] All 4 blog posts (1 launch + 3 dev-journal) accessible from `/blog`.
- [ ] At least one GitHub Release present and rendered at `/blog/releases/<tag>`.
- [ ] `.github/workflows/ci.yml` has run successfully on a PR; lychee + LHCI both green.

---

## 12. Open Questions

1. **`mirror-index.ts` discovery vs. hand-list** — for launch, hand-list is fine (small surface). Should we plan a follow-up that auto-discovers via `GET https://api.github.com/repos/mlaass/nkido/contents/web/static/docs/reference/builtins`? Adds an API call to the fetch but eliminates manual index maintenance.
2. **Code of Conduct enforcement contact** — the vendored CoC needs an email/contact. Use `moritz.laass@gmail.com` (per existing `/community` page) or a project-specific alias?
3. **Dev-journal post authorship** — these are listed as "user authors them; PRD captures titles + outline." Is there a writing budget within this PRD's timeline, or is the PRD's deliverable a stub with `Status: draft` frontmatter that the user fills in pre-launch?
4. **Pagefind ranking weights** — default Pagefind weights treat `<title>` and headings higher than body. For reference docs, the `keywords:` frontmatter is the most important ranking signal. Should we render `keywords` into a `<meta>` tag or a hidden indexable element so Pagefind weights it appropriately?
5. **Will the mirror tutorials' frontmatter conflict with our DocPage convention?** Upstream uses `title`, `category`, `keywords`, `order` — our DocPage convention adds `description`. Either: (a) the fetch script synthesizes a `description` from the first paragraph if missing, or (b) we ask upstream to add `description:` to the 5 tutorial files. Phase 2 picks one; defaulting to (a) for non-blocking launch.

---

## 13. Future Work (deferred from this PRD)

These were considered for this PRD and explicitly deferred. Compared to v1 §17, this list is shorter — most of v1's "future work" either landed here (reference mirror, search) or remains future work for the same reasons.

1. **`live.nkido.cc/embed` route + `?docs=` deep-links** (v1 §8) — non-goal in this PRD (§3.2). Worth revisiting once v1.1 ships and we have telemetry on whether the static demo block is hurting Goal 2 conversion.
2. **Per-route OG images** — single hero shipped now; revisit if specific landing pages (e.g. `/godot`) start driving outsized social referrals.
3. **Godot/ESP32 screenshots** — text-only at launch; capture and embed once the addon UI stabilizes.
4. **`docs.nkido.cc` as separate site** — only if reference traffic dwarfs marketing.
5. **Versioned docs** — when nkido cuts a v1 / v2 split.
6. **Auto-discovery of mirrored files** (Open Question 1) — replaces hand-maintained `mirror-index.ts`.
7. **Real-time chat link** (v1 §17.6) — when a Discord/Matrix channel actually exists.
8. **Public roadmap page** (v1 §17.7) — when there's a steady release cadence to anchor it.
9. **Internationalization** (v1 §17.8) — if translators volunteer.
10. **Published shared-brand package** (v1 §17.9) — copy-on-change is still cheaper than a published package.

---

## 14. Related Work

- [`prd-project-website.md`](./prd-project-website.md) — v1 PRD; this PRD is its launch-blocker follow-up. References v1 sections by number throughout.
- `nkido/web/static/docs/DOCUMENTATION_GUIDE.md` — frontmatter conventions; the mirror fetch enforces them.
- `nkido/CONTRIBUTING.md` — fetched at build time onto `/community`.
