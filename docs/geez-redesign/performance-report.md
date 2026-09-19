# Performance report — Ge’ez redesign (static build)

**Date:** 2026-09-19  
**Environment (lab):** Windows Node 22, `npm run build` → `dist/`, no CDN, no Hostinger edge.  
**Stack:** Static HTML + CSS + small deferred JS. **No SPA hydration.**  
**Caveat:** Lab file budgets ≠ field Core Web Vitals. Real-user RUM is instrumented but **off** until product approves (`enableRum` / `__GEEZ_RUM__`).

Related: `design/perf-budget.json`, `npm run perf`, `tests/performance.test.mjs`.

---

## Before → after (lab)

| Metric (uncompressed `dist/assets`) | Before | After | Notes |
| --- | --- | --- | --- |
| Render-blocking CSS files (typical page) | 4–5 (`fonts`+`tokens`+`base`+`primitives`[+page]) | **1–2** (`site-core.css` + page CSS); fonts async | Fonts use `media="print" onload` + `<noscript>` |
| Google Fonts payload (EN) | Latin **+ Ethiopic** via single `@import` | **Latin only** | Ethiopic only on `am`/`ti` |
| Font loading | Blocking `@import` in CSS | `preconnect` + async stylesheet links | Still third-party until self-host |
| Sitewide JS | `locale-preference` (+ consent on non-home) | Same + consent on **homepage** too | All `defer` |
| Hydration / framework JS | None | None | N/A |
| Images in repo | None (CSS hero mark / placeholders) | Helpers ready for AVIF/WebP `picture` | No binary assets yet |
| Caching headers in repo | None | `dist/_headers` | Hostinger WP may ignore — map manually |

Measured after build (`npm run perf`, 2026-09-19): **JS 23 727 B** / **CSS 28 009 B** uncompressed under `dist/assets`. Budgets leave headroom for self-hosted woff2 later.

| Representative page | Blocking CSS | Deferred JS | HTML bytes |
| --- | --- | --- | --- |
| home | 3 | 2 | 12 914 |
| service | 4 | 2 | 11 878 |
| case-study | 4 | 2 | 6 753 |
| article | 4 | 2 | 14 751 |
| form | 4 | 3 (`fit-form`) | 13 301 |

---

## Representative pages checked

| Page | Path | Likely LCP | INP notes |
| --- | --- | --- | --- |
| Homepage | `/` | H1 / hero mark (CSS) | Low JS |
| Service | `/services/start-a-business/` | H1 | Accordion = native |
| Case study | `/client-results/jonas-…/` | Placeholder media (aspect-ratio) | Draft/noindex |
| Article | `/resources/…checklist/` | H1 / outline | No heavy widgets |
| Form | `/book-a-fit-call/` | H1 / form | `fit-form.js` deferred, page-only |

---

## Optimizations shipped

1. **Fonts:** Split `fonts-latin.css` / `fonts-ethiopic.css`; locale-conditional Ethiopic; preconnect; non-blocking load with noscript fallback; `display=swap`.  
2. **CSS:** Build concatenates `tokens`+`base`+`primitives` → `site-core.css` (fewer round-trips).  
3. **Images:** `content/lib/images.mjs` — `picture` + AVIF/WebP candidates, explicit width/height, lazy vs `fetchpriority=high` for hero; CLS-safe placeholders.  
4. **JS:** Page-scoped form/finder scripts; deferred consent + locale; optional privacy-safe RUM (`web-vitals-rum.js`) gated by feature flag + analytics consent.  
5. **Caching:** `site/perf/_headers` copied to `dist/_headers` (immutable `/assets/*`).  
6. **CI budgets:** `npm run perf` / `tests/performance.test.mjs`.

---

## Budgets (CI)

From `design/perf-budget.json`:

| Budget | Limit |
| --- | --- |
| Total JS | 45 KB |
| Total CSS | 45 KB |
| Max single JS | 16 KB |
| Max single CSS | 20 KB |
| Max HTML page | 50 KB |
| Max blocking stylesheets | 4 |
| Sync scripts in `<head>` | 0 |

Image weight budget (250 KB/candidate) applies when media files are added to the build.

---

## Field vs lab

- **Lab:** File sizes + HTML request shape on local build. axe/Lighthouse not required for this gate; add Playwright Lighthouse later if desired.  
- **Field:** CWV depend on Hostinger TTFB, Google Fonts RTT, and (future) image CDN. Self-host + subset fonts before claiming production LCP wins.  
- **RUM:** Disabled by default. When approved, set `enableRum: true` in `renderDocument` / homepage and ensure `/api/rum/` exists; payloads omit PII (metric name/value/id only) and require analytics consent.

---

## Remaining third-party / host constraints

| Constraint | Impact | Mitigation |
| --- | --- | --- |
| Google Fonts CSS `@import` / CSS2 API | Extra DNS/TLS; still largest external dependency | Self-host woff2 with `unicode-range` (documented in font CSS) |
| Hostinger WordPress production | May not honor `dist/_headers` | Map Cache-Control in hPanel / `.htaccess` / CDN |
| No image CDN yet | Future LCP when photos ship | Emit AVIF/WebP via `buildImageCandidates`; lazy below-fold |
| WPForms / reCAPTCHA on live WP | Not in redesign `dist/` | Keep out of critical path; consent-gate if reintroduced |
| Analytics | None loaded | Consent gate already required |

---

## Accessibility guardrails

Async fonts keep system-ui readable (no invisible text). Skip link, focus rings, and contrast tokens unchanged. Image helper never invents alt text. Placeholders expose accessible names.

---

## How to re-run

```bash
npm run build
npm run perf
npm test
```
