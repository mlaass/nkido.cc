# PRD: Newsletter Signup on the Landing Page

> **Status: NOT STARTED** — Add an email mailing-list signup below the hero on `nkido.cc` so visitors can subscribe to product updates and new developments. Submissions go to a same-origin Netlify Function that forwards to a Resend audience (provider isolated behind one module so it stays swappable). A general `/privacy` page backs the GDPR consent checkbox.

---

## 1. Executive Summary

The landing page has no way for interested visitors to stay informed. This PRD adds an **email signup section directly below the hero** on `nkido.cc/`, letting visitors subscribe to occasional updates ("stay in the loop" — no committed cadence). The site is a fully static SvelteKit build (`@sveltejs/adapter-static`) deployed on Netlify with a strict CSP, so signup is handled by a **same-origin Netlify Function** that keeps the provider API key server-side and forwards the address to a **Resend audience**.

Key decisions made during planning:

- **Placement: below the hero.** A new `NewsletterSignup.svelte` is inserted immediately after `<Hero />` on the home page.
- **Email only, single field.** Lowest friction; Resend needs only the address.
- **GDPR consent checkbox + privacy note,** with a link to a **new general site `/privacy` page** (also covers GoatCounter analytics and Resend processing).
- **Same-origin Netlify Function** at `/api/subscribe` → `/.netlify/functions/...`. Because it's same-origin, the existing CSP `connect-src 'self'` already permits it — **no CSP change required.**
- **Resend by default, provider swappable.** Mirrors the proven pattern in `autorec/license-server` (`getContact` → `addContactToAudience`, idempotent). All provider-specific calls live in one module so MailChimp/etc. can replace it without touching the handler or the UI.
- **Stub mode until env vars are set.** When `RESEND_*` env vars are absent, the function validates the email, logs a warning, and returns success — so the full UX is testable pre-launch and no real data is stored until the provider is wired.
- **Honeypot + server-side validation** for spam protection. No third-party captcha, no CSP impact.

---

## 2. Current State

| Surface | Today | After this PRD |
|---|---|---|
| Landing page | `Hero → PreReleaseNotice → ExampleSelector → FeatureGrid → RunsEverywhere → OverviewGrid` | Same, with `NewsletterSignup` inserted directly after `Hero` |
| Email capture | None | `NewsletterSignup.svelte` form → `/api/subscribe` |
| Backend | Static only; no functions | One Netlify Function forwarding to Resend (stubbed until env set) |
| Privacy/legal | No `/privacy` route | New general `/privacy` page (newsletter + analytics + data handling) |
| CSP | `connect-src 'self' https://nkido.goatcounter.net` | Unchanged — function is same-origin |
| Netlify config | `[build]` + redirects + headers only | Adds `[functions]` block and an `/api/*` redirect |

### 2.1 Constraints discovered

- `netlify.toml` publishes the static `build/` dir; adapter is `adapter-static`. Netlify Functions deploy independently of `publish`, so the static prerender is unaffected.
- Strict CSP in `netlify.toml`. The function endpoint is same-origin (`nkido.cc/.netlify/functions/...`), already covered by `connect-src 'self'`. A client-side POST to an external provider would have required a CSP edit — the function avoids that.
- Design tokens live in `src/app.css` (`--accent-primary`, `--bg-secondary`, `--border-muted`, `--spacing-*`, `--max-width`, `--content-padding`, `--transition-fast`, etc.). The component reuses these, matching `FeatureGrid.svelte` / `Footer.svelte`.

---

## 3. Goals and Non-Goals

### 3.1 Goals

1. **Collect email subscribers** from the landing page below the hero.
2. **Keep the provider key server-side** via a same-origin Netlify Function.
3. **Default to Resend**, reusing the audience/idempotency pattern already operated in `autorec/license-server`.
4. **Isolate the provider** behind a single module so it can be swapped (MailChimp, Buttondown, etc.) without UI or handler changes.
5. **GDPR-conscious UX**: required consent checkbox + privacy note linking to a new `/privacy` page.
6. **Testable before a provider is live** via stub mode (log + success when env vars absent).
7. **Spam-resistant** via honeypot + server-side email validation.
8. **No CSP regression**, no change to the static-prerender pipeline.

### 3.2 Non-Goals

1. **Sending newsletters / drip automations** — this PRD only captures subscribers. Composing and sending campaigns is done in the Resend dashboard / a future PRD. (Unlike autorec, no `sendEvent` nurture trigger is included.)
2. **Name or other fields** — email only.
3. **Double opt-in flow customization** — rely on Resend's audience behavior; not custom-built here.
4. **A subscriber dashboard / count display** on the site.
5. **Rate limiting** — honeypot only for v1 (flagged as future hardening).
6. **Impressum / full German legal notice** — `/privacy` is a general privacy policy; a separate Impressum is out of scope (flagged below).
7. **Signup in the footer or hero** — single placement below the hero only.
8. **Analytics on conversion** beyond what GoatCounter already captures.

---

## 4. Target Experience

**Visitor lands on `nkido.cc/`:**

1. Sees the hero, then immediately below it a compact "Stay in the loop" section: a short heading, one-line description, an email input, a subscribe button, and a consent checkbox with a link to `/privacy`.
2. Enters an email, ticks the consent box, clicks **Subscribe**.
3. Button enters a loading state; on success the form is replaced by a confirmation message ("Thanks — you're on the list."). On error, an inline message appears and the form stays filled for retry.
4. If the consent box is unticked, the submit button is disabled (or submission is blocked with an inline prompt).
5. A bot that fills the hidden honeypot field is silently rejected server-side (still returns a success-looking response).

### 4.1 UI states

| State | Trigger | UI |
|---|---|---|
| Idle | Initial | Email field + checkbox + enabled/disabled button |
| Invalid | Bad email format on blur/submit | Inline validation message; no request sent |
| Consent missing | Box unticked | Button disabled; helper text |
| Submitting | Valid submit | Button shows spinner/“Subscribing…”, field disabled |
| Success | `{ subscribed: true }` (incl. `already: true`) | Form replaced by confirmation message |
| Error | Network / `4xx`/`5xx` | Inline error ("Something went wrong — try again"), form preserved |

> `already: true` (address already subscribed) is presented as success — we do not reveal membership status.

---

## 5. Target Syntax / Interfaces

### 5.1 Client → function request

```http
POST /api/subscribe
Content-Type: application/json

{ "email": "user@example.com", "company": "" }   // `company` = honeypot, must be empty
```

### 5.2 Function responses (mirrors autorec/license-server shapes)

```json
{ "subscribed": true, "already": false }   // 200 — newly added
{ "subscribed": true, "already": true }    // 200 — already on the list
{ "error": "invalid_email" }                // 400
{ "error": "malformed_json" }               // 400
{ "error": "rejected" }                     // 200/400 — honeypot tripped (treated as benign)
{ "error": "upstream_error" }               // 502 — Resend failed
```

> **Stub mode:** when `RESEND_API_KEY` / `RESEND_AUDIENCE_ID` are unset, the function returns `{ "subscribed": true, "already": false }` after logging `[subscribe] no provider configured — email not stored`. (This deliberately differs from autorec's `server_misconfigured` 500: pre-launch we want the UX to work without storing data.)

### 5.3 Provider module contract (swappable seam)

```ts
// netlify/functions/lib/provider.ts — the ONLY file that knows about Resend.
export interface SubscribeResult { ok: boolean; already: boolean; status: number }
export async function subscribe(email: string): Promise<SubscribeResult>
// Default impl: getContact() → addContactToAudience(), copied/adapted from
// autorec/license-server/src/lib/resend.ts. Swapping to MailChimp = rewrite this file only.
```

---

## 6. Architecture / Technical Design

```
Browser (static page)                     Netlify
┌─────────────────────────┐               ┌──────────────────────────────┐
│ NewsletterSignup.svelte │  POST         │ /.netlify/functions/subscribe│
│  email + honeypot +     │ ───/api/───▶  │  1. parse + validate email   │
│  consent checkbox       │  subscribe    │  2. honeypot check           │
│                         │ ◀──JSON────── │  3. provider.subscribe()     │──▶ Resend API
└─────────────────────────┘               │     (stub if env unset)      │   (audiences)
        same-origin → CSP 'self' OK        └──────────────────────────────┘
```

- **Function runtime:** Netlify Functions, `node_bundler = "esbuild"`, `directory = "netlify/functions"` — identical to `autorec/license-server/netlify.toml`. A single small handler (plain function handler is sufficient; Hono is optional, only one route).
- **Routing:** `/api/*` → `/.netlify/functions/:splat` redirect (status 200) so the client calls a clean `/api/subscribe`.
- **Validation:** reuse the permissive regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`, trim + lowercase, reject `> 320` chars.
- **Idempotency:** `getContact` before `addContactToAudience`; existing contact → `already: true`.
- **Secrets:** `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` set in Netlify env (not committed).

---

## 7. Impact Assessment

| Component | Status | Notes |
|---|---|---|
| `src/routes/+page.svelte` | **Modified** | Import + render `<NewsletterSignup />` after `<Hero />` |
| `src/lib/components/Home/NewsletterSignup.svelte` | **New** | Form UI, states, calls `/api/subscribe` |
| `src/routes/privacy/+page.svelte` | **New** | General privacy policy page |
| `netlify/functions/subscribe.ts` | **New** | Handler: validate, honeypot, call provider |
| `netlify/functions/lib/provider.ts` | **New** | Resend impl (swap seam); adapted from autorec `resend.ts` |
| `netlify.toml` | **Modified** | Add `[functions]` block + `/api/*` redirect |
| CSP in `netlify.toml` | **Stays** | Same-origin POST already allowed by `connect-src 'self'` |
| `src/app.css` | **Stays** | Reuse existing tokens; no new globals |
| `Footer.svelte`, `Hero.svelte` | **Stays** | Untouched |

---

## 8. File-Level Changes

| File | Change |
|---|---|
| `src/lib/components/Home/NewsletterSignup.svelte` | New. Email input + honeypot + consent checkbox + submit; idle/submitting/success/error states; scoped styles using design tokens (match `FeatureGrid.svelte`). Posts JSON to `/api/subscribe`. |
| `src/routes/+page.svelte` | Add `import NewsletterSignup` and place `<NewsletterSignup />` directly under `<Hero />`. |
| `src/routes/privacy/+page.svelte` | New prerendered page: data collected (email), processor (Resend), analytics (GoatCounter), unsubscribe, contact. Linked from the consent note and (optionally) the footer. |
| `netlify/functions/subscribe.ts` | New. Parse/validate body, honeypot reject, delegate to `lib/provider.subscribe`, map to response shapes; stub when env unset. |
| `netlify/functions/lib/provider.ts` | New. Resend `getContact`/`addContactToAudience` adapted from `autorec/license-server/src/lib/resend.ts`; exposes `subscribe(email)`. |
| `netlify.toml` | Add `[functions] directory="netlify/functions" node_bundler="esbuild"` and `[[redirects]] /api/* → /.netlify/functions/:splat (200)`. |
| `src/lib/components/Layout/Footer.svelte` | Optional: add a `/privacy` link alongside Community/Press/GitHub. |

---

## 9. Implementation Phases

**Phase 1 — UI + stub (testable end-to-end).**
Build `NewsletterSignup.svelte`, place it under the hero, add the `/api/subscribe` function in **stub mode** (log + success), wire `netlify.toml`. Verify all UI states locally.

**Phase 2 — Privacy page + consent wiring.**
Add `src/routes/privacy/+page.svelte`, link it from the consent note (and optionally the footer). Confirm the consent checkbox gates submission.

**Phase 3 — Resend integration.**
Add `lib/provider.ts` (adapt autorec `resend.ts`), set `RESEND_API_KEY` + `RESEND_AUDIENCE_ID` in Netlify env, create the Resend audience. Function leaves stub mode automatically once env vars exist. Verify a real subscribe lands in the audience and a repeat returns `already: true`.

**Phase 4 (future) — Hardening.**
Optional rate limiting, optional Impressum page, optional analytics on conversion. Out of scope for v1.

---

## 10. Edge Cases

| Input / Situation | Expected behavior |
|---|---|
| Invalid email format | Client inline validation; if it reaches the function, `400 invalid_email`. |
| Empty / malformed JSON body | `400 malformed_json`. |
| Honeypot field populated | Treated as bot: not forwarded to provider; benign response (no error surfaced to a real user). |
| Email already in audience | `200 { subscribed: true, already: true }`; shown as success, membership not revealed. |
| Env vars missing (pre-launch) | Stub: log warning, return success; nothing stored. |
| Resend API failure / timeout | `502 upstream_error`; UI shows retry-able error. |
| Consent box unticked | Submission blocked client-side; button disabled. |
| Double submit / rapid clicks | Button disabled while submitting; single request. |
| Very long email (>320 chars) | Rejected as `invalid_email`. |
| JS disabled | Form does not submit (acceptable; no-JS fallback is a non-goal). Flagged. |

---

## 11. Testing / Verification Strategy

**Local UI (Phase 1–2):**
- `bun run dev`; load `/`, confirm the section renders below the hero and matches the visual style (tokens, spacing, dark/light).
- Exercise each state: invalid email, missing consent, submitting, success, error (point `/api/subscribe` at a local stub or use `netlify dev`).
- Verify `/privacy` prerenders and the consent link resolves.

**Function (Phase 1 & 3):**
- `netlify dev` → `curl -X POST localhost:8888/api/subscribe -d '{"email":"a@b.com"}'` returns `subscribed:true`.
- Honeypot: `{"email":"a@b.com","company":"x"}` → not forwarded.
- Invalid: `{"email":"nope"}` → `400 invalid_email`; bad JSON → `400 malformed_json`.
- Stub mode: with env unset, confirm success + the `[subscribe] no provider configured` log.
- Phase 3: with real env vars, subscribe a test address, confirm it appears in the Resend audience; repeat → `already:true`.

**Build / deploy:**
- `bun run build` succeeds; static prerender unaffected.
- Confirm CSP unchanged and the same-origin POST is not blocked in the browser console on the deployed Netlify preview.

---

## 12. Open Items

- **[OPEN]** Resend audience must be created and `RESEND_AUDIENCE_ID` recorded before Phase 3.
- **[OPEN]** Exact `/privacy` copy (data controller name/address, contact email) — needs the user's legal details.
- **[OPEN — future]** Impressum page (German law) intentionally deferred.
- **[OPEN — future]** Rate limiting beyond honeypot.
