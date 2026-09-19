# Release readiness — Ge’ez redesign (release candidate)

**Date executed:** 2026-09-19  
**Workspace:** `GEEZ Consulting (Updated)` static redesign build → `dist/`  
**Verdict:** **NOT READY TO DEPLOY**  
**Rule:** Do not deploy while any **P0** item or **unverified public claim** remains. This build correctly keeps all public surfaces `noindex` until claims and locale approvals land; that is a gate, not a green light to replace live WordPress.

| Severity | Meaning |
| --- | --- |
| **P0** | Blocks any production cutover / indexable publish |
| **P1** | Blocks claiming full product readiness (EN/AM/TI parity, ops hardening) |
| **P2** | Follow-up after controlled launch of approved slices |

**Owners (default):** Eng = redesign engineering; Founder = Saba / business owner; Counsel = external privacy counsel; Ops = Hostinger/WP admin + lead inbox owner; Native = AM/TI native reviewers.

---

## Executive summary

| Area | Result | Notes |
| --- | --- | --- |
| Functionality (lab) | **Pass** | Build + 137 tests incl. intake E2E (validation, honeypot, rate limit, provider 502, thank-you) |
| Content / claims | **Blocked (P0)** | Ledger CL-001…CL-025 almost entirely `UNVERIFIED`; routes all `draft` / `indexable: false` |
| Localization | **Blocked (P0/P1)** | AM/TI interim / `translation-status=pending`; native queue not `approved` |
| SEO | **Pass (safe draft)** / **Blocked (go-live)** | Empty sitemap, robots OK, hreflang/canonical present; no indexable URLs by design |
| Accessibility | **Pass (automated)** / **Blocked (AT claim)** | axe High issues: 0; NVDA/VoiceOver + full keyboard matrix not completed |
| Performance | **Pass (lab)** | JS 38 522 B / CSS 28 009 B within budgets; field CWV unproven |
| Privacy | **Pass (code)** / **Blocked (counsel)** | Consent gate + sanitizers; counsel/processor TODOs open |
| Analytics | **Pass (schema)** / **Blocked (ops sink)** | First-party events + zero-PII tests; `/api/analytics/` not on host |
| Operations | **Blocked (P0)** | Lead routing, SMTP, monitoring, rollback ownership unverified |

**Deploy decision:** **Do not deploy** this redesign as the public site, and do not flip any route to `published` / `index,follow` until P0 rows below are remediated.

---

## Environment & evidence captured

| Check | Command / artifact | Result |
| --- | --- | --- |
| Lint | `npm run lint` | Pass — 72 JS modules + content/route validate |
| Types | `npm run typecheck` | Pass |
| Production build | `npm run build` | Pass — **60 pages**, **sitemap URLs: 0** |
| Unit / integration / E2E | `npm test` | Pass — **137 / 137** |
| Perf budgets | `npm run perf` | Pass — JS 38522, CSS 28009 |
| A11y sample audit | `npm run a11y` | Pass — **High issues: 0** (20 pages); evidence `docs/geez-redesign/a11y-evidence/axe-structural-2026-09-19.json` |
| Content + routes | `npm run validate` | Pass — locales en/am/ti; **19 routes × 3**; **25 redirects** defined |
| Dist claim leak | ripgrep `TODO_VERIFICATION` under `dist/` | Pass — **0 matches** |
| Dist robots | `dist/` HTML | **66** `noindex` hits; **0** `index,follow` |
| Dist images | binary media under `dist/` | **0** image files (CSS/placeholder heroes only — no broken `<img>` src found) |
| Organization JSON-LD | EN home | **Omitted** until NAP approved (expected) |

---

## Checklist results

Status values: **Pass** | **Fail** | **Blocked**. Evidence is lab/workspace unless noted. Field Hostinger/WP checks that were not executed are **Blocked**, not Pass.

### 1. Functionality

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | Production build succeeds | **Pass** | — | `Built 60 pages → dist/` | Eng | — |
| F-02 | Lint + typecheck | **Pass** | — | Lint OK; Typecheck OK | Eng | — |
| F-03 | Unit/integration/E2E suite | **Pass** | — | `# pass 137` / `# fail 0` | Eng | Keep `--test-concurrency=1` until dist race is eliminated |
| F-04 | Navigation + primary CTA present | **Pass** | — | Header/footer + `data-geez-cta` on Fit Call links in rendered HTML | Eng | — |
| F-05 | Service finder recommend path | **Pass** | — | `tests/intake.e2e.test.mjs` + `service-finder.js` | Eng | — |
| F-06 | Fit Call validation / honeypot / rate limit | **Pass** | — | Intake E2E | Eng | — |
| F-07 | Email/provider failure → 502 + user message | **Pass** | — | E2E asserts `502` / `provider_failure`; no silent success | Eng | Map real WPForms/SMTP provider before cutover (see O-02) |
| F-08 | Thank-you flow (`noindex`, no SLA claim) | **Pass** | — | Thank-you contract tests + `robots.txt` Disallow thank-you | Eng | — |
| F-09 | All route status codes on live host | **Blocked** | P0 | Not executed against Hostinger; redesign is static `dist/` only | Ops | After staging deploy: curl matrix for EN/AM/TI routes → expect 200 for published shells, 301 for `legacy-redirects.json`, 404 only for unknown |
| F-10 | Legacy redirects live | **Blocked** | P0 | 25 redirects in data (`Routing OK: … 25 redirects`); **not applied** on host in this pass | Ops | Implement `content/data/shared/legacy-redirects.json` via Redirection plugin / server rules; QA each `from` → `to` |

### 2. Content & claims

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| C-01 | No `TODO_VERIFICATION` string in production HTML | **Pass** | — | Dist scan empty; pending claims render as omitted / “Pending verification” | Eng | Keep production gate on |
| C-02 | No draft/unverified claim published as indexable fact | **Pass** (gate) / **Blocked** (launch) | P0 | All routes `status: draft`, `indexable: false`; sitemap empty | Founder + Eng | Verify ledger rows; set `ClaimField.approvalStatus=approved` + real `source` + `lastReviewed`; only then flip route `published` |
| C-03 | Claims ledger verified | **Fail** | P0 | `claims-ledger.md`: CL-001–004, 006–025 **UNVERIFIED** (CL-005 REMOVE only) | Founder | Close each UNVERIFIED row with evidence; no invented NAP, credentials, logos, outcomes |
| C-04 | Approved testimonials / logos / photos only | **Pass** (omission) / **Blocked** (marketing ask) | P0 | Build notes: proof omitted; CL-001/002/025 UNVERIFIED; 0 media files in `dist/` | Founder | Complete interview + case-study checklist; rights for photos/logos; then enable |
| C-05 | Service / disclaimer scope (no outcome guarantees) | **Pass** (copy posture) | P1 | Safe copy + tests forbid guarantee language; CL-014/015 still UNVERIFIED for final wording | Founder | Approve CL-014/015 before indexable service pages |
| C-06 | Technology partner name not leaked | **Pass** | — | Build note + Technology Support draft/noindex; CL-016 UNVERIFIED | Founder | Approve CL-016 before naming partner publicly |

### 3. Localization (EN / AM / TI)

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| L-01 | Locale route parity in build | **Pass** | — | 60 pages across en/am/ti; route validate OK | Eng | — |
| L-02 | `html lang` + hreflang clusters | **Pass** | — | EN/AM/TI + `x-default` on home samples | Eng | — |
| L-03 | Incomplete locales stay noindex | **Pass** | — | AM home: `noindex` + `geez:translation-status=pending` | Eng | Do not remove until native approve |
| L-04 | Native-review status complete | **Fail** | P0 | `translation-work-queue.md`: rows `needs_translation` / `blocked_on_en_approval`; localization-qa checkboxes unchecked | Native + Founder | Run `localization-qa.md` per surface; mark queue `approved` + `lastReviewed` |
| L-05 | True AM/TI product parity (not EN interim) | **Blocked** | P1 | Interim EN with `lang="en"` wrappers expected for drafts | Native | Translate Fit Call, FAQs, services, nav, emails after EN claim approval |
| L-06 | Ethiopic fonts on AM/TI only | **Pass** | — | Perf tests: EN no ethiopic CSS; AM loads both | Eng | Self-host woff2 later (P2) |

### 4. SEO

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| S-01 | Canonical tags | **Pass** | — | Present on sampled pages | Eng | — |
| S-02 | Hreflang reciprocity | **Pass** | — | en/am/ti + x-default | Eng | Re-verify when Ethiopic slugs launch |
| S-03 | `robots.txt` | **Pass** | — | Allows `/`; Disallow thank-you locales; points at sitemap | Eng | — |
| S-04 | Sitemap only indexable URLs | **Pass** | — | Empty `<urlset>` while all draft | Eng | Populate only after `published` + approved content |
| S-05 | Metadata / social cards | **Pass** (structure) | P1 | OG title/description/locale present; OG images largely unset (CL-021 UNVERIFIED) | Founder + Eng | Approve titles/descriptions/images per locale before index |
| S-06 | Schema.org | **Pass** (safe) | P1 | No Organization until NAP; Service graph without Offer; drafts skip Article | Eng | Emit Organization only after CL-006–013 verified |
| S-07 | Broken links (internal) | **Blocked** | P1 | Automated link crawl of live host not run; lab links are relative IA paths | Eng | Staging crawl (e.g. lychee/wget) after Hostinger stage URL exists |
| S-08 | Missing images | **Pass** | — | No `<img>` candidates without files in current dist; placeholders used | Eng | When media ships, require width/height + AVIF/WebP helpers |

### 5. Accessibility

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | Automated axe + structural (samples) | **Pass** | — | High issues: 0 / 20 pages | Eng | Re-run `npm run a11y` on every RC |
| A-02 | Keyboard smoke | **Blocked** | P1 | Partial (focusable controls); full page matrix pending per `accessibility-audit.md` | Eng | Documented keyboard pass: skip → nav → lang → CTA → form errors → finder result |
| A-03 | Screen-reader smoke (NVDA/VO) | **Blocked** | P1 | Explicitly not completed | Eng + Founder | 60–90 min EN Fit Call + AM home with NVDA; VO+Safari spot-check |
| A-04 | Mobile / desktop reflow | **Blocked** | P1 | CSS rules present; full 320–1440 matrix pending | Eng | Capture screenshots at 320/390/768/1280 for home, service, fit form |
| A-05 | Major browsers | **Blocked** | P1 | Not executed (Chrome-only spot notes historically) | Eng | Chrome + Firefox + Safari (mac/iOS) + Edge on staging |

### 6. Performance

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| P-01 | Lab JS/CSS budgets | **Pass** | — | `npm run perf` OK | Eng | — |
| P-02 | Font / CSS request shape | **Pass** | — | `site-core` + async fonts; see `performance-report.md` | Eng | — |
| P-03 | Field LCP/INP/CLS | **Blocked** | P1 | RUM off; no Hostinger field data | Eng | Enable privacy-safe RUM only after approval; 28-day baseline |
| P-04 | Caching headers on host | **Blocked** | P2 | `dist/_headers` present; Hostinger may ignore | Ops | Map Cache-Control in hPanel/CDN |

### 7. Privacy & consent

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| PR-01 | Analytics scripts consent-gated | **Pass** | — | `type="text/plain" data-geez-consent="analytics"` | Eng | — |
| PR-02 | Fit Call marketing optional | **Pass** | — | Privacy tests | Eng | — |
| PR-03 | PII denylist / redaction | **Pass** | — | `sanitizeAnalyticsEvent` + intake redaction tests | Eng | — |
| PR-04 | Privacy notice / processors counsel-ready | **Blocked** | P0 | `privacy-review.md` unresolved counsel list; Hostinger DPA / SMTP / retention **TODO_VERIFICATION** | Counsel + Founder | Answer counsel questions 1–10; name processors; publish approved `/privacy/` before marketing emails |
| PR-05 | CASL marketing program | **Blocked** | P1 | Code records consent; live CEM program not approved | Counsel + Founder | No commercial email until counsel + unsubscribe ops confirmed |

### 8. Analytics / measurement

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| M-01 | Typed events defined + tested | **Pass** | — | `measurement.test.mjs`; plan in `measurement-plan.md` | Eng | — |
| M-02 | Zero PII in event payloads | **Pass** | — | Automated payload tests; phone click omits number | Eng | — |
| M-03 | Debug mode | **Pass** | — | `?geez_debug_analytics=1` documented | Eng | — |
| M-04 | Production sink `/api/analytics/` | **Blocked** | P1 | Client beacons; host endpoint missing | Ops + Eng | Implement first-party collector + retention; keep consent gate |
| M-05 | Conversion uplift claims | **Pass** (policy) | — | Plan forbids claims until 28-day baseline | Founder | Do not market “improved conversions” yet |

### 9. Operations

| ID | Check | Status | Sev | Evidence | Owner | Exact remediation |
| --- | --- | --- | --- | --- | --- | --- |
| O-01 | Rollback plan documented & owned | **Fail** | P0 | No named rollback owner/runbook in repo for WP cutover | Ops + Founder | Write 1-page runbook: keep prior WP theme/backup; DNS/host restore steps; who executes; RTO target |
| O-02 | Lead routing ownership | **Fail** | P0 | Intake provider + staff inbox **TODO_VERIFICATION** (CL-008 related) | Founder + Ops | Name monitored inbox; map WPForms 1235 → Fit Call contract; test 3 real submissions |
| O-03 | Form monitoring | **Blocked** | P0 | No uptime/alert on `/api/fit-call/` or WPForms | Ops | Alert on 5xx rate / zero submissions / provider_failure logs (redacted) |
| O-04 | Error monitoring | **Blocked** | P1 | No Sentry/host log dashboard wired | Ops | Hostinger error log review cadence or approved error tool (privacy-reviewed) |
| O-05 | CRM stage handoff discipline | **Pass** (spec) / **Blocked** (adoption) | P1 | `buildCrmStageHandoff` + measurement plan | Founder | Train staff on stages + loss codes; no free-text PII in analytics |

---

## P0 open items (must clear before deploy)

1. **Claims:** Verify or remove UNVERIFIED ledger rows that would appear on any published page (minimum for a soft launch: CL-006–008 contact, CL-011 brand/legal, CL-014–015 services/disclaimers, CL-018 privacy, CL-024 no SLA).  
2. **Indexability:** Keep `draft`/`noindex` until (1) is done; do not publish empty sitemap URLs.  
3. **Native AM/TI:** Either keep noindex (current) or complete native review before claiming multilingual launch.  
4. **Lead path:** Confirm inbox + WPForms/SMTP mapping + HTTPS + failure monitoring.  
5. **Privacy counsel:** Processor list, retention, privacy contact — before marketing consent emails.  
6. **Rollback owner:** Named person + restore procedure for Hostinger/WP.  
7. **Legacy redirects:** Apply 25 documented redirects on the host before swapping IA.

---

## What may ship later as a controlled slice (still no full cutover)

If product insists on a **staging-only** Hostinger preview:

- Deploy `dist/` behind auth / noindex (already default).  
- Exercise Fit Call against staging provider.  
- Do **not** submit sitemap to GSC.  
- Do **not** remove live Elementor home until P0 cleared.

---

## Sign-off

| Role | Name | Date | Decision |
| --- | --- | --- | --- |
| Engineering RC executor | (this checklist run) | 2026-09-19 | **Blocked — do not deploy** |
| Founder / product | _pending_ | | |
| Privacy counsel | _pending_ | | |
| Ops / hosting | _pending_ | | |

---

## Related docs

- `claims-ledger.md`, `localization-qa.md`, `translation-work-queue.md`  
- `privacy-review.md`, `intake-data-flow.md`, `measurement-plan.md`  
- `accessibility-audit.md`, `performance-report.md`, `local-seo-operations.md`  
- `information-architecture.md`, `content/data/shared/routes.json`, `content/data/shared/legacy-redirects.json`

---

## Re-run commands

```bash
npm run lint && npm run typecheck && npm run build
npm test
npm run perf
npm run a11y
npm run validate
```

Update this file’s **Verdict** only when every **P0** row is Pass and no unverified claim is set `index,follow`.
