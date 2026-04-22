# nkido.cc

Project website for [NKIDO](https://github.com/mlaass/nkido) — high-performance live-coded
audio synthesis. Lives at <https://nkido.cc>. The browser IDE lives separately at
<https://live.nkido.cc>.

## Stack

- SvelteKit + `@sveltejs/adapter-static` (everything is prerendered).
- Svelte 5 runes.
- Bun as the package manager.
- Netlify for hosting; analytics via GoatCounter.
- No mdsvex yet — content pages are `.svelte` with markdown-styled HTML inside the
  shared `DocPage` component (`src/lib/components/Docs/DocPage.svelte`).

## Develop

```bash
bun install
bun run dev      # vite dev server
bun run check    # svelte-check
bun run build    # outputs build/
bun run preview  # serve the built site
```

## Layout

```
src/
├── app.css                       Design tokens (copy of nkido/web/src/app.css; sync manually)
├── app.html                      GoatCounter snippet lives here
├── lib/
│   ├── components/
│   │   ├── Docs/DocPage.svelte   Shared layout for concept / tutorial / blog content
│   │   ├── Home/                 Landing-page sections (Hero, LiveEmbed, FeatureGrid, …)
│   │   ├── Layout/               Header (with mobile hamburger) + Footer
│   │   └── Logo/Logo.svelte      Vendored from nkido/web/
│   └── data/posts.ts             Hand-written blog post index
└── routes/
    ├── +page.svelte              Landing page
    ├── docs/concepts/<slug>/     Concept pages (signals, hot-swap, mini-notation)
    ├── docs/tutorials/<slug>/    Tutorial pages (hello-sine)
    ├── blog/<slug>/              Hand-written posts
    ├── godot/                    Godot addon page
    ├── esp32/                    ESP32 port page
    └── sitemap.xml/+server.ts    Generated sitemap (route list maintained by hand)
```

## Live IDE embed

`src/lib/components/Home/LiveEmbed.svelte` is a click-to-activate iframe that loads
`https://live.nkido.cc/embed?patch=<name>`. The `/embed` route on the live IDE is
specified in `docs/prd-project-website.md` §8 and ships in the `nkido` repo, not here.
Until that route exists, the iframe will show the live IDE's normal entry point or
fall back to the "open in a new tab" link after 8 s.

## License

[MIT](./LICENSE).
